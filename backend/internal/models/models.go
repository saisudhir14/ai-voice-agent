package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Base model with UUID
type BaseModel struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// User represents a platform user
type User struct {
	BaseModel
	Email        string  `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string  `gorm:"not null" json:"-"`
	Name         string  `gorm:"not null" json:"name"`
	Company      *string `json:"company,omitempty"`
	Role         string  `gorm:"default:user" json:"role"` // user, admin

	// Relations
	Agents []Agent `gorm:"foreignKey:UserID" json:"agents,omitempty"`
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

	// Relations
	Agents []Agent `gorm:"foreignKey:IndustryID" json:"agents,omitempty"`
}

// Agent represents a voice AI agent configuration
type Agent struct {
	BaseModel
	UserID     uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	IndustryID uuid.UUID `gorm:"type:uuid;not null" json:"industry_id"`

	Name        string `gorm:"not null" json:"name"`
	Description string `json:"description"`
	IsActive    bool   `gorm:"default:true" json:"is_active"`

	// Voice Configuration
	VoiceID    string `gorm:"default:a0e99841-438c-4a64-b679-ae501e7d6091" json:"voice_id"`
	VoiceSpeed float64 `gorm:"default:1.0" json:"voice_speed"`

	// AI Configuration
	SystemPrompt     string  `gorm:"type:text;not null" json:"system_prompt"`
	Greeting         string  `json:"greeting"`
	LLMModel         string  `gorm:"default:claude-3-haiku-20240307" json:"llm_model"`
	Temperature      float64 `gorm:"default:0.7" json:"temperature"`
	MaxTokens        int     `gorm:"default:1024" json:"max_tokens"`

	// Behavior Configuration
	InterruptionSensitivity float64 `gorm:"default:0.5" json:"interruption_sensitivity"`
	SilenceTimeout          int     `gorm:"default:5000" json:"silence_timeout"` // milliseconds

	// Relations
	User          User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Industry      Industry       `gorm:"foreignKey:IndustryID" json:"industry,omitempty"`
	Conversations []Conversation `gorm:"foreignKey:AgentID" json:"conversations,omitempty"`
}

// Conversation represents a voice conversation session
type Conversation struct {
	BaseModel
	AgentID   uuid.UUID `gorm:"type:uuid;not null" json:"agent_id"`
	SessionID string    `gorm:"uniqueIndex;not null" json:"session_id"`

	// Metadata
	CallerInfo   string     `json:"caller_info,omitempty"`
	StartedAt    time.Time  `gorm:"not null" json:"started_at"`
	EndedAt      *time.Time `json:"ended_at,omitempty"`
	DurationSecs int        `json:"duration_secs"`

	// Summary
	Summary   string `gorm:"type:text" json:"summary,omitempty"`
	Sentiment string `json:"sentiment,omitempty"` // positive, neutral, negative

	// Relations
	Agent    Agent     `gorm:"foreignKey:AgentID" json:"agent,omitempty"`
	Messages []Message `gorm:"foreignKey:ConversationID" json:"messages,omitempty"`
}

// Message represents a single message in a conversation
type Message struct {
	BaseModel
	ConversationID uuid.UUID `gorm:"type:uuid;not null" json:"conversation_id"`

	Role      string `gorm:"not null" json:"role"` // user, assistant
	Content   string `gorm:"type:text;not null" json:"content"`
	AudioURL  string `json:"audio_url,omitempty"`

	// Timing
	StartTime int `json:"start_time"` // milliseconds from conversation start
	EndTime   int `json:"end_time"`

	// Metadata
	Confidence float64 `json:"confidence,omitempty"` // STT confidence
	ToolCalls  string  `gorm:"type:jsonb" json:"tool_calls,omitempty"`
}

// APIKey represents an API key for agent access
type APIKey struct {
	BaseModel
	UserID    uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	AgentID   uuid.UUID `gorm:"type:uuid;not null" json:"agent_id"`

	Name      string    `gorm:"not null" json:"name"`
	KeyHash   string    `gorm:"not null" json:"-"`
	KeyPrefix string    `gorm:"not null" json:"key_prefix"` // First 8 chars for identification
	IsActive  bool      `gorm:"default:true" json:"is_active"`
	ExpiresAt *time.Time `json:"expires_at,omitempty"`
	LastUsed  *time.Time `json:"last_used,omitempty"`

	// Relations
	User  User  `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Agent Agent `gorm:"foreignKey:AgentID" json:"agent,omitempty"`
}

