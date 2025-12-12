package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Base model with UUID
type BaseModel struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// BeforeCreate hook to generate UUID before insert
func (b *BaseModel) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}

// User represents a platform user
type User struct {
	BaseModel
	Email        string  `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string  `gorm:"not null" json:"-"`
	Name         string  `gorm:"not null" json:"name"`
	Company      *string `json:"company,omitempty"`
	Role         string  `gorm:"default:user" json:"role"` // user, admin

	// Relations (loaded manually via repository, no FK constraints)
	Agents []Agent `gorm:"-" json:"agents,omitempty"`
}

// BeforeDelete hook to handle cascade delete for user
func (u *User) BeforeDelete(tx *gorm.DB) error {
	// Delete all agents belonging to this user (which cascades to conversations)
	var agents []Agent
	tx.Where("user_id = ?", u.ID).Find(&agents)
	for _, agent := range agents {
		if err := tx.Delete(&agent).Error; err != nil {
			return err
		}
	}
	return nil
}

// Industry represents a business industry category
type Industry struct {
	BaseModel
	Name        string `gorm:"uniqueIndex;not null" json:"name"`
	Slug        string `gorm:"uniqueIndex;not null" json:"slug"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	IsActive    bool   `gorm:"default:true" json:"is_active"`

	// Default prompts for this industry
	DefaultSystemPrompt string `gorm:"type:text" json:"default_system_prompt"`
	DefaultGreeting     string `json:"default_greeting"`

	// Relations (loaded manually via repository, no FK constraints)
	Agents []Agent `gorm:"-" json:"agents,omitempty"`
}

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

// APIKey represents an API key for agent access
type APIKey struct {
	BaseModel
	UserID  uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	AgentID uuid.UUID `gorm:"type:uuid;not null;index" json:"agent_id"`

	Name      string     `gorm:"not null" json:"name"`
	KeyHash   string     `gorm:"not null" json:"-"`
	KeyPrefix string     `gorm:"not null" json:"key_prefix"` // First 8 chars for identification
	IsActive  bool       `gorm:"default:true" json:"is_active"`
	ExpiresAt *time.Time `json:"expires_at,omitempty"`
	LastUsed  *time.Time `json:"last_used,omitempty"`

	// Relations (loaded manually via repository, no FK constraints)
	User  User  `gorm:"-" json:"user,omitempty"`
	Agent Agent `gorm:"-" json:"agent,omitempty"`
}
