package cartesia

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"
	"sync/atomic"
	"time"

	"github.com/gorilla/websocket"

	"github.com/yourusername/ai-voice-agent/internal/logger"
)

// Client handles Cartesia TTS streaming
type Client struct {
	apiKey         string
	defaultVoiceID string
}

// NewClient creates a new Cartesia client
func NewClient(apiKey, defaultVoiceID string) *Client {
	return &Client{
		apiKey:         apiKey,
		defaultVoiceID: defaultVoiceID,
	}
}

// Stream opens a WebSocket connection and converts text to speech
func (c *Client) Stream(ctx context.Context, textIn <-chan string, voiceID string) (<-chan []byte, error) {
	log := logger.WithComponent("cartesia")

	if c.apiKey == "" {
		return nil, fmt.Errorf("Cartesia API key not configured")
	}

	if voiceID == "" {
		voiceID = c.defaultVoiceID
	}

	// Connect to Cartesia
	url := fmt.Sprintf("%s?api_key=%s&cartesia_version=%s", websocketURL, c.apiKey, cartesiaVersion)

	conn, _, err := websocket.DefaultDialer.DialContext(ctx, url, nil)
	if err != nil {
		log.Error().Err(err).Msg("Failed to connect to Cartesia")
		return nil, fmt.Errorf("failed to connect to Cartesia: %w", err)
	}

	log.Debug().Str("voice_id", voiceID).Msg("Connected to Cartesia")

	// Track if connection has failed to prevent repeated reads/writes
	var connFailed atomic.Bool

	// Set connection parameters
	conn.SetReadDeadline(time.Now().Add(60 * time.Second))  // Initial read deadline
	conn.SetWriteDeadline(time.Now().Add(10 * time.Second)) // Write deadline
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	// Set close handler to detect when Cartesia closes the connection
	conn.SetCloseHandler(func(code int, text string) error {
		log.Debug().Int("code", code).Str("text", text).Msg("Cartesia closed connection")
		connFailed.Store(true)
		return nil
	})

	audioChan := make(chan []byte, 100)

	// Channel to signal when text has been sent (so receiver knows to read)
	textSentChan := make(chan struct{}, 10)

	// Channel to signal when TTS is done (so sender can send next text)
	ttsDoneChan := make(chan struct{}, 10)

	// Unique context ID for each request
	contextCounter := 0
	getContextID := func() string {
		contextCounter++
		return fmt.Sprintf("ctx_%d_%d", time.Now().UnixMilli(), contextCounter)
	}

	// Goroutine to send text - buffer complete sentences
	// Keep this running for the entire session to handle multiple messages
	go func() {
		// Don't close done channel here - let it stay open so receiver can continue
		// Only close when context is cancelled (handled by receiver)

		var textBuffer strings.Builder
		var hasSentText bool    // Track if we've sent at least one message
		var waitingForDone bool // Track if we're waiting for TTS to complete

		sendBuffer := func() bool {
			// If we're waiting for previous TTS to complete, queue this text
			// (but allow first text to be sent immediately)
			if waitingForDone && hasSentText {
				log.Debug().Str("pending_text", strings.TrimSpace(textBuffer.String())).Msg("Waiting for previous TTS to complete, text queued")
				return true // Don't send yet, but keep the text in buffer
			}

			// Check if connection has failed before trying to send
			if connFailed.Load() {
				log.Debug().Msg("Cannot send to Cartesia: connection failed")
				return false
			}
			text := strings.TrimSpace(textBuffer.String())
			if text != "" {
				ctxID := getContextID()
				log.Debug().Str("text", text).Str("ctx", ctxID).Msg("Sending text to Cartesia")

				// Set write deadline
				conn.SetWriteDeadline(time.Now().Add(5 * time.Second))

				if err := c.sendText(conn, text, voiceID, ctxID); err != nil {
					log.Warn().Err(err).Msg("Failed to send text to Cartesia")
					connFailed.Store(true)
					return false
				}
				textBuffer.Reset()
				hasSentText = true
				waitingForDone = true // Mark that we're waiting for "done"
				log.Debug().Msg("Successfully sent text to Cartesia, waiting for 'done'")
				// Signal receiver that text has been sent
				select {
				case textSentChan <- struct{}{}:
				default:
					// Channel full, skip
				}
			}
			return true
		}

		flushTicker := time.NewTicker(250 * time.Millisecond)
		defer flushTicker.Stop()

		for {
			// Check if connection has failed
			if connFailed.Load() {
				log.Debug().Msg("Cartesia sender exiting: connection failed")
				return
			}

			select {
			case <-ctx.Done():
				// Context cancelled - flush and exit
				sendBuffer()
				log.Debug().Msg("Cartesia sender exiting: context cancelled")
				return

			case <-ttsDoneChan:
				// TTS completed - we can now send the next text
				waitingForDone = false
				log.Debug().Msg("TTS done signal received, can send next text")
				// If we have buffered text, send it now
				if textBuffer.Len() > 0 {
					if !sendBuffer() {
						return
					}
				}

			case text, ok := <-textIn:
				if !ok {
					// Channel closed - flush remaining text
					sendBuffer()
					log.Debug().Bool("has_sent_text", hasSentText).Msg("Text input channel closed")
					// Wait for audio to be generated
					if hasSentText {
						time.Sleep(1 * time.Second)
					}
					// Exit sender, but don't close done channel
					// Receiver will keep connection open for potential reconnection
					return
				}

				textBuffer.WriteString(text)
				currentText := textBuffer.String()

				// Send on complete sentences
				if strings.HasSuffix(strings.TrimSpace(currentText), ".") ||
					strings.HasSuffix(strings.TrimSpace(currentText), "!") ||
					strings.HasSuffix(strings.TrimSpace(currentText), "?") {
					if !sendBuffer() {
						return
					}
				} else if len(currentText) > 120 {
					// Send if buffer gets large
					if !sendBuffer() {
						return
					}
				}

			case <-flushTicker.C:
				// Periodically flush incomplete sentences
				if textBuffer.Len() > 0 {
					if !sendBuffer() {
						return
					}
				}
			}
		}
	}()

	// Goroutine to receive audio
	go func() {
		defer func() {
			// Only close audioChan if it hasn't been closed already
			select {
			case <-audioChan:
				// Already closed
			default:
				close(audioChan)
			}
		}()
		defer func() {
			if conn != nil {
				conn.Close()
			}
		}()

		// Give the connection a moment to stabilize before reading
		time.Sleep(100 * time.Millisecond)

		consecutiveErrors := 0
		maxConsecutiveErrors := 3
		expectingAudio := true // Start expecting audio (for initial greeting)

		for {
			// Check if connection has already failed
			if connFailed.Load() {
				log.Debug().Msg("Cartesia receiver exiting: connection failed")
				return
			}

			// Check connection state before reading
			if conn == nil {
				log.Debug().Msg("Cartesia receiver exiting: connection is nil")
				return
			}

			select {
			case <-ctx.Done():
				log.Debug().Msg("Cartesia receiver exiting: context cancelled")
				return
			case <-textSentChan:
				// Text was sent - we should now expect audio
				expectingAudio = true
				log.Debug().Msg("Text sent signal received, expecting audio")
			default:
				// Only read if we're expecting audio, otherwise wait for text to be sent
				if !expectingAudio {
					// Not expecting audio yet - wait a bit and check again
					time.Sleep(100 * time.Millisecond)
					continue
				}

				// Set a reasonable read deadline
				conn.SetReadDeadline(time.Now().Add(5 * time.Second))

				// Use a safe read that won't panic
				var messageType int
				var message []byte
				var err error

				func() {
					defer func() {
						if r := recover(); r != nil {
							// Panic during read - websocket library has marked connection as failed
							// This is not recoverable, mark connection as failed immediately
							panicStr := fmt.Sprintf("%v", r)
							log.Debug().Str("panic", panicStr).Msg("Panic during Cartesia ReadMessage - connection failed")
							err = fmt.Errorf("panic during read: %v", r)
							// If it's the "repeated read on failed websocket connection" error,
							// the connection is definitely dead - mark it as failed immediately
							if strings.Contains(panicStr, "repeated read on failed websocket connection") ||
								strings.Contains(panicStr, "use of closed network connection") {
								connFailed.Store(true)
								consecutiveErrors = maxConsecutiveErrors // Force exit
							} else {
								consecutiveErrors++
							}
						}
					}()
					messageType, message, err = conn.ReadMessage()
					// Reset error count on successful read
					if err == nil {
						consecutiveErrors = 0
					}
				}()

				if err != nil {
					// Check if it's just a timeout - this is normal, continue waiting
					if netErr, ok := err.(interface{ Timeout() bool }); ok && netErr.Timeout() {
						// Timeout is normal when waiting for next message - continue
						consecutiveErrors = 0 // Reset on timeout (not a real error)
						continue
					}

					// Check if connection is closed
					if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
						log.Debug().Err(err).Msg("Cartesia WebSocket closed normally")
						connFailed.Store(true)
						return
					}

					// Check if it's a use of closed network connection
					errStr := err.Error()
					if errStr == "use of closed network connection" ||
						errStr == "repeated read on failed websocket connection" {
						// Connection was closed - check if we've had too many errors
						consecutiveErrors++
						if consecutiveErrors >= maxConsecutiveErrors {
							log.Debug().Err(err).Int("consecutive_errors", consecutiveErrors).Msg("Cartesia connection closed after multiple errors")
							connFailed.Store(true)
							return
						}
						// Give it a moment and try again
						time.Sleep(100 * time.Millisecond)
						continue
					}

					// Other errors - log but don't necessarily fail (might be transient)
					consecutiveErrors++
					if consecutiveErrors >= maxConsecutiveErrors {
						log.Debug().Err(err).Int("consecutive_errors", consecutiveErrors).Msg("Cartesia read error threshold reached, marking as failed")
						connFailed.Store(true)
						return
					}
					log.Debug().Err(err).Int("consecutive_errors", consecutiveErrors).Str("error_type", fmt.Sprintf("%T", err)).Msg("Cartesia read error, will retry")
					// Wait a bit before retrying
					time.Sleep(100 * time.Millisecond)
					continue
				}

				// Reset error count on successful read
				consecutiveErrors = 0

				// Check for close message
				if messageType == websocket.CloseMessage {
					log.Debug().Msg("Cartesia sent close message")
					connFailed.Store(true)
					return
				}

				// Only process non-close messages
				if messageType == websocket.TextMessage || messageType == websocket.BinaryMessage {
					c.processMessage(message, audioChan, ttsDoneChan)
					// Check if this is a "done" message - if so, we're no longer expecting audio
					var checkDone struct {
						Type string `json:"type"`
					}
					if err := json.Unmarshal(message, &checkDone); err == nil && checkDone.Type == "done" {
						expectingAudio = false
						log.Debug().Msg("Received 'done' message, no longer expecting audio")
					}
				}
			}
		}
	}()

	return audioChan, nil
}

func (c *Client) processMessage(message []byte, audioChan chan<- []byte, ttsDoneChan chan<- struct{}) {
	log := logger.WithComponent("cartesia")
	var response struct {
		Type      string `json:"type"`
		Data      string `json:"data"`
		Done      bool   `json:"done"`
		ContextID string `json:"context_id"`
		Error     string `json:"error"`
	}

	if err := json.Unmarshal(message, &response); err != nil {
		log.Debug().Err(err).Str("message", string(message)).Msg("Failed to unmarshal Cartesia message")
		return
	}

	if response.Error != "" {
		log.Warn().Str("error", response.Error).Msg("Cartesia error")
		return
	}

	if response.Type == "chunk" && response.Data != "" {
		// Decode base64 audio
		audio, err := base64.StdEncoding.DecodeString(response.Data)
		if err != nil {
			log.Warn().Err(err).Msg("Failed to decode audio")
			return
		}

		if len(audio) == 0 {
			log.Debug().Msg("Received empty audio chunk from Cartesia")
			return
		}

		log.Debug().
			Int("audio_bytes", len(audio)).
			Int("samples", len(audio)/2).
			Float64("duration_sec", float64(len(audio)/2)/44100.0).
			Msg("Received audio chunk from Cartesia")

		select {
		case audioChan <- audio:
		default:
			// Channel full, skip
			log.Warn().Msg("Audio channel full, dropping chunk")
		}
	} else if response.Type == "done" {
		// Cartesia sent "done" message - current text-to-speech is complete
		// Connection stays open for more messages
		log.Debug().Msg("Cartesia sent 'done' message - current TTS complete, connection stays open")
		// Signal sender that TTS is done and next text can be sent
		select {
		case ttsDoneChan <- struct{}{}:
		default:
			// Channel full, skip
		}
	} else if response.Type != "" {
		log.Debug().Str("type", response.Type).Msg("Received non-audio message from Cartesia")
	}
}

func (c *Client) sendText(conn *websocket.Conn, text, voiceID, contextID string) error {
	if text == "" {
		return nil
	}

	payload := map[string]interface{}{
		"model_id":   defaultModel,
		"transcript": text,
		"voice": map[string]interface{}{
			"mode": "id",
			"id":   voiceID,
		},
		"output_format": map[string]interface{}{
			"container":   "raw",
			"encoding":    "pcm_s16le",
			"sample_rate": defaultSampleRate,
		},
		"context_id": contextID,
		"language":   "en",
	}

	return conn.WriteJSON(payload)
}

// SynthesizeSync performs synchronous TTS (for simple use cases)
func (c *Client) SynthesizeSync(ctx context.Context, text, voiceID string) ([]byte, error) {
	textChan := make(chan string, 1)
	textChan <- text
	close(textChan)

	audioChan, err := c.Stream(ctx, textChan, voiceID)
	if err != nil {
		return nil, err
	}

	var audio []byte
	for chunk := range audioChan {
		audio = append(audio, chunk...)
	}

	return audio, nil
}
