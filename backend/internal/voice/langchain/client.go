package langchain

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

// Client handles communication with the Python LangChain service
type Client struct {
	baseURL    string
	httpClient *http.Client
}

// NewClient creates a new LangChain service client
func NewClient(baseURL string) *Client {
	if baseURL == "" {
		baseURL = "http://localhost:8081"
	}
	return &Client{
		baseURL:    baseURL,
		httpClient: &http.Client{},
	}
}

// AgentConfig holds configuration for creating an agent
type AgentConfig struct {
	SessionID    string   `json:"session_id"`
	SystemPrompt string   `json:"system_prompt"`
	Greeting     string   `json:"greeting,omitempty"`
	Model        string   `json:"model"`
	Temperature  float64  `json:"temperature"`
	MaxTokens    int      `json:"max_tokens"`
	Tools        []string `json:"tools,omitempty"`
}

// CreateAgentResponse is the response from creating an agent
type CreateAgentResponse struct {
	SessionID string `json:"session_id"`
	Status    string `json:"status"`
	Greeting  string `json:"greeting,omitempty"`
}

// ChatResponse is the response from a chat request
type ChatResponse struct {
	SessionID string                   `json:"session_id"`
	Response  string                   `json:"response"`
	ToolCalls []map[string]interface{} `json:"tool_calls,omitempty"`
}

// HealthCheck checks if the LangChain service is healthy
func (c *Client) HealthCheck(ctx context.Context) error {
	log := logger.WithComponent("langchain")

	req, err := http.NewRequestWithContext(ctx, "GET", c.baseURL+"/health", nil)
	if err != nil {
		return err
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		log.Warn().Err(err).Str("url", c.baseURL).Msg("LangChain service unavailable")
		return fmt.Errorf("langchain service unavailable: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("langchain service unhealthy: status %d", resp.StatusCode)
	}

	return nil
}

// CreateAgent creates a new agent session in the LangChain service
func (c *Client) CreateAgent(ctx context.Context, config AgentConfig) (*CreateAgentResponse, error) {
	log := logger.WithComponent("langchain")

	body, err := json.Marshal(config)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/agents/create", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		log.Error().Err(err).Msg("Failed to create agent")
		return nil, fmt.Errorf("failed to create agent: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		log.Error().Int("status", resp.StatusCode).Str("body", string(bodyBytes)).Msg("Failed to create agent")
		return nil, fmt.Errorf("failed to create agent: %s - %s", resp.Status, string(bodyBytes))
	}

	var result CreateAgentResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	log.Info().Str("session_id", result.SessionID).Msg("Agent created")
	return &result, nil
}

// Chat sends a message and gets a complete response
func (c *Client) Chat(ctx context.Context, sessionID, message string) (*ChatResponse, error) {
	log := logger.WithComponent("langchain")

	body, err := json.Marshal(map[string]string{
		"session_id": sessionID,
		"message":    message,
	})
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/agents/chat", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		log.Error().Err(err).Str("session_id", sessionID).Msg("Chat request failed")
		return nil, fmt.Errorf("chat request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("chat failed: %s - %s", resp.Status, string(bodyBytes))
	}

	var result ChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return &result, nil
}

// Stream sends a message and streams the response
func (c *Client) Stream(ctx context.Context, sessionID, message string) (<-chan string, error) {
	log := logger.WithComponent("langchain")

	body, err := json.Marshal(map[string]string{
		"session_id": sessionID,
		"message":    message,
	})
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/agents/stream", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "text/event-stream")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		log.Error().Err(err).Str("session_id", sessionID).Msg("Stream request failed")
		return nil, fmt.Errorf("stream request failed: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		return nil, fmt.Errorf("stream failed: %s - %s", resp.Status, string(bodyBytes))
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
				if strings.HasPrefix(data, "[ERROR]") {
					log.Warn().Str("error", data).Msg("Stream error")
					return
				}

				select {
				case responseChan <- data:
				case <-ctx.Done():
					return
				}
			}
		}
	}()

	return responseChan, nil
}

// DeleteAgent deletes an agent session
func (c *Client) DeleteAgent(ctx context.Context, sessionID string) error {
	log := logger.WithComponent("langchain")

	req, err := http.NewRequestWithContext(ctx, "DELETE", c.baseURL+"/agents/"+sessionID, nil)
	if err != nil {
		return err
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		log.Warn().Err(err).Str("session_id", sessionID).Msg("Failed to delete agent")
		return fmt.Errorf("failed to delete agent: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to delete agent: status %d", resp.StatusCode)
	}

	log.Debug().Str("session_id", sessionID).Msg("Agent deleted")
	return nil
}

// GetHistory gets conversation history for an agent
func (c *Client) GetHistory(ctx context.Context, sessionID string) ([]map[string]string, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", c.baseURL+"/agents/"+sessionID+"/history", nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get history: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get history: status %d", resp.StatusCode)
	}

	var result struct {
		SessionID string              `json:"session_id"`
		Messages  []map[string]string `json:"messages"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return result.Messages, nil
}
