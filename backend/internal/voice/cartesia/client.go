package cartesia

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/gorilla/websocket"

	"github.com/yourusername/ai-voice-agent/internal/logger"
)

const (
	websocketURL      = "wss://api.cartesia.ai/tts/websocket"
	cartesiaVersion   = "2024-06-10"
	defaultModel      = "sonic-english"
	defaultSampleRate = 24000
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
	var wg sync.WaitGroup
	var contextCounter int
	var mu sync.Mutex

	generateContextID := func() string {
		mu.Lock()
		defer mu.Unlock()
		contextCounter++
		return fmt.Sprintf("ctx_%d_%d", time.Now().UnixMilli(), contextCounter)
	}

	// Goroutine to send text
	wg.Add(1)
	go func() {
		defer wg.Done()

		var textBuffer string
		ticker := time.NewTicker(100 * time.Millisecond)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				return
			case text, ok := <-textIn:
				if !ok {
					// Flush remaining text
					if textBuffer != "" {
						c.sendText(conn, textBuffer, voiceID, generateContextID())
					}
					return
				}
				textBuffer += text

				// Send when we have enough text or hit a sentence boundary
				if len(textBuffer) > 50 || containsSentenceEnd(textBuffer) {
					c.sendText(conn, textBuffer, voiceID, generateContextID())
					textBuffer = ""
				}
			case <-ticker.C:
				// Flush buffer periodically
				if textBuffer != "" {
					c.sendText(conn, textBuffer, voiceID, generateContextID())
					textBuffer = ""
				}
			}
		}
	}()

	// Goroutine to receive audio
	wg.Add(1)
	go func() {
		defer wg.Done()
		defer close(audioChan)
		defer conn.Close()

		for {
			select {
			case <-ctx.Done():
				return
			default:
				_, message, err := conn.ReadMessage()
				if err != nil {
					if websocket.IsUnexpectedCloseError(err) {
						log.Debug().Err(err).Msg("Cartesia connection closed")
					}
					return
				}

				var response struct {
					Type      string `json:"type"`
					Data      string `json:"data"`
					Done      bool   `json:"done"`
					ContextID string `json:"context_id"`
					Error     string `json:"error"`
				}

				if err := json.Unmarshal(message, &response); err != nil {
					continue
				}

				if response.Error != "" {
					log.Warn().Str("error", response.Error).Msg("Cartesia error")
					continue
				}

				if response.Type == "chunk" && response.Data != "" {
					// Decode base64 audio
					audio, err := base64.StdEncoding.DecodeString(response.Data)
					if err != nil {
						log.Warn().Err(err).Msg("Failed to decode audio")
						continue
					}

					select {
					case audioChan <- audio:
					case <-ctx.Done():
						return
					}
				}
			}
		}
	}()

	// Cleanup goroutine
	go func() {
		wg.Wait()
	}()

	return audioChan, nil
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

func containsSentenceEnd(text string) bool {
	for _, char := range []rune{'.', '!', '?', ',', ';', ':'} {
		for _, r := range text {
			if r == char {
				return true
			}
		}
	}
	return false
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
