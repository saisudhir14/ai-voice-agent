package cartesia

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gorilla/websocket"

	"github.com/yourusername/ai-voice-agent/internal/logger"
)

const (
	websocketURL      = "wss://api.cartesia.ai/tts/websocket"
	cartesiaVersion   = "2024-06-10"
	defaultModel      = "sonic-3"
	defaultSampleRate = 44100 // High quality audio
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

	audioChan := make(chan []byte, 100)

	// Use a done channel to signal shutdown
	done := make(chan struct{})
	var doneOnce sync.Once
	closeDone := func() {
		doneOnce.Do(func() {
			close(done)
		})
	}

	// Track if connection has failed to prevent repeated reads/writes
	var connFailed atomic.Bool

	// Unique context ID for each request
	contextCounter := 0
	getContextID := func() string {
		contextCounter++
		return fmt.Sprintf("ctx_%d_%d", time.Now().UnixMilli(), contextCounter)
	}

	// Goroutine to send text - buffer complete sentences
	go func() {
		defer closeDone() // Signal receiver to stop when sender is done

		var textBuffer strings.Builder

		sendBuffer := func() bool {
			// Check if connection has failed before trying to send
			if connFailed.Load() {
				return false
			}
			text := strings.TrimSpace(textBuffer.String())
			if text != "" {
				ctxID := getContextID()
				log.Debug().Str("text", text).Str("ctx", ctxID).Msg("Sending text to Cartesia")
				if err := c.sendText(conn, text, voiceID, ctxID); err != nil {
					log.Warn().Err(err).Msg("Failed to send text to Cartesia")
					connFailed.Store(true)
					return false
				}
				textBuffer.Reset()
			}
			return true
		}

		flushTicker := time.NewTicker(250 * time.Millisecond)
		defer flushTicker.Stop()

		for {
			// Check if connection has failed
			if connFailed.Load() {
				return
			}

			select {
			case <-ctx.Done():
				sendBuffer()
				return

			case text, ok := <-textIn:
				if !ok {
					// Channel closed - flush remaining text
					sendBuffer()
					log.Debug().Msg("Text input complete")
					// Wait a bit for audio to be generated
					time.Sleep(500 * time.Millisecond)
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
		defer close(audioChan)
		defer conn.Close()

		// Recover from any panics to prevent server crash
		defer func() {
			if r := recover(); r != nil {
				log.Warn().Interface("panic", r).Msg("Recovered from panic in Cartesia receiver")
			}
		}()

		for {
			// Check if connection has already failed
			if connFailed.Load() {
				return
			}

			select {
			case <-ctx.Done():
				return
			case <-done:
				// Sender is done, drain remaining messages with timeout
				conn.SetReadDeadline(time.Now().Add(2 * time.Second))
				for {
					if connFailed.Load() {
						return
					}
					_, message, err := conn.ReadMessage()
					if err != nil {
						connFailed.Store(true)
						return
					}
					c.processMessage(message, audioChan)
				}
			default:
				// Normal read with short timeout
				conn.SetReadDeadline(time.Now().Add(100 * time.Millisecond))
				_, message, err := conn.ReadMessage()
				if err != nil {
					// Check if it's just a timeout
					if netErr, ok := err.(interface{ Timeout() bool }); ok && netErr.Timeout() {
						continue
					}
					// Real error - mark connection as failed and exit
					connFailed.Store(true)
					// Check if done channel is closed
					select {
					case <-done:
						// Sender finished, we're done
						return
					default:
						// Unexpected error while sender is still active
						log.Debug().Err(err).Msg("Cartesia read error")
						return
					}
				}

				c.processMessage(message, audioChan)
			}
		}
	}()

	return audioChan, nil
}

func (c *Client) processMessage(message []byte, audioChan chan<- []byte) {
	log := logger.WithComponent("cartesia")
	var response struct {
		Type      string `json:"type"`
		Data      string `json:"data"`
		Done      bool   `json:"done"`
		ContextID string `json:"context_id"`
		Error     string `json:"error"`
	}

	if err := json.Unmarshal(message, &response); err != nil {
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

		select {
		case audioChan <- audio:
		default:
			// Channel full, skip
		}
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
