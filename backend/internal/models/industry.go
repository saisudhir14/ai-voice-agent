package models

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
