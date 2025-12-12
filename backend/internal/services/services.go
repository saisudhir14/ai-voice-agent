package services

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"github.com/yourusername/ai-voice-agent/internal/config"
	"github.com/yourusername/ai-voice-agent/internal/logger"
	"github.com/yourusername/ai-voice-agent/internal/middleware"
	"github.com/yourusername/ai-voice-agent/internal/models"
	"github.com/yourusername/ai-voice-agent/internal/repository"
)

// Common errors
var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserExists         = errors.New("user already exists")
	ErrNotFound           = errors.New("not found")
	ErrUnauthorized       = errors.New("unauthorized")
)

// Services holds all application services
type Services struct {
	Auth         *AuthService
	User         *UserService
	Industry     *IndustryService
	Agent        *AgentService
	Conversation *ConversationService
}

// NewServices creates all services with their dependencies
func NewServices(repos *repository.Repositories, cfg *config.Config) *Services {
	return &Services{
		Auth:         NewAuthService(repos.User, cfg),
		User:         NewUserService(repos.User),
		Industry:     NewIndustryService(repos.Industry),
		Agent:        NewAgentService(repos.Agent, repos.Industry),
		Conversation: NewConversationService(repos.Conversation, repos.Message, repos.Agent),
	}
}

// ==================== Auth Service ====================

type AuthService struct {
	userRepo *repository.UserRepository
	cfg      *config.Config
}

func NewAuthService(userRepo *repository.UserRepository, cfg *config.Config) *AuthService {
	return &AuthService{userRepo: userRepo, cfg: cfg}
}

// RegisterInput holds user registration data
type RegisterInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
	Company  string `json:"company,omitempty"`
}

// LoginInput holds user login data
type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// AuthResponse contains authentication tokens and user info
type AuthResponse struct {
	User         *models.User `json:"user"`
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	ExpiresAt    time.Time    `json:"expires_at"`
}

// Register creates a new user account
func (s *AuthService) Register(input RegisterInput) (*AuthResponse, error) {
	log := logger.WithComponent("auth-service")

	// Check if user exists
	existing, err := s.userRepo.GetByEmail(input.Email)
	if err == nil && existing != nil {
		return nil, ErrUserExists
	}

	// Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Error().Err(err).Msg("Failed to hash password")
		return nil, err
	}

	// Create user
	user := &models.User{
		Email:        input.Email,
		PasswordHash: string(hash),
		Name:         input.Name,
		Role:         "user",
	}
	if input.Company != "" {
		user.Company = &input.Company
	}

	if err := s.userRepo.Create(user); err != nil {
		log.Error().Err(err).Str("email", input.Email).Msg("Failed to create user")
		return nil, err
	}

	log.Info().Str("user_id", user.ID.String()).Str("email", input.Email).Msg("User registered")
	return s.generateTokens(user)
}

// Login authenticates a user and returns tokens
func (s *AuthService) Login(input LoginInput) (*AuthResponse, error) {
	log := logger.WithComponent("auth-service")

	user, err := s.userRepo.GetByEmail(input.Email)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		log.Debug().Str("email", input.Email).Msg("Invalid password attempt")
		return nil, ErrInvalidCredentials
	}

	log.Info().Str("user_id", user.ID.String()).Msg("User logged in")
	return s.generateTokens(user)
}

// RefreshToken generates new tokens from a valid refresh token
func (s *AuthService) RefreshToken(refreshToken string) (*AuthResponse, error) {
	log := logger.WithComponent("auth-service")

	// Parse refresh token
	token, err := jwt.ParseWithClaims(refreshToken, &middleware.Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.cfg.JWTSecret), nil
	})

	if err != nil || !token.Valid {
		return nil, ErrUnauthorized
	}

	claims, ok := token.Claims.(*middleware.Claims)
	if !ok {
		return nil, ErrUnauthorized
	}

	user, err := s.userRepo.GetByID(claims.UserID)
	if err != nil {
		return nil, ErrUnauthorized
	}

	log.Debug().Str("user_id", user.ID.String()).Msg("Token refreshed")
	return s.generateTokens(user)
}

func (s *AuthService) generateTokens(user *models.User) (*AuthResponse, error) {
	expiresAt := time.Now().Add(24 * time.Hour)

	// Access token
	accessClaims := &middleware.Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return nil, err
	}

	// Refresh token (longer expiry)
	refreshClaims := &middleware.Claims{
		UserID: user.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		User:         user,
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
		ExpiresAt:    expiresAt,
	}, nil
}

// ==================== User Service ====================

type UserService struct {
	userRepo *repository.UserRepository
}

func NewUserService(userRepo *repository.UserRepository) *UserService {
	return &UserService{userRepo: userRepo}
}

// GetByID retrieves a user by ID
func (s *UserService) GetByID(id uuid.UUID) (*models.User, error) {
	return s.userRepo.GetByID(id)
}

// Update updates user profile information
func (s *UserService) Update(id uuid.UUID, name, company string) (*models.User, error) {
	log := logger.WithComponent("user-service")

	user, err := s.userRepo.GetByID(id)
	if err != nil {
		return nil, ErrNotFound
	}

	user.Name = name
	if company != "" {
		user.Company = &company
	}

	if err := s.userRepo.Update(user); err != nil {
		log.Error().Err(err).Str("user_id", id.String()).Msg("Failed to update user")
		return nil, err
	}

	return user, nil
}

// ==================== Industry Service ====================

type IndustryService struct {
	industryRepo *repository.IndustryRepository
}

func NewIndustryService(industryRepo *repository.IndustryRepository) *IndustryService {
	return &IndustryService{industryRepo: industryRepo}
}

// List returns all active industries
func (s *IndustryService) List() ([]models.Industry, error) {
	return s.industryRepo.List()
}

// GetByID retrieves an industry by ID
func (s *IndustryService) GetByID(id uuid.UUID) (*models.Industry, error) {
	return s.industryRepo.GetByID(id)
}

// ==================== Agent Service ====================

type AgentService struct {
	agentRepo    *repository.AgentRepository
	industryRepo *repository.IndustryRepository
}

func NewAgentService(agentRepo *repository.AgentRepository, industryRepo *repository.IndustryRepository) *AgentService {
	return &AgentService{agentRepo: agentRepo, industryRepo: industryRepo}
}

// CreateAgentInput holds data for creating an agent
type CreateAgentInput struct {
	IndustryID   uuid.UUID `json:"industry_id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	SystemPrompt string    `json:"system_prompt"`
	Greeting     string    `json:"greeting"`
	VoiceID      string    `json:"voice_id"`
	LLMModel     string    `json:"llm_model"`
	Temperature  float64   `json:"temperature"`
}

// UpdateAgentInput holds data for updating an agent
type UpdateAgentInput struct {
	Name         string  `json:"name"`
	Description  string  `json:"description"`
	SystemPrompt string  `json:"system_prompt"`
	Greeting     string  `json:"greeting"`
	VoiceID      string  `json:"voice_id"`
	LLMModel     string  `json:"llm_model"`
	Temperature  float64 `json:"temperature"`
	IsActive     bool    `json:"is_active"`
}

// Create creates a new agent
func (s *AgentService) Create(userID uuid.UUID, input CreateAgentInput) (*models.Agent, error) {
	log := logger.WithComponent("agent-service")

	// Get industry defaults if not provided
	industry, err := s.industryRepo.GetByID(input.IndustryID)
	if err != nil {
		return nil, ErrNotFound
	}

	agent := &models.Agent{
		UserID:       userID,
		IndustryID:   input.IndustryID,
		Name:         input.Name,
		Description:  input.Description,
		SystemPrompt: input.SystemPrompt,
		Greeting:     input.Greeting,
		VoiceID:      input.VoiceID,
		LLMModel:     input.LLMModel,
		Temperature:  input.Temperature,
		IsActive:     true,
	}

	// Use industry defaults if not provided
	if agent.SystemPrompt == "" {
		agent.SystemPrompt = industry.DefaultSystemPrompt
	}
	if agent.Greeting == "" {
		agent.Greeting = industry.DefaultGreeting
	}
	if agent.VoiceID == "" {
		agent.VoiceID = "a0e99841-438c-4a64-b679-ae501e7d6091"
	}
	if agent.LLMModel == "" {
		agent.LLMModel = "gpt-4o-mini"
	}
	if agent.Temperature == 0 {
		agent.Temperature = 0.7
	}

	if err := s.agentRepo.Create(agent); err != nil {
		log.Error().Err(err).Str("user_id", userID.String()).Msg("Failed to create agent")
		return nil, err
	}

	log.Info().
		Str("agent_id", agent.ID.String()).
		Str("agent_name", agent.Name).
		Str("user_id", userID.String()).
		Msg("Agent created")

	return s.agentRepo.GetByID(agent.ID)
}

// GetByID retrieves an agent by ID
func (s *AgentService) GetByID(id uuid.UUID) (*models.Agent, error) {
	return s.agentRepo.GetByID(id)
}

// ListByUserID returns all agents for a user
func (s *AgentService) ListByUserID(userID uuid.UUID) ([]models.Agent, error) {
	return s.agentRepo.ListByUserID(userID)
}

// Update updates an agent
func (s *AgentService) Update(id uuid.UUID, userID uuid.UUID, input UpdateAgentInput) (*models.Agent, error) {
	log := logger.WithComponent("agent-service")

	agent, err := s.agentRepo.GetByID(id)
	if err != nil {
		return nil, ErrNotFound
	}

	if agent.UserID != userID {
		return nil, ErrUnauthorized
	}

	agent.Name = input.Name
	agent.Description = input.Description
	agent.SystemPrompt = input.SystemPrompt
	agent.Greeting = input.Greeting
	agent.VoiceID = input.VoiceID
	agent.LLMModel = input.LLMModel
	agent.Temperature = input.Temperature
	agent.IsActive = input.IsActive

	if err := s.agentRepo.Update(agent); err != nil {
		log.Error().Err(err).Str("agent_id", id.String()).Msg("Failed to update agent")
		return nil, err
	}

	return agent, nil
}

// Delete removes an agent
func (s *AgentService) Delete(id uuid.UUID, userID uuid.UUID) error {
	log := logger.WithComponent("agent-service")

	agent, err := s.agentRepo.GetByID(id)
	if err != nil {
		return ErrNotFound
	}

	if agent.UserID != userID {
		return ErrUnauthorized
	}

	if err := s.agentRepo.Delete(id); err != nil {
		log.Error().Err(err).Str("agent_id", id.String()).Msg("Failed to delete agent")
		return err
	}

	log.Info().Str("agent_id", id.String()).Msg("Agent deleted")
	return nil
}

// ==================== Conversation Service ====================

type ConversationService struct {
	conversationRepo *repository.ConversationRepository
	messageRepo      *repository.MessageRepository
	agentRepo        *repository.AgentRepository
}

func NewConversationService(
	conversationRepo *repository.ConversationRepository,
	messageRepo *repository.MessageRepository,
	agentRepo *repository.AgentRepository,
) *ConversationService {
	return &ConversationService{
		conversationRepo: conversationRepo,
		messageRepo:      messageRepo,
		agentRepo:        agentRepo,
	}
}

// Create creates a new conversation
func (s *ConversationService) Create(agentID uuid.UUID, sessionID string) (*models.Conversation, error) {
	log := logger.WithComponent("conversation-service")

	conversation := &models.Conversation{
		AgentID:   agentID,
		SessionID: sessionID,
		StartedAt: time.Now(),
	}

	if err := s.conversationRepo.Create(conversation); err != nil {
		log.Error().Err(err).Str("session_id", sessionID).Msg("Failed to create conversation")
		return nil, err
	}

	log.Info().
		Str("conversation_id", conversation.ID.String()).
		Str("session_id", sessionID).
		Str("agent_id", agentID.String()).
		Msg("Conversation created")

	return conversation, nil
}

// GetByID retrieves a conversation by ID
func (s *ConversationService) GetByID(id uuid.UUID) (*models.Conversation, error) {
	return s.conversationRepo.GetByID(id)
}

// ListByUserID returns conversations for a user
func (s *ConversationService) ListByUserID(userID uuid.UUID, limit, offset int) ([]models.Conversation, error) {
	if limit == 0 {
		limit = 20
	}
	return s.conversationRepo.ListByUserID(userID, limit, offset)
}

// End marks a conversation as ended
func (s *ConversationService) End(id uuid.UUID, summary string, sentiment string) error {
	log := logger.WithComponent("conversation-service")

	conversation, err := s.conversationRepo.GetByID(id)
	if err != nil {
		return ErrNotFound
	}

	now := time.Now()
	conversation.EndedAt = &now
	conversation.DurationSecs = int(now.Sub(conversation.StartedAt).Seconds())
	conversation.Summary = summary
	conversation.Sentiment = sentiment

	if err := s.conversationRepo.Update(conversation); err != nil {
		log.Error().Err(err).Str("conversation_id", id.String()).Msg("Failed to end conversation")
		return err
	}

	log.Info().
		Str("conversation_id", id.String()).
		Int("duration_secs", conversation.DurationSecs).
		Msg("Conversation ended")

	return nil
}

// AddMessage adds a message to a conversation
func (s *ConversationService) AddMessage(conversationID uuid.UUID, role, content string, startTime, endTime int) error {
	message := &models.Message{
		ConversationID: conversationID,
		Role:           role,
		Content:        content,
		StartTime:      startTime,
		EndTime:        endTime,
	}

	return s.messageRepo.Create(message)
}

// Delete removes a conversation
func (s *ConversationService) Delete(id uuid.UUID, userID uuid.UUID) error {
	log := logger.WithComponent("conversation-service")

	conversation, err := s.conversationRepo.GetByID(id)
	if err != nil {
		return ErrNotFound
	}

	// Verify ownership through agent
	agent, err := s.agentRepo.GetByID(conversation.AgentID)
	if err != nil || agent.UserID != userID {
		return ErrUnauthorized
	}

	if err := s.conversationRepo.Delete(id); err != nil {
		log.Error().Err(err).Str("conversation_id", id.String()).Msg("Failed to delete conversation")
		return err
	}

	log.Info().Str("conversation_id", id.String()).Msg("Conversation deleted")
	return nil
}
