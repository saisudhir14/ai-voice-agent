package security

// AnalyzeRequest represents a request to the Presidio analyzer
type AnalyzeRequest struct {
	Text     string   `json:"text"`
	Language string   `json:"language"`
	Entities []string `json:"entities,omitempty"` // Optional: filter specific PII types
}

// AnalyzeResult represents a detected PII entity
type AnalyzeResult struct {
	EntityType     string  `json:"entity_type"`
	Start          int     `json:"start"`
	End            int     `json:"end"`
	Score          float64 `json:"score"`
	RecognizerName string  `json:"recognizer_name,omitempty"`
}

// AnonymizeRequest represents a request to the Presidio anonymizer
type AnonymizeRequest struct {
	Text            string                      `json:"text"`
	Anonymizers     map[string]AnonymizerConfig `json:"anonymizers"`
	AnalyzerResults []AnalyzeResult             `json:"analyzer_results"`
}

// AnonymizerConfig defines how to anonymize a specific entity type
type AnonymizerConfig struct {
	Type        string `json:"type"` // "replace", "mask", "hash", "redact"
	NewValue    string `json:"new_value,omitempty"`
	MaskingChar string `json:"masking_char,omitempty"`
	CharsToMask int    `json:"chars_to_mask,omitempty"`
	FromEnd     bool   `json:"from_end,omitempty"`
}

// AnonymizeResponse represents the response from the anonymizer
type AnonymizeResponse struct {
	Text  string          `json:"text"`
	Items []AnonymizeItem `json:"items"`
}

// AnonymizeItem represents a single anonymized entity
type AnonymizeItem struct {
	Start      int    `json:"start"`
	End        int    `json:"end"`
	EntityType string `json:"entity_type"`
	Text       string `json:"text"`
	Operator   string `json:"operator"`
}
