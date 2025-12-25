package llm

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/yourusername/ai-voice-agent/internal/logger"
)

func (c *Client) streamAnthropic(
	ctx context.Context,
	systemPrompt string,
	messages []Message,
	model string,
	temperature float64,
	maxTokens int,
) (<-chan string, error) {
	log := logger.WithComponent("llm")

	if c.anthropicKey == "" {
		return nil, fmt.Errorf("Anthropic API key not configured")
	}

	// Convert messages to Anthropic format
	anthropicMessages := make([]map[string]string, len(messages))
	for i, msg := range messages {
		anthropicMessages[i] = map[string]string{
			"role":    msg.Role,
			"content": msg.Content,
		}
	}

	payload := map[string]interface{}{
		"model":      model,
		"max_tokens": maxTokens,
		"system":     systemPrompt,
		"messages":   anthropicMessages,
		"stream":     true,
	}

	if temperature > 0 {
		payload["temperature"] = temperature
	}

	body, _ := json.Marshal(payload)
	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.anthropic.com/v1/messages", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", c.anthropicKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		log.Error().Err(err).Msg("Anthropic request failed")
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		log.Error().Int("status", resp.StatusCode).Str("body", string(body)).Msg("Anthropic API error")
		return nil, fmt.Errorf("Anthropic API error: %s - %s", resp.Status, string(body))
	}

	responseChan := make(chan string, 100)

	go func() {
		defer close(responseChan)
		defer resp.Body.Close()

		reader := bufio.NewReader(resp.Body)
		for {
			select {
			case <-ctx.Done():
				return
			default:
				line, err := reader.ReadString('\n')
				if err != nil {
					if err != io.EOF {
						log.Debug().Err(err).Msg("Stream read ended")
					}
					return
				}

				line = strings.TrimSpace(line)
				if !strings.HasPrefix(line, "data: ") {
					continue
				}

				data := strings.TrimPrefix(line, "data: ")
				if data == "[DONE]" {
					return
				}

				var event struct {
					Type  string `json:"type"`
					Delta struct {
						Type string `json:"type"`
						Text string `json:"text"`
					} `json:"delta"`
				}

				if err := json.Unmarshal([]byte(data), &event); err != nil {
					continue
				}

				if event.Type == "content_block_delta" && event.Delta.Text != "" {
					select {
					case responseChan <- event.Delta.Text:
					case <-ctx.Done():
						return
					}
				}
			}
		}
	}()

	return responseChan, nil
}

func (c *Client) streamOpenAI(
	ctx context.Context,
	systemPrompt string,
	messages []Message,
	model string,
	temperature float64,
	maxTokens int,
) (<-chan string, error) {
	log := logger.WithComponent("llm")

	if c.openAIKey == "" {
		return nil, fmt.Errorf("OpenAI API key not configured")
	}

	// Build messages with system prompt
	openAIMessages := []map[string]string{
		{"role": "system", "content": systemPrompt},
	}
	for _, msg := range messages {
		openAIMessages = append(openAIMessages, map[string]string{
			"role":    msg.Role,
			"content": msg.Content,
		})
	}

	payload := map[string]interface{}{
		"model":      model,
		"messages":   openAIMessages,
		"stream":     true,
		"max_tokens": maxTokens,
	}

	if temperature > 0 {
		payload["temperature"] = temperature
	}

	body, _ := json.Marshal(payload)
	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.openai.com/v1/chat/completions", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.openAIKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		log.Error().Err(err).Msg("OpenAI request failed")
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		log.Error().Int("status", resp.StatusCode).Str("body", string(body)).Msg("OpenAI API error")
		return nil, fmt.Errorf("OpenAI API error: %s - %s", resp.Status, string(body))
	}

	responseChan := make(chan string, 100)

	go func() {
		defer close(responseChan)
		defer resp.Body.Close()

		reader := bufio.NewReader(resp.Body)
		for {
			select {
			case <-ctx.Done():
				return
			default:
				line, err := reader.ReadString('\n')
				if err != nil {
					if err != io.EOF {
						log.Debug().Err(err).Msg("Stream read ended")
					}
					return
				}

				line = strings.TrimSpace(line)
				if !strings.HasPrefix(line, "data: ") {
					continue
				}

				data := strings.TrimPrefix(line, "data: ")
				if data == "[DONE]" {
					return
				}

				var event struct {
					Choices []struct {
						Delta struct {
							Content string `json:"content"`
						} `json:"delta"`
					} `json:"choices"`
				}

				if err := json.Unmarshal([]byte(data), &event); err != nil {
					continue
				}

				if len(event.Choices) > 0 && event.Choices[0].Delta.Content != "" {
					select {
					case responseChan <- event.Choices[0].Delta.Content:
					case <-ctx.Done():
						return
					}
				}
			}
		}
	}()

	return responseChan, nil
}
