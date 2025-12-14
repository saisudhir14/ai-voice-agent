package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Conversation represents a voice conversation session
type Conversation struct {
	BaseModel
	AgentID   uuid.UUID `gorm:"type:uuid;not null;index" json:"agent_id"`
	SessionID string    `gorm:"uniqueIndex;not null" json:"session_id"`

	// Metadata
	CallerInfo   string     `json:"caller_info,omitempty"`
	StartedAt    time.Time  `gorm:"not null" json:"started_at"`
	EndedAt      *time.Time `json:"ended_at,omitempty"`
	DurationSecs int        `json:"duration_secs"`

	// Summary
	Summary   string `gorm:"type:text" json:"summary,omitempty"`
	Sentiment string `json:"sentiment,omitempty"` // positive, neutral, negative

	// Relations (loaded manually via repository, no FK constraints)
	Agent    Agent     `gorm:"-" json:"agent,omitempty"`
	Messages []Message `gorm:"-" json:"messages,omitempty"`
}

// BeforeDelete hook to handle cascade delete for conversation
func (c *Conversation) BeforeDelete(tx *gorm.DB) error {
	// Delete all messages belonging to this conversation
	if err := tx.Where("conversation_id = ?", c.ID).Delete(&Message{}).Error; err != nil {
		return err
	}
	return nil
}
