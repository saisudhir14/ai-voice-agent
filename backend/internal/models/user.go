package models

import "gorm.io/gorm"

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

// BeforeDelete hook to handle cascade soft delete for user
// Note: With soft deletes, we soft delete related agents when a user is soft deleted
func (u *User) BeforeDelete(tx *gorm.DB) error {
	// Soft delete all agents belonging to this user (which will cascade to conversations via agent's BeforeDelete)
	var agents []Agent
	tx.Where("user_id = ?", u.ID).Find(&agents)
	for _, agent := range agents {
		// This will trigger soft delete (since Agent has DeletedAt field)
		if err := tx.Delete(&agent).Error; err != nil {
			return err
		}
	}
	return nil
}
