package repository

import (
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/ai-voice-agent/internal/models"
)

type Repositories struct {
	User         *UserRepository
	Industry     *IndustryRepository
	Agent        *AgentRepository
	Conversation *ConversationRepository
	Message      *MessageRepository
}

func NewRepositories(db *gorm.DB) *Repositories {
	return &Repositories{
		User:         NewUserRepository(db),
		Industry:     NewIndustryRepository(db),
		Agent:        NewAgentRepository(db),
		Conversation: NewConversationRepository(db),
		Message:      NewMessageRepository(db),
	}
}

// ==================== User Repository ====================

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *UserRepository) GetByID(id uuid.UUID) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, "id = ?", id).Error
	return &user, err
}

func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, "email = ?", email).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) Update(user *models.User) error {
	return r.db.Save(user).Error
}

func (r *UserRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.User{}, "id = ?", id).Error
}

// ==================== Industry Repository ====================

type IndustryRepository struct {
	db *gorm.DB
}

func NewIndustryRepository(db *gorm.DB) *IndustryRepository {
	return &IndustryRepository{db: db}
}

func (r *IndustryRepository) List() ([]models.Industry, error) {
	var industries []models.Industry
	err := r.db.Where("is_active = ?", true).Order("name ASC").Find(&industries).Error
	return industries, err
}

func (r *IndustryRepository) GetByID(id uuid.UUID) (*models.Industry, error) {
	var industry models.Industry
	err := r.db.First(&industry, "id = ?", id).Error
	return &industry, err
}

func (r *IndustryRepository) GetBySlug(slug string) (*models.Industry, error) {
	var industry models.Industry
	err := r.db.First(&industry, "slug = ?", slug).Error
	return &industry, err
}

// ==================== Agent Repository ====================

type AgentRepository struct {
	db *gorm.DB
}

func NewAgentRepository(db *gorm.DB) *AgentRepository {
	return &AgentRepository{db: db}
}

func (r *AgentRepository) Create(agent *models.Agent) error {
	return r.db.Create(agent).Error
}

func (r *AgentRepository) GetByID(id uuid.UUID) (*models.Agent, error) {
	var agent models.Agent
	err := r.db.First(&agent, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	// Load Industry using hook pattern
	r.loadAgentRelations(&agent)
	return &agent, nil
}

func (r *AgentRepository) ListByUserID(userID uuid.UUID) ([]models.Agent, error) {
	var agents []models.Agent
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&agents).Error
	if err != nil {
		return nil, err
	}
	// Load Industry for each agent
	for i := range agents {
		r.loadAgentRelations(&agents[i])
	}
	return agents, nil
}

// loadAgentRelations loads related entities for an agent
func (r *AgentRepository) loadAgentRelations(agent *models.Agent) {
	if agent.IndustryID != uuid.Nil {
		r.db.First(&agent.Industry, "id = ?", agent.IndustryID)
	}
	if agent.UserID != uuid.Nil {
		r.db.First(&agent.User, "id = ?", agent.UserID)
	}
}

func (r *AgentRepository) Update(agent *models.Agent) error {
	return r.db.Save(agent).Error
}

func (r *AgentRepository) Delete(id uuid.UUID) error {
	// BeforeDelete hook will handle cascade
	var agent models.Agent
	if err := r.db.First(&agent, "id = ?", id).Error; err != nil {
		return err
	}
	return r.db.Delete(&agent).Error
}

func (r *AgentRepository) CountByUserID(userID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Model(&models.Agent{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}

// ==================== Conversation Repository ====================

type ConversationRepository struct {
	db *gorm.DB
}

func NewConversationRepository(db *gorm.DB) *ConversationRepository {
	return &ConversationRepository{db: db}
}

func (r *ConversationRepository) Create(conversation *models.Conversation) error {
	return r.db.Create(conversation).Error
}

func (r *ConversationRepository) GetByID(id uuid.UUID) (*models.Conversation, error) {
	var conversation models.Conversation
	err := r.db.First(&conversation, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	// Load relations using hooks pattern
	r.loadConversationRelations(&conversation, true)
	return &conversation, nil
}

func (r *ConversationRepository) GetBySessionID(sessionID string) (*models.Conversation, error) {
	var conversation models.Conversation
	err := r.db.First(&conversation, "session_id = ?", sessionID).Error
	if err != nil {
		return nil, err
	}
	// Load messages
	r.loadConversationRelations(&conversation, true)
	return &conversation, nil
}

// loadConversationRelations loads related entities for a conversation
func (r *ConversationRepository) loadConversationRelations(conv *models.Conversation, includeMessages bool) {
	// Load Agent
	if conv.AgentID != uuid.Nil {
		r.db.First(&conv.Agent, "id = ?", conv.AgentID)
		// Also load agent's industry
		if conv.Agent.IndustryID != uuid.Nil {
			r.db.First(&conv.Agent.Industry, "id = ?", conv.Agent.IndustryID)
		}
	}
	// Load Messages if requested
	if includeMessages {
		r.db.Where("conversation_id = ?", conv.ID).Order("start_time ASC").Find(&conv.Messages)
	}
}

func (r *ConversationRepository) ListByAgentID(agentID uuid.UUID, limit, offset int) ([]models.Conversation, error) {
	var conversations []models.Conversation
	err := r.db.Where("agent_id = ?", agentID).
		Order("started_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&conversations).Error
	return conversations, err
}

func (r *ConversationRepository) ListByUserID(userID uuid.UUID, limit, offset int) ([]models.Conversation, error) {
	var conversations []models.Conversation
	err := r.db.Joins("JOIN agents ON agents.id = conversations.agent_id").
		Where("agents.user_id = ?", userID).
		Order("conversations.started_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&conversations).Error
	if err != nil {
		return nil, err
	}
	// Load Agent for each conversation
	for i := range conversations {
		r.loadConversationRelations(&conversations[i], false)
	}
	return conversations, nil
}

func (r *ConversationRepository) Update(conversation *models.Conversation) error {
	return r.db.Save(conversation).Error
}

func (r *ConversationRepository) Delete(id uuid.UUID) error {
	// BeforeDelete hook will handle cascade delete of messages
	var conversation models.Conversation
	if err := r.db.First(&conversation, "id = ?", id).Error; err != nil {
		return err
	}
	return r.db.Delete(&conversation).Error
}

// ==================== Message Repository ====================

type MessageRepository struct {
	db *gorm.DB
}

func NewMessageRepository(db *gorm.DB) *MessageRepository {
	return &MessageRepository{db: db}
}

func (r *MessageRepository) Create(message *models.Message) error {
	return r.db.Create(message).Error
}

func (r *MessageRepository) CreateBatch(messages []models.Message) error {
	return r.db.Create(&messages).Error
}

func (r *MessageRepository) ListByConversationID(conversationID uuid.UUID) ([]models.Message, error) {
	var messages []models.Message
	err := r.db.Where("conversation_id = ?", conversationID).
		Order("start_time ASC").
		Find(&messages).Error
	return messages, err
}
