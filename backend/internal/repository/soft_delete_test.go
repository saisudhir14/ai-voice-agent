package repository

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/yourusername/ai-voice-agent/internal/models"
)

// setupTestDB creates an in-memory SQLite database for testing
func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err, "Failed to connect to test database")

	// Auto-migrate all models
	err = db.AutoMigrate(
		&models.User{},
		&models.Industry{},
		&models.Agent{},
		&models.Conversation{},
		&models.Message{},
		&models.APIKey{},
	)
	require.NoError(t, err, "Failed to migrate test database")

	return db
}

// TestUserSoftDelete verifies that user deletion is soft delete
func TestUserSoftDelete(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepository(db)

	// Create a user
	user := &models.User{
		Email:        "test@example.com",
		PasswordHash: "hashedpassword",
		Name:         "Test User",
		Role:         "user",
	}
	err := repo.Create(user)
	require.NoError(t, err)
	require.NotEqual(t, uuid.Nil, user.ID)

	// Delete the user
	err = repo.Delete(user.ID)
	require.NoError(t, err)

	// Verify user is soft deleted (not retrievable by normal query)
	_, err = repo.GetByID(user.ID)
	assert.Error(t, err, "Soft-deleted user should not be retrievable")

	// Verify user still exists in database with deleted_at set
	var deletedUser models.User
	err = db.Unscoped().First(&deletedUser, "id = ?", user.ID).Error
	require.NoError(t, err, "User should still exist in database")
	assert.NotNil(t, deletedUser.DeletedAt.Time, "DeletedAt should be set")
	assert.True(t, deletedUser.DeletedAt.Valid, "DeletedAt should be valid")
}

// TestAgentSoftDelete verifies that agent deletion is soft delete
func TestAgentSoftDelete(t *testing.T) {
	db := setupTestDB(t)
	agentRepo := NewAgentRepository(db)
	userRepo := NewUserRepository(db)

	// Create dependencies
	user := &models.User{
		Email:        "test@example.com",
		PasswordHash: "hashedpassword",
		Name:         "Test User",
		Role:         "user",
	}
	err := userRepo.Create(user)
	require.NoError(t, err)

	industry := &models.Industry{
		Name:                "Test Industry",
		Slug:                "test",
		DefaultSystemPrompt: "You are a helpful assistant",
		IsActive:            true,
	}
	err = db.Create(industry).Error
	require.NoError(t, err)

	// Create an agent
	agent := &models.Agent{
		UserID:       user.ID,
		IndustryID:   industry.ID,
		Name:         "Test Agent",
		SystemPrompt: "Test prompt",
		IsActive:     true,
	}
	err = agentRepo.Create(agent)
	require.NoError(t, err)

	// Delete the agent
	err = agentRepo.Delete(agent.ID)
	require.NoError(t, err)

	// Verify agent is soft deleted (not retrievable by normal query)
	_, err = agentRepo.GetByID(agent.ID)
	assert.Error(t, err, "Soft-deleted agent should not be retrievable")

	// Verify agent still exists in database with deleted_at set
	var deletedAgent models.Agent
	err = db.Unscoped().First(&deletedAgent, "id = ?", agent.ID).Error
	require.NoError(t, err, "Agent should still exist in database")
	assert.NotNil(t, deletedAgent.DeletedAt.Time, "DeletedAt should be set")
	assert.True(t, deletedAgent.DeletedAt.Valid, "DeletedAt should be valid")
}

// TestConversationSoftDelete verifies that conversation deletion is soft delete
func TestConversationSoftDelete(t *testing.T) {
	db := setupTestDB(t)
	conversationRepo := NewConversationRepository(db)
	agentRepo := NewAgentRepository(db)
	userRepo := NewUserRepository(db)

	// Create dependencies
	user := &models.User{
		Email:        "test@example.com",
		PasswordHash: "hashedpassword",
		Name:         "Test User",
		Role:         "user",
	}
	err := userRepo.Create(user)
	require.NoError(t, err)

	industry := &models.Industry{
		Name:                "Test Industry",
		Slug:                "test",
		DefaultSystemPrompt: "Test",
		IsActive:            true,
	}
	err = db.Create(industry).Error
	require.NoError(t, err)

	agent := &models.Agent{
		UserID:       user.ID,
		IndustryID:   industry.ID,
		Name:         "Test Agent",
		SystemPrompt: "Test",
		IsActive:     true,
	}
	err = agentRepo.Create(agent)
	require.NoError(t, err)

	// Create a conversation
	conversation := &models.Conversation{
		AgentID:   agent.ID,
		SessionID: "test-session-123",
		StartedAt: time.Now(),
	}
	err = conversationRepo.Create(conversation)
	require.NoError(t, err)

	// Delete the conversation
	err = conversationRepo.Delete(conversation.ID)
	require.NoError(t, err)

	// Verify conversation is soft deleted
	_, err = conversationRepo.GetByID(conversation.ID)
	assert.Error(t, err, "Soft-deleted conversation should not be retrievable")

	// Verify conversation still exists in database
	var deletedConv models.Conversation
	err = db.Unscoped().First(&deletedConv, "id = ?", conversation.ID).Error
	require.NoError(t, err, "Conversation should still exist in database")
	assert.NotNil(t, deletedConv.DeletedAt.Time, "DeletedAt should be set")
	assert.True(t, deletedConv.DeletedAt.Valid, "DeletedAt should be valid")
}

// TestCascadeSoftDelete_Agent verifies cascade soft delete from agent to conversations and messages
func TestCascadeSoftDelete_Agent(t *testing.T) {
	db := setupTestDB(t)
	agentRepo := NewAgentRepository(db)
	conversationRepo := NewConversationRepository(db)
	messageRepo := NewMessageRepository(db)
	userRepo := NewUserRepository(db)

	// Create user and industry
	user := &models.User{
		Email:        "test@example.com",
		PasswordHash: "hashedpassword",
		Name:         "Test User",
		Role:         "user",
	}
	err := userRepo.Create(user)
	require.NoError(t, err)

	industry := &models.Industry{
		Name:                "Test Industry",
		Slug:                "test",
		DefaultSystemPrompt: "Test",
		IsActive:            true,
	}
	err = db.Create(industry).Error
	require.NoError(t, err)

	// Create agent
	agent := &models.Agent{
		UserID:       user.ID,
		IndustryID:   industry.ID,
		Name:         "Test Agent",
		SystemPrompt: "Test",
		IsActive:     true,
	}
	err = agentRepo.Create(agent)
	require.NoError(t, err)

	// Create conversation
	conversation := &models.Conversation{
		AgentID:   agent.ID,
		SessionID: "test-session-456",
		StartedAt: time.Now(),
	}
	err = conversationRepo.Create(conversation)
	require.NoError(t, err)

	// Create message
	message := &models.Message{
		ConversationID: conversation.ID,
		Role:           "user",
		Content:        "Hello",
		StartTime:      0,
		EndTime:        100,
	}
	err = messageRepo.Create(message)
	require.NoError(t, err)

	// Delete agent (should cascade to conversation and message)
	err = agentRepo.Delete(agent.ID)
	require.NoError(t, err)

	// Verify agent is soft deleted
	_, err = agentRepo.GetByID(agent.ID)
	assert.Error(t, err, "Agent should not be retrievable")

	// Verify conversation is soft deleted (cascaded)
	_, err = conversationRepo.GetByID(conversation.ID)
	assert.Error(t, err, "Conversation should be soft deleted via cascade")

	// Verify message is soft deleted (cascaded)
	messages, err := messageRepo.ListByConversationID(conversation.ID)
	require.NoError(t, err)
	assert.Empty(t, messages, "Messages should be soft deleted via cascade")

	// Verify all records still exist in database with deleted_at set
	var deletedAgent models.Agent
	err = db.Unscoped().First(&deletedAgent, "id = ?", agent.ID).Error
	require.NoError(t, err)
	assert.True(t, deletedAgent.DeletedAt.Valid, "Agent DeletedAt should be set")

	var deletedConv models.Conversation
	err = db.Unscoped().First(&deletedConv, "id = ?", conversation.ID).Error
	require.NoError(t, err)
	assert.True(t, deletedConv.DeletedAt.Valid, "Conversation DeletedAt should be set")

	var deletedMsg models.Message
	err = db.Unscoped().First(&deletedMsg, "id = ?", message.ID).Error
	require.NoError(t, err)
	assert.True(t, deletedMsg.DeletedAt.Valid, "Message DeletedAt should be set")
}

// TestCascadeSoftDelete_User verifies cascade soft delete from user to agents, conversations, and messages
func TestCascadeSoftDelete_User(t *testing.T) {
	db := setupTestDB(t)
	userRepo := NewUserRepository(db)
	agentRepo := NewAgentRepository(db)
	conversationRepo := NewConversationRepository(db)
	messageRepo := NewMessageRepository(db)

	// Create user
	user := &models.User{
		Email:        "test@example.com",
		PasswordHash: "hashedpassword",
		Name:         "Test User",
		Role:         "user",
	}
	err := userRepo.Create(user)
	require.NoError(t, err)

	// Create industry
	industry := &models.Industry{
		Name:                "Test Industry",
		Slug:                "test",
		DefaultSystemPrompt: "Test",
		IsActive:            true,
	}
	err = db.Create(industry).Error
	require.NoError(t, err)

	// Create agent
	agent := &models.Agent{
		UserID:       user.ID,
		IndustryID:   industry.ID,
		Name:         "Test Agent",
		SystemPrompt: "Test",
		IsActive:     true,
	}
	err = agentRepo.Create(agent)
	require.NoError(t, err)

	// Create conversation
	conversation := &models.Conversation{
		AgentID:   agent.ID,
		SessionID: "test-session-789",
		StartedAt: time.Now(),
	}
	err = conversationRepo.Create(conversation)
	require.NoError(t, err)

	// Create message
	message := &models.Message{
		ConversationID: conversation.ID,
		Role:           "user",
		Content:        "Hello from user cascade test",
		StartTime:      0,
		EndTime:        100,
	}
	err = messageRepo.Create(message)
	require.NoError(t, err)

	// Delete user (should cascade through entire hierarchy)
	err = userRepo.Delete(user.ID)
	require.NoError(t, err)

	// Verify all are soft deleted
	_, err = userRepo.GetByID(user.ID)
	assert.Error(t, err, "User should not be retrievable")

	_, err = agentRepo.GetByID(agent.ID)
	assert.Error(t, err, "Agent should be soft deleted via cascade")

	_, err = conversationRepo.GetByID(conversation.ID)
	assert.Error(t, err, "Conversation should be soft deleted via cascade")

	messages, err := messageRepo.ListByConversationID(conversation.ID)
	require.NoError(t, err)
	assert.Empty(t, messages, "Messages should be soft deleted via cascade")

	// Verify all still exist with deleted_at set
	var deletedUser models.User
	err = db.Unscoped().First(&deletedUser, "id = ?", user.ID).Error
	require.NoError(t, err)
	assert.True(t, deletedUser.DeletedAt.Valid)

	var deletedAgent models.Agent
	err = db.Unscoped().First(&deletedAgent, "id = ?", agent.ID).Error
	require.NoError(t, err)
	assert.True(t, deletedAgent.DeletedAt.Valid)

	var deletedConv models.Conversation
	err = db.Unscoped().First(&deletedConv, "id = ?", conversation.ID).Error
	require.NoError(t, err)
	assert.True(t, deletedConv.DeletedAt.Valid)

	var deletedMsg models.Message
	err = db.Unscoped().First(&deletedMsg, "id = ?", message.ID).Error
	require.NoError(t, err)
	assert.True(t, deletedMsg.DeletedAt.Valid)
}

// TestAPIKeySoftDelete verifies API key soft delete via agent cascade
func TestAPIKeySoftDelete_AgentCascade(t *testing.T) {
	db := setupTestDB(t)
	userRepo := NewUserRepository(db)
	agentRepo := NewAgentRepository(db)

	// Create user
	user := &models.User{
		Email:        "test@example.com",
		PasswordHash: "hashedpassword",
		Name:         "Test User",
		Role:         "user",
	}
	err := userRepo.Create(user)
	require.NoError(t, err)

	// Create industry
	industry := &models.Industry{
		Name:                "Test Industry",
		Slug:                "test",
		DefaultSystemPrompt: "Test",
		IsActive:            true,
	}
	err = db.Create(industry).Error
	require.NoError(t, err)

	// Create agent
	agent := &models.Agent{
		UserID:       user.ID,
		IndustryID:   industry.ID,
		Name:         "Test Agent",
		SystemPrompt: "Test",
		IsActive:     true,
	}
	err = agentRepo.Create(agent)
	require.NoError(t, err)

	// Create API key
	apiKey := &models.APIKey{
		UserID:    user.ID,
		AgentID:   agent.ID,
		Name:      "Test API Key",
		KeyHash:   "hashedkey",
		KeyPrefix: "test_123",
		IsActive:  true,
	}
	err = db.Create(apiKey).Error
	require.NoError(t, err)

	// Delete agent (should cascade to API key)
	err = agentRepo.Delete(agent.ID)
	require.NoError(t, err)

	// Verify API key is soft deleted
	var foundKey models.APIKey
	err = db.First(&foundKey, "id = ?", apiKey.ID).Error
	assert.Error(t, err, "API key should be soft deleted")

	// Verify API key still exists with deleted_at set
	var deletedKey models.APIKey
	err = db.Unscoped().First(&deletedKey, "id = ?", apiKey.ID).Error
	require.NoError(t, err)
	assert.True(t, deletedKey.DeletedAt.Valid, "API key DeletedAt should be set")
}

// TestListExcludesSoftDeleted verifies that list queries exclude soft-deleted records
func TestListExcludesSoftDeleted(t *testing.T) {
	db := setupTestDB(t)
	agentRepo := NewAgentRepository(db)
	userRepo := NewUserRepository(db)

	// Create user
	user := &models.User{
		Email:        "test@example.com",
		PasswordHash: "hashedpassword",
		Name:         "Test User",
		Role:         "user",
	}
	err := userRepo.Create(user)
	require.NoError(t, err)

	// Create industry
	industry := &models.Industry{
		Name:                "Test Industry",
		Slug:                "test",
		DefaultSystemPrompt: "Test",
		IsActive:            true,
	}
	err = db.Create(industry).Error
	require.NoError(t, err)

	// Create 3 agents
	agent1 := &models.Agent{
		UserID:       user.ID,
		IndustryID:   industry.ID,
		Name:         "Agent 1",
		SystemPrompt: "Test",
		IsActive:     true,
	}
	agent2 := &models.Agent{
		UserID:       user.ID,
		IndustryID:   industry.ID,
		Name:         "Agent 2",
		SystemPrompt: "Test",
		IsActive:     true,
	}
	agent3 := &models.Agent{
		UserID:       user.ID,
		IndustryID:   industry.ID,
		Name:         "Agent 3",
		SystemPrompt: "Test",
		IsActive:     true,
	}

	err = agentRepo.Create(agent1)
	require.NoError(t, err)
	err = agentRepo.Create(agent2)
	require.NoError(t, err)
	err = agentRepo.Create(agent3)
	require.NoError(t, err)

	// List all agents (should be 3)
	agents, err := agentRepo.ListByUserID(user.ID)
	require.NoError(t, err)
	assert.Len(t, agents, 3, "Should have 3 agents")

	// Soft delete agent2
	err = agentRepo.Delete(agent2.ID)
	require.NoError(t, err)

	// List all agents again (should be 2)
	agents, err = agentRepo.ListByUserID(user.ID)
	require.NoError(t, err)
	assert.Len(t, agents, 2, "Should have 2 agents after soft delete")

	// Verify deleted agent is not in the list
	for _, a := range agents {
		assert.NotEqual(t, agent2.ID, a.ID, "Deleted agent should not be in list")
	}
}
