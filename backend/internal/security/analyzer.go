package security

import (
	"context"

	"github.com/rs/zerolog"
)

// Analyzer handles PII detection via Presidio analyzer service
type Analyzer struct {
	url        string
	language   string
	httpClient *HTTPClient
	logger     zerolog.Logger
}

// NewAnalyzer creates a new analyzer client
func NewAnalyzer(url, language string, logger zerolog.Logger) *Analyzer {
	return &Analyzer{
		url:        url,
		language:   language,
		httpClient: NewHTTPClient(logger),
		logger:     logger,
	}
}

// Analyze detects PII entities in the given text
func (a *Analyzer) Analyze(ctx context.Context, text string, entityTypes []string) ([]AnalyzeResult, error) {
	if text == "" {
		return []AnalyzeResult{}, nil
	}

	// Build request
	req := AnalyzeRequest{
		Text:     text,
		Language: a.language,
	}

	// Handle entity types: nil = detect all, []string{} = detect nothing, [types] = specific types
	// We always set Entities to distinguish between nil (all) and [] (none)
	if entityTypes != nil {
		req.Entities = entityTypes // Empty slice means detect nothing
	}
	// If entityTypes is nil, we don't set Entities field, which means detect all

	a.logger.Debug().
		Str("text_preview", truncateText(text, 100)).
		Int("text_length", len(text)).
		Msg("Analyzing text for PII")

	var results []AnalyzeResult
	if err := a.httpClient.Post(ctx, a.url+"/analyze", req, &results); err != nil {
		return nil, err
	}

	if len(results) > 0 {
		a.logger.Info().
			Int("entities_detected", len(results)).
			Msg("PII entities detected")

		// Log detected entity types for debugging
		entityCounts := make(map[string]int)
		for _, result := range results {
			entityCounts[result.EntityType]++
		}
		a.logger.Debug().Interface("entity_types", entityCounts).Msg("Entity types detected")
	}

	return results, nil
}

// HealthCheck verifies that the analyzer service is running
func (a *Analyzer) HealthCheck(ctx context.Context) error {
	return a.httpClient.HealthCheck(ctx, a.url, "analyzer")
}

// truncateText truncates text to maxLen characters for logging
func truncateText(text string, maxLen int) string {
	if len(text) <= maxLen {
		return text
	}
	return text[:maxLen] + "..."
}
