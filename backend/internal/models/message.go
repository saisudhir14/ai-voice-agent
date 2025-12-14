package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Message represents a single message in a conversation
type Message struct {
	BaseModel
	ConversationID uuid.UUID `gorm:"type:uuid;not null;index" json:"conversation_id"`

	Role     string `gorm:"not null" json:"role"` // user, assistant
	Content  string `gorm:"type:text;not null" json:"content"`
	AudioURL string `json:"audio_url,omitempty"`

	// Timing
	StartTime int `json:"start_time"` // milliseconds from conversation start
	EndTime   int `json:"end_time"`

	// Metadata
	Confidence float64 `json:"confidence,omitempty"` // STT confidence
	ToolCalls  string  `gorm:"type:jsonb" json:"tool_calls,omitempty"`
}

// BeforeCreate hook for Message to set default ToolCalls
func (m *Message) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	// Set default for ToolCalls to valid JSON null
	if m.ToolCalls == "" {
		m.ToolCalls = "null"
	}
	return nil
}
