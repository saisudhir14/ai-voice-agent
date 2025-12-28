package security

// PresidioConfig holds configuration for Presidio DLP
type PresidioConfig struct {
	Enabled          bool
	AnalyzerURL      string
	AnonymizerURL    string
	Language         string
	EntityTypes      []string                    // nil = detect all, []string{} = detect nothing, ["TYPE"] = specific types
	AnonymizerRules  map[string]AnonymizerConfig // Optional: custom redaction per entity type
	DefaultRedaction AnonymizerConfig            // Required: fallback for all entities
}

// NewPresidioConfig creates a new Presidio configuration with secure defaults
func NewPresidioConfig() *PresidioConfig {
	return &PresidioConfig{
		Enabled:       false,
		AnalyzerURL:   "http://localhost:5001",
		AnonymizerURL: "http://localhost:5002",
		Language:      "en",
		EntityTypes:   nil, // nil = detect all (Presidio decides which entities exist)
		DefaultRedaction: AnonymizerConfig{
			Type:     "replace",
			NewValue: "<PII>",
		},
		AnonymizerRules: make(map[string]AnonymizerConfig), // Empty by default
	}
}

// WithEnabled enables or disables Presidio
func (c *PresidioConfig) WithEnabled(enabled bool) *PresidioConfig {
	c.Enabled = enabled
	return c
}

// WithURLs sets the analyzer and anonymizer URLs
func (c *PresidioConfig) WithURLs(analyzerURL, anonymizerURL string) *PresidioConfig {
	c.AnalyzerURL = analyzerURL
	c.AnonymizerURL = anonymizerURL
	return c
}

// WithLanguage sets the language for detection
func (c *PresidioConfig) WithLanguage(lang string) *PresidioConfig {
	c.Language = lang
	return c
}

// WithEntityTypes sets which entity types to detect
func (c *PresidioConfig) WithEntityTypes(types []string) *PresidioConfig {
	c.EntityTypes = types
	return c
}

// WithAnonymizerRule adds a custom anonymization rule for a specific entity type
func (c *PresidioConfig) WithAnonymizerRule(entityType string, config AnonymizerConfig) *PresidioConfig {
	if c.AnonymizerRules == nil {
		c.AnonymizerRules = make(map[string]AnonymizerConfig)
	}
	c.AnonymizerRules[entityType] = config
	return c
}

// WithDefaultRedaction sets the fallback redaction strategy
func (c *PresidioConfig) WithDefaultRedaction(config AnonymizerConfig) *PresidioConfig {
	c.DefaultRedaction = config
	return c
}

// ShouldDetectAllEntities returns true if all entity types should be detected
func (c *PresidioConfig) ShouldDetectAllEntities() bool {
	return c.EntityTypes == nil
}

// ShouldDetectNothing returns true if no entities should be detected
func (c *PresidioConfig) ShouldDetectNothing() bool {
	return c.EntityTypes != nil && len(c.EntityTypes) == 0
}

// BuildAnonymizersMap creates the anonymizers map for the Presidio API request
func (c *PresidioConfig) BuildAnonymizersMap() map[string]AnonymizerConfig {
	anonymizers := make(map[string]AnonymizerConfig)

	// DEFAULT rule applies to all entities that don't have custom rules
	anonymizers["DEFAULT"] = c.DefaultRedaction

	// Add any custom rules (these override DEFAULT for specific entity types)
	for entityType, config := range c.AnonymizerRules {
		anonymizers[entityType] = config
	}

	return anonymizers
}
