package assemblyai

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"sync"

	"github.com/gorilla/websocket"

	"github.com/yourusername/ai-voice-agent/internal/logger"
)

const (
	realtimeURL = "wss://api.assemblyai.com/v2/realtime/ws"
	sampleRate  = 16000
)

// TranscriptEvent represents a transcription result
type TranscriptEvent struct {
	Text       string  `json:"text"`
	IsPartial  bool    `json:"is_partial"`
	Confidence float64 `json:"confidence"`
}

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

	// Connect to AssemblyAI
	url := fmt.Sprintf("%s?sample_rate=%d", realtimeURL, sampleRate)
	header := map[string][]string{
		"Authorization": {c.apiKey},
	}

	conn, _, err := websocket.DefaultDialer.DialContext(ctx, url, header)
	if err != nil {
		log.Error().Err(err).Msg("Failed to connect to AssemblyAI")
		return nil, fmt.Errorf("failed to connect to AssemblyAI: %w", err)
	}

	log.Debug().Msg("Connected to AssemblyAI")

	transcriptChan := make(chan TranscriptEvent, 10)

	var wg sync.WaitGroup

	// Goroutine to send audio
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			select {
			case <-ctx.Done():
				conn.WriteJSON(map[string]bool{"terminate_session": true})
				return
			case audio, ok := <-audioIn:
				if !ok {
					conn.WriteJSON(map[string]bool{"terminate_session": true})
					return
				}

				// AssemblyAI expects base64 encoded audio data
				audioBase64 := base64.StdEncoding.EncodeToString(audio)
				msg := map[string]interface{}{
					"audio_data": audioBase64,
				}
				if err := conn.WriteJSON(msg); err != nil {
					log.Warn().Err(err).Msg("Failed to send audio to AssemblyAI")
					return
				}
			}
		}
	}()

	// Goroutine to receive transcripts
	wg.Add(1)
	go func() {
		defer wg.Done()
		defer close(transcriptChan)
		defer conn.Close()

		for {
			select {
			case <-ctx.Done():
				return
			default:
				_, message, err := conn.ReadMessage()
				if err != nil {
					if websocket.IsUnexpectedCloseError(err) {
						log.Debug().Err(err).Msg("AssemblyAI connection closed")
					}
					return
				}

				var response struct {
					MessageType string  `json:"message_type"`
					Text        string  `json:"text"`
					Confidence  float64 `json:"confidence"`
					AudioStart  int     `json:"audio_start"`
					AudioEnd    int     `json:"audio_end"`
				}

				if err := json.Unmarshal(message, &response); err != nil {
					continue
				}

				switch response.MessageType {
				case "PartialTranscript":
					if response.Text != "" {
						select {
						case transcriptChan <- TranscriptEvent{
							Text:       response.Text,
							IsPartial:  true,
							Confidence: response.Confidence,
						}:
						case <-ctx.Done():
							return
						}
					}
				case "FinalTranscript":
					if response.Text != "" {
						log.Debug().
							Str("text", response.Text).
							Float64("confidence", response.Confidence).
							Msg("Final transcript received")

						select {
						case transcriptChan <- TranscriptEvent{
							Text:       response.Text,
							IsPartial:  false,
							Confidence: response.Confidence,
						}:
						case <-ctx.Done():
							return
						}
					}
				case "SessionTerminated":
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
