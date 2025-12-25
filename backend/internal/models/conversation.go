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

// BeforeDelete hook to handle cascade soft delete for conversation
// Note: With soft deletes, we soft delete related messages when a conversation is soft deleted
func (c *Conversation) BeforeDelete(tx *gorm.DB) error {
	// Soft delete all messages belonging to this conversation
	// Note: Using Delete with model instances ensures soft delete
	var messages []Message
	if err := tx.Where("conversation_id = ?", c.ID).Find(&messages).Error; err != nil {
		return err
	}
	for _, msg := range messages {
		if err := tx.Delete(&msg).Error; err != nil {
			return err
		}
	}
	return nil
}
