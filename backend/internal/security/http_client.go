package security

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/rs/zerolog"
)

// HTTPClient is a shared HTTP client for making requests to Presidio services
type HTTPClient struct {
	client *http.Client
	logger zerolog.Logger
}

// NewHTTPClient creates a new HTTP client
func NewHTTPClient(logger zerolog.Logger) *HTTPClient {
	return &HTTPClient{
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
		logger: logger,
	}
}

// Post makes a POST request and decodes the JSON response
func (h *HTTPClient) Post(ctx context.Context, url string, request interface{}, response interface{}) error {
	reqBody, err := json.Marshal(request)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(reqBody))
	if err != nil {
		return fmt.Errorf("failed to create HTTP request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := h.client.Do(httpReq)
	if err != nil {
		return fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("HTTP status %d: %s", resp.StatusCode, string(body))
	}

	if response != nil {
		if err := json.NewDecoder(resp.Body).Decode(response); err != nil {
			return fmt.Errorf("failed to decode response: %w", err)
		}
	}

	return nil
}

// HealthCheck makes a GET request to /health endpoint
func (h *HTTPClient) HealthCheck(ctx context.Context, url, serviceName string) error {
	req, err := http.NewRequestWithContext(ctx, "GET", url+"/health", nil)
	if err != nil {
		return fmt.Errorf("failed to create %s health check request: %w", serviceName, err)
	}

	resp, err := h.client.Do(req)
	if err != nil {
		return fmt.Errorf("%s health check failed: %w", serviceName, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("%s health check returned status %d", serviceName, resp.StatusCode)
	}

	h.logger.Debug().Str("service", serviceName).Msg("Health check passed")
	return nil
}
