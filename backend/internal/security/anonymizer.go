package security

import (
	"context"

	"github.com/rs/zerolog"
)

// Anonymizer handles PII redaction via Presidio anonymizer service
type Anonymizer struct {
	url        string
	httpClient *HTTPClient
	logger     zerolog.Logger
}

// NewAnonymizer creates a new anonymizer client
func NewAnonymizer(url string, logger zerolog.Logger) *Anonymizer {
	return &Anonymizer{
		url:        url,
		httpClient: NewHTTPClient(logger),
		logger:     logger,
	}
}

// Anonymize redacts PII entities from the text
func (a *Anonymizer) Anonymize(ctx context.Context, text string, analyzeResults []AnalyzeResult, anonymizers map[string]AnonymizerConfig) (string, error) {
	if text == "" || len(analyzeResults) == 0 {
		return text, nil
	}

	// Build request
	req := AnonymizeRequest{
		Text:            text,
		Anonymizers:     anonymizers,
		AnalyzerResults: analyzeResults,
	}

	a.logger.Debug().Msg("Anonymizing detected PII")

	var result AnonymizeResponse
	if err := a.httpClient.Post(ctx, a.url+"/anonymize", req, &result); err != nil {
		return text, err
	}

	a.logger.Info().
		Str("original", text).
		Str("redacted", result.Text).
		Int("entities_redacted", len(result.Items)).
		Msg("Text anonymized successfully")

	return result.Text, nil
}

// HealthCheck verifies that the anonymizer service is running
func (a *Anonymizer) HealthCheck(ctx context.Context) error {
	return a.httpClient.HealthCheck(ctx, a.url, "anonymizer")
}
