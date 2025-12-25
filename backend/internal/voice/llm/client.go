package llm

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/yourusername/ai-voice-agent/internal/logger"
)

// Client handles LLM interactions
type Client struct {
	anthropicKey string
	openAIKey    string
	httpClient   *http.Client
}

// NewClient creates a new LLM client
func NewClient(anthropicKey, openAIKey string) *Client {
	return &Client{
		anthropicKey: anthropicKey,
		openAIKey:    openAIKey,
		httpClient:   &http.Client{},
	}
}

// Stream generates a streaming response from the LLM
func (c *Client) Stream(
	ctx context.Context,
	systemPrompt string,
	messages []Message,
	model string,
	temperature float64,
	maxTokens int,
) (<-chan string, error) {
	log := logger.WithComponent("llm")

	// Determine which provider to use based on model name and available keys
	if strings.HasPrefix(model, "claude") || strings.HasPrefix(model, "anthropic") {
		if c.anthropicKey != "" {
			log.Debug().Str("model", model).Str("provider", "anthropic").Msg("Using Anthropic")
			return c.streamAnthropic(ctx, systemPrompt, messages, model, temperature, maxTokens)
		}
		// Fall back to OpenAI if Claude requested but no Anthropic key
		if c.openAIKey != "" {
			log.Debug().Str("original_model", model).Str("provider", "openai").Msg("Claude requested but using OpenAI (no Anthropic key)")
			return c.streamOpenAI(ctx, systemPrompt, messages, "gpt-4o-mini", temperature, maxTokens)
		}
	} else if strings.HasPrefix(model, "gpt") || strings.HasPrefix(model, "o1") {
		if c.openAIKey != "" {
			log.Debug().Str("model", model).Str("provider", "openai").Msg("Using OpenAI")
			return c.streamOpenAI(ctx, systemPrompt, messages, model, temperature, maxTokens)
		}
		// Fall back to Anthropic if GPT requested but no OpenAI key
		if c.anthropicKey != "" {
			log.Debug().Str("original_model", model).Str("provider", "anthropic").Msg("GPT requested but using Anthropic (no OpenAI key)")
			return c.streamAnthropic(ctx, systemPrompt, messages, "claude-3-haiku-20240307", temperature, maxTokens)
		}
	}

	// Default to available provider
	if c.openAIKey != "" {
		log.Debug().Str("provider", "openai").Msg("Defaulting to OpenAI")
		return c.streamOpenAI(ctx, systemPrompt, messages, "gpt-4o-mini", temperature, maxTokens)
	}

	if c.anthropicKey != "" {
		log.Debug().Str("provider", "anthropic").Msg("Defaulting to Anthropic")
		return c.streamAnthropic(ctx, systemPrompt, messages, "claude-3-haiku-20240307", temperature, maxTokens)
	}

	return nil, fmt.Errorf("no LLM API key configured")
}

// Generate performs non-streaming generation (for simple use cases)
func (c *Client) Generate(
	ctx context.Context,
	systemPrompt string,
	messages []Message,
	model string,
	temperature float64,
	maxTokens int,
) (string, error) {
	responseChan, err := c.Stream(ctx, systemPrompt, messages, model, temperature, maxTokens)
	if err != nil {
		return "", err
	}

	var response strings.Builder
	for chunk := range responseChan {
		response.WriteString(chunk)
	}

	return response.String(), nil
}
