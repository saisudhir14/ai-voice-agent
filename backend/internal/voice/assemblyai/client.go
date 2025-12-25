package assemblyai

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"sync/atomic"

	"github.com/gorilla/websocket"

	"github.com/yourusername/ai-voice-agent/internal/logger"
)

// Client handles AssemblyAI STT streaming
type Client struct {
	apiKey string
}

// NewClient creates a new AssemblyAI client
func NewClient(apiKey string) *Client {
	return &Client{apiKey: apiKey}
}

// Stream opens a WebSocket connection and streams audio for transcription
func (c *Client) Stream(ctx context.Context, audioIn <-chan []byte) (<-chan TranscriptEvent, error) {
	log := logger.WithComponent("assemblyai")

	if c.apiKey == "" {
		return nil, fmt.Errorf("AssemblyAI API key not configured")
	}

	// Connect to AssemblyAI v3 streaming endpoint
	url := fmt.Sprintf("%s?sample_rate=%d&encoding=pcm_s16le&token=%s", realtimeURL, sampleRate, c.apiKey)

	conn, _, err := websocket.DefaultDialer.DialContext(ctx, url, nil)
	if err != nil {
		log.Error().Err(err).Msg("Failed to connect to AssemblyAI")
		return nil, fmt.Errorf("failed to connect to AssemblyAI: %w", err)
	}

	log.Debug().Msg("Connected to AssemblyAI v3 streaming")

	transcriptChan := make(chan TranscriptEvent, 10)

	var wg sync.WaitGroup

	// Goroutine to send audio as raw binary
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			select {
			case <-ctx.Done():
				// Send termination message
				terminateMsg := map[string]string{"type": "Terminate"}
				conn.WriteJSON(terminateMsg)
				return
			case audio, ok := <-audioIn:
				if !ok {
					// Send termination message
					terminateMsg := map[string]string{"type": "Terminate"}
					conn.WriteJSON(terminateMsg)
					return
				}

				// Send raw binary audio data
				if err := conn.WriteMessage(websocket.BinaryMessage, audio); err != nil {
					log.Warn().Err(err).Msg("Failed to send audio to AssemblyAI")
					return
				}
			}
		}
	}()

	// Track if connection has failed to prevent repeated reads
	var connFailed atomic.Bool

	// Goroutine to receive transcripts
	wg.Add(1)
	go func() {
		defer wg.Done()
		defer close(transcriptChan)
		defer conn.Close()

		// Recover from any panics to prevent server crash
		defer func() {
			if r := recover(); r != nil {
				log.Warn().Interface("panic", r).Msg("Recovered from panic in AssemblyAI receiver")
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
			default:
				_, message, err := conn.ReadMessage()
				if err != nil {
					connFailed.Store(true)
					if websocket.IsUnexpectedCloseError(err) {
						log.Debug().Err(err).Msg("AssemblyAI connection closed")
					}
					return
				}

				// Parse the v3 response format
				var response struct {
					Type       string  `json:"type"`
					Transcript string  `json:"transcript"`
					Text       string  `json:"text"`
					EndOfTurn  bool    `json:"end_of_turn"`
					Confidence float64 `json:"confidence"`
					// SessionBegins fields
					ID        string `json:"id"`
					SessionID string `json:"session_id"`
					ExpiresAt int64  `json:"expires_at"`
				}

				if err := json.Unmarshal(message, &response); err != nil {
					log.Warn().Err(err).Str("raw", string(message)).Msg("Failed to parse AssemblyAI response")
					continue
				}

				// Only log non-empty transcripts to reduce noise
				if response.Transcript != "" || response.Type != "Turn" {
					log.Debug().Str("type", response.Type).Str("text", response.Transcript).Bool("end_of_turn", response.EndOfTurn).Msg("AssemblyAI response")
				}

				switch response.Type {
				case "SessionBegins", "Begin":
					sessionID := response.SessionID
					if sessionID == "" {
						sessionID = response.ID
					}
					log.Info().Str("session_id", sessionID).Msg("AssemblyAI session started")

				case "Turn":
					// This is a transcription result
					text := response.Transcript
					if text == "" {
						text = response.Text
					}

					if text != "" {
						event := TranscriptEvent{
							Text:       text,
							IsPartial:  !response.EndOfTurn,
							Confidence: response.Confidence,
						}

						if response.EndOfTurn {
							log.Debug().
								Str("text", text).
								Float64("confidence", response.Confidence).
								Msg("Final transcript received")
						}

						select {
						case transcriptChan <- event:
						case <-ctx.Done():
							return
						}
					}

				case "Termination":
					log.Debug().Msg("AssemblyAI session terminated")
					return
				}
			}
		}
	}()

	// Cleanup goroutine
	go func() {
		wg.Wait()
	}()

	return transcriptChan, nil
}
