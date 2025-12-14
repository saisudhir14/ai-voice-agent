package models

import (
	"time"

	"github.com/google/uuid"
)

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
