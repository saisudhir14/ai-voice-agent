package assemblyai

// TranscriptEvent represents a transcription result
type TranscriptEvent struct {
	Text       string  `json:"text"`
	IsPartial  bool    `json:"is_partial"`
	Confidence float64 `json:"confidence"`
}
