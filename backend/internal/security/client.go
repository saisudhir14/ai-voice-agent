package security

import (
	"context"

	"github.com/rs/zerolog"
)

// PresidioClient handles PII detection and redaction using Microsoft Presidio
type PresidioClient struct {
	analyzer   *Analyzer
	anonymizer *Anonymizer
	config     *PresidioConfig
	logger     zerolog.Logger
}

// NewPresidioClient creates a new Presidio client
func NewPresidioClient(config *PresidioConfig, logger zerolog.Logger) *PresidioClient {
	return &PresidioClient{
		analyzer:   NewAnalyzer(config.AnalyzerURL, config.Language, logger),
		anonymizer: NewAnonymizer(config.AnonymizerURL, logger),
		config:     config,
		logger:     logger,
	}
}

// RedactPII is the main method that analyzes and anonymizes in one call
// This is what you'll use in your voice pipeline
func (c *PresidioClient) RedactPII(ctx context.Context, text string) (string, error) {
	if !c.config.Enabled {
		c.logger.Debug().Msg("Presidio disabled, returning original text")
		return text, nil
	}

	if text == "" {
		return text, nil
	}

	// Step 1: Analyze to detect PII
	analyzeResults, err := c.analyzer.Analyze(ctx, text, c.config.EntityTypes)
	if err != nil {
		c.logger.Error().Err(err).Msg("Failed to analyze text for PII")
		// Fail-safe: return original text (don't block the conversation)
		return text, err
	}

	// If no PII detected, return original text
	if len(analyzeResults) == 0 {
		c.logger.Debug().Msg("No PII detected in text")
		return text, nil
	}

	// Step 2: Anonymize detected PII
	anonymizers := c.config.BuildAnonymizersMap()
	redactedText, err := c.anonymizer.Anonymize(ctx, text, analyzeResults, anonymizers)
	if err != nil {
		c.logger.Error().Err(err).Msg("Failed to anonymize text")
		// Fail-safe: return original text (don't block the conversation)
		return text, err
	}

	return redactedText, nil
}

// HealthCheck verifies that both Presidio services are running
func (c *PresidioClient) HealthCheck(ctx context.Context) error {
	if !c.config.Enabled {
		c.logger.Debug().Msg("Presidio disabled, skipping health check")
		return nil
	}

	// Check analyzer
	if err := c.analyzer.HealthCheck(ctx); err != nil {
		return err
	}

	// Check anonymizer
	if err := c.anonymizer.HealthCheck(ctx); err != nil {
		return err
	}

	c.logger.Info().Msg("Presidio health check passed")
	return nil
}
