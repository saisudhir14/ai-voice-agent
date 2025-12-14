package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Agent represents a voice AI agent configuration
type Agent struct {
	BaseModel
	UserID     uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	IndustryID uuid.UUID `gorm:"type:uuid;not null;index" json:"industry_id"`

	Name        string `gorm:"not null" json:"name"`
	Description string `json:"description"`
	IsActive    bool   `gorm:"default:true" json:"is_active"`

	// Voice Configuration
	VoiceID    string  `gorm:"default:a0e99841-438c-4a64-b679-ae501e7d6091" json:"voice_id"`
	VoiceSpeed float64 `gorm:"default:1.0" json:"voice_speed"`

	// AI Configuration
	SystemPrompt string  `gorm:"type:text;not null" json:"system_prompt"`
	Greeting     string  `json:"greeting"`
	LLMModel     string  `gorm:"default:gpt-4o-mini" json:"llm_model"`
	Temperature  float64 `gorm:"default:0.7" json:"temperature"`
	MaxTokens    int     `gorm:"default:1024" json:"max_tokens"`

	// Behavior Configuration
	InterruptionSensitivity float64 `gorm:"default:0.5" json:"interruption_sensitivity"`
	SilenceTimeout          int     `gorm:"default:5000" json:"silence_timeout"` // milliseconds

	// Relations (loaded manually via repository, no FK constraints)
	User          User           `gorm:"-" json:"user,omitempty"`
	Industry      Industry       `gorm:"-" json:"industry,omitempty"`
	Conversations []Conversation `gorm:"-" json:"conversations,omitempty"`
}

// BeforeDelete hook to handle cascade delete for agent
func (a *Agent) BeforeDelete(tx *gorm.DB) error {
	// Delete all conversations belonging to this agent (which cascades to messages)
	var conversations []Conversation
	tx.Where("agent_id = ?", a.ID).Find(&conversations)
	for _, conv := range conversations {
		if err := tx.Delete(&conv).Error; err != nil {
			return err
		}
	}
	// Delete all API keys belonging to this agent
	if err := tx.Where("agent_id = ?", a.ID).Delete(&APIKey{}).Error; err != nil {
		return err
	}
	return nil
}
