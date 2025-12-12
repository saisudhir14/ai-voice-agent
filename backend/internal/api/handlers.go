package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/google/uuid"

	"github.com/yourusername/ai-voice-agent/internal/config"
	"github.com/yourusername/ai-voice-agent/internal/logger"
	appMiddleware "github.com/yourusername/ai-voice-agent/internal/middleware"
	"github.com/yourusername/ai-voice-agent/internal/services"
	"github.com/yourusername/ai-voice-agent/internal/voice/pipeline"
)

// Handlers holds all API handlers
type Handlers struct {
	Auth         *AuthHandler
	User         *UserHandler
	Industry     *IndustryHandler
	Agent        *AgentHandler
	Conversation *ConversationHandler
	Voice        *VoiceHandler
}

// NewHandlers creates all API handlers
func NewHandlers(svc *services.Services, voicePipeline *pipeline.VoicePipeline, cfg *config.Config) *Handlers {
	return &Handlers{
		Auth:         NewAuthHandler(svc.Auth),
		User:         NewUserHandler(svc.User),
		Industry:     NewIndustryHandler(svc.Industry),
		Agent:        NewAgentHandler(svc.Agent),
		Conversation: NewConversationHandler(svc.Conversation),
		Voice:        NewVoiceHandler(voicePipeline, svc.Agent, svc.Conversation),
	}
}

// Helper functions

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
}

func parseJSON(r *http.Request, v interface{}) error {
	return json.NewDecoder(r.Body).Decode(v)
}

func getUUIDParam(r *http.Request, param string) (uuid.UUID, error) {
	return uuid.Parse(chi.URLParam(r, param))
}

// ==================== Auth Handler ====================

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	log := logger.WithComponent("auth-handler")
	requestID := middleware.GetReqID(r.Context())

	var input services.RegisterInput
	if err := parseJSON(r, &input); err != nil {
		log.Warn().Str("request_id", requestID).Err(err).Msg("Invalid request body")
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if input.Email == "" || input.Password == "" || input.Name == "" {
		log.Warn().Str("request_id", requestID).Msg("Missing required fields")
		respondError(w, http.StatusBadRequest, "Email, password, and name are required")
		return
	}

	response, err := h.authService.Register(input)
	if err != nil {
		if err == services.ErrUserExists {
			log.Warn().Str("request_id", requestID).Str("email", input.Email).Msg("User already exists")
			respondError(w, http.StatusConflict, "User already exists")
			return
		}
		log.Error().Str("request_id", requestID).Err(err).Msg("Failed to register user")
		respondError(w, http.StatusInternalServerError, "Failed to register user")
		return
	}

	log.Info().
		Str("request_id", requestID).
		Str("user_id", response.User.ID.String()).
		Str("email", input.Email).
		Msg("User registered successfully")

	respondJSON(w, http.StatusCreated, response)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	log := logger.WithComponent("auth-handler")
	requestID := middleware.GetReqID(r.Context())

	var input services.LoginInput
	if err := parseJSON(r, &input); err != nil {
		log.Warn().Str("request_id", requestID).Err(err).Msg("Invalid request body")
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	response, err := h.authService.Login(input)
	if err != nil {
		log.Warn().Str("request_id", requestID).Str("email", input.Email).Msg("Invalid credentials")
		respondError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	log.Info().
		Str("request_id", requestID).
		Str("user_id", response.User.ID.String()).
		Msg("User logged in")

	respondJSON(w, http.StatusOK, response)
}

func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	log := logger.WithComponent("auth-handler")
	requestID := middleware.GetReqID(r.Context())

	var input struct {
		RefreshToken string `json:"refresh_token"`
	}
	if err := parseJSON(r, &input); err != nil {
		log.Warn().Str("request_id", requestID).Err(err).Msg("Invalid request body")
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	response, err := h.authService.RefreshToken(input.RefreshToken)
	if err != nil {
		log.Warn().Str("request_id", requestID).Msg("Invalid refresh token")
		respondError(w, http.StatusUnauthorized, "Invalid refresh token")
		return
	}

	log.Debug().Str("request_id", requestID).Str("user_id", response.User.ID.String()).Msg("Token refreshed")
	respondJSON(w, http.StatusOK, response)
}

// ==================== User Handler ====================

type UserHandler struct {
	userService *services.UserService
}

func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

func (h *UserHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	log := logger.WithComponent("user-handler")
	requestID := middleware.GetReqID(r.Context())

	userID, ok := appMiddleware.GetUserID(r.Context())
	if !ok {
		log.Warn().Str("request_id", requestID).Msg("Unauthorized - no user ID in context")
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	user, err := h.userService.GetByID(userID)
	if err != nil {
		log.Warn().Str("request_id", requestID).Str("user_id", userID.String()).Msg("User not found")
		respondError(w, http.StatusNotFound, "User not found")
		return
	}

	respondJSON(w, http.StatusOK, user)
}

func (h *UserHandler) UpdateMe(w http.ResponseWriter, r *http.Request) {
	log := logger.WithComponent("user-handler")
	requestID := middleware.GetReqID(r.Context())

	userID, ok := appMiddleware.GetUserID(r.Context())
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var input struct {
		Name    string `json:"name"`
		Company string `json:"company"`
	}
	if err := parseJSON(r, &input); err != nil {
		log.Warn().Str("request_id", requestID).Err(err).Msg("Invalid request body")
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, err := h.userService.Update(userID, input.Name, input.Company)
	if err != nil {
		log.Error().Str("request_id", requestID).Str("user_id", userID.String()).Err(err).Msg("Failed to update user")
		respondError(w, http.StatusInternalServerError, "Failed to update user")
		return
	}

	log.Info().Str("request_id", requestID).Str("user_id", userID.String()).Msg("User updated")
	respondJSON(w, http.StatusOK, user)
}

// ==================== Industry Handler ====================

type IndustryHandler struct {
	industryService *services.IndustryService
}

func NewIndustryHandler(industryService *services.IndustryService) *IndustryHandler {
	return &IndustryHandler{industryService: industryService}
}

func (h *IndustryHandler) List(w http.ResponseWriter, r *http.Request) {
	log := logger.WithComponent("industry-handler")
	requestID := middleware.GetReqID(r.Context())

	industries, err := h.industryService.List()
	if err != nil {
		log.Error().Str("request_id", requestID).Err(err).Msg("Failed to fetch industries")
		respondError(w, http.StatusInternalServerError, "Failed to fetch industries")
		return
	}

	respondJSON(w, http.StatusOK, industries)
}

// ==================== Agent Handler ====================

type AgentHandler struct {
	agentService *services.AgentService
}

func NewAgentHandler(agentService *services.AgentService) *AgentHandler {
	return &AgentHandler{agentService: agentService}
}

func (h *AgentHandler) List(w http.ResponseWriter, r *http.Request) {
	log := logger.WithComponent("agent-handler")
	requestID := middleware.GetReqID(r.Context())

	userID, ok := appMiddleware.GetUserID(r.Context())
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	agents, err := h.agentService.ListByUserID(userID)
	if err != nil {
		log.Error().Str("request_id", requestID).Str("user_id", userID.String()).Err(err).Msg("Failed to fetch agents")
		respondError(w, http.StatusInternalServerError, "Failed to fetch agents")
		return
	}

	respondJSON(w, http.StatusOK, agents)
}

func (h *AgentHandler) Create(w http.ResponseWriter, r *http.Request) {
	log := logger.WithComponent("agent-handler")
	requestID := middleware.GetReqID(r.Context())

	userID, ok := appMiddleware.GetUserID(r.Context())
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var input services.CreateAgentInput
	if err := parseJSON(r, &input); err != nil {
		log.Warn().Str("request_id", requestID).Err(err).Msg("Invalid request body")
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if input.Name == "" {
		log.Warn().Str("request_id", requestID).Msg("Agent name is required")
		respondError(w, http.StatusBadRequest, "Name is required")
		return
	}

	agent, err := h.agentService.Create(userID, input)
	if err != nil {
		if err == services.ErrNotFound {
			log.Warn().Str("request_id", requestID).Msg("Invalid industry ID")
			respondError(w, http.StatusBadRequest, "Invalid industry ID")
			return
		}
		log.Error().Str("request_id", requestID).Err(err).Msg("Failed to create agent")
		respondError(w, http.StatusInternalServerError, "Failed to create agent")
		return
	}

	log.Info().
		Str("request_id", requestID).
		Str("agent_id", agent.ID.String()).
		Str("agent_name", agent.Name).
		Str("user_id", userID.String()).
		Msg("Agent created")

	respondJSON(w, http.StatusCreated, agent)
}

func (h *AgentHandler) Get(w http.ResponseWriter, r *http.Request) {
	log := logger.WithComponent("agent-handler")
	requestID := middleware.GetReqID(r.Context())

	id, err := getUUIDParam(r, "id")
	if err != nil {
		log.Warn().Str("request_id", requestID).Err(err).Msg("Invalid agent ID")
		respondError(w, http.StatusBadRequest, "Invalid agent ID")
		return
	}

	agent, err := h.agentService.GetByID(id)
	if err != nil {
		log.Warn().Str("request_id", requestID).Str("agent_id", id.String()).Msg("Agent not found")
		respondError(w, http.StatusNotFound, "Agent not found")
		return
	}

	respondJSON(w, http.StatusOK, agent)
}

func (h *AgentHandler) Update(w http.ResponseWriter, r *http.Request) {
	log := logger.WithComponent("agent-handler")
	requestID := middleware.GetReqID(r.Context())

	userID, ok := appMiddleware.GetUserID(r.Context())
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id, err := getUUIDParam(r, "id")
	if err != nil {
		log.Warn().Str("request_id", requestID).Err(err).Msg("Invalid agent ID")
		respondError(w, http.StatusBadRequest, "Invalid agent ID")
		return
	}

	var input services.UpdateAgentInput
	if err := parseJSON(r, &input); err != nil {
		log.Warn().Str("request_id", requestID).Err(err).Msg("Invalid request body")
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	agent, err := h.agentService.Update(id, userID, input)
	if err != nil {
		if err == services.ErrNotFound {
			respondError(w, http.StatusNotFound, "Agent not found")
			return
		}
		if err == services.ErrUnauthorized {
			log.Warn().Str("request_id", requestID).Str("user_id", userID.String()).Str("agent_id", id.String()).Msg("Unauthorized agent update attempt")
			respondError(w, http.StatusForbidden, "Not authorized to update this agent")
			return
		}
		log.Error().Str("request_id", requestID).Err(err).Msg("Failed to update agent")
		respondError(w, http.StatusInternalServerError, "Failed to update agent")
		return
	}

	log.Info().Str("request_id", requestID).Str("agent_id", id.String()).Msg("Agent updated")
	respondJSON(w, http.StatusOK, agent)
}

func (h *AgentHandler) Delete(w http.ResponseWriter, r *http.Request) {
	log := logger.WithComponent("agent-handler")
	requestID := middleware.GetReqID(r.Context())

	userID, ok := appMiddleware.GetUserID(r.Context())
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id, err := getUUIDParam(r, "id")
	if err != nil {
		log.Warn().Str("request_id", requestID).Err(err).Msg("Invalid agent ID")
		respondError(w, http.StatusBadRequest, "Invalid agent ID")
		return
	}

	err = h.agentService.Delete(id, userID)
	if err != nil {
		if err == services.ErrNotFound {
			respondError(w, http.StatusNotFound, "Agent not found")
			return
		}
		if err == services.ErrUnauthorized {
			log.Warn().Str("request_id", requestID).Str("user_id", userID.String()).Str("agent_id", id.String()).Msg("Unauthorized agent delete attempt")
			respondError(w, http.StatusForbidden, "Not authorized to delete this agent")
			return
		}
		log.Error().Str("request_id", requestID).Err(err).Msg("Failed to delete agent")
		respondError(w, http.StatusInternalServerError, "Failed to delete agent")
		return
	}

	log.Info().Str("request_id", requestID).Str("agent_id", id.String()).Msg("Agent deleted")
	w.WriteHeader(http.StatusNoContent)
}

// ==================== Conversation Handler ====================

type ConversationHandler struct {
	conversationService *services.ConversationService
}

func NewConversationHandler(conversationService *services.ConversationService) *ConversationHandler {
	return &ConversationHandler{conversationService: conversationService}
}

func (h *ConversationHandler) List(w http.ResponseWriter, r *http.Request) {
	log := logger.WithComponent("conversation-handler")
	requestID := middleware.GetReqID(r.Context())

	userID, ok := appMiddleware.GetUserID(r.Context())
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	conversations, err := h.conversationService.ListByUserID(userID, 50, 0)
	if err != nil {
		log.Error().Str("request_id", requestID).Str("user_id", userID.String()).Err(err).Msg("Failed to fetch conversations")
		respondError(w, http.StatusInternalServerError, "Failed to fetch conversations")
		return
	}

	respondJSON(w, http.StatusOK, conversations)
}

func (h *ConversationHandler) Get(w http.ResponseWriter, r *http.Request) {
	log := logger.WithComponent("conversation-handler")
	requestID := middleware.GetReqID(r.Context())

	id, err := getUUIDParam(r, "id")
	if err != nil {
		log.Warn().Str("request_id", requestID).Err(err).Msg("Invalid conversation ID")
		respondError(w, http.StatusBadRequest, "Invalid conversation ID")
		return
	}

	conversation, err := h.conversationService.GetByID(id)
	if err != nil {
		log.Warn().Str("request_id", requestID).Str("conversation_id", id.String()).Msg("Conversation not found")
		respondError(w, http.StatusNotFound, "Conversation not found")
		return
	}

	respondJSON(w, http.StatusOK, conversation)
}

func (h *ConversationHandler) Delete(w http.ResponseWriter, r *http.Request) {
	log := logger.WithComponent("conversation-handler")
	requestID := middleware.GetReqID(r.Context())

	userID, ok := appMiddleware.GetUserID(r.Context())
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id, err := getUUIDParam(r, "id")
	if err != nil {
		log.Warn().Str("request_id", requestID).Err(err).Msg("Invalid conversation ID")
		respondError(w, http.StatusBadRequest, "Invalid conversation ID")
		return
	}

	err = h.conversationService.Delete(id, userID)
	if err != nil {
		log.Error().Str("request_id", requestID).Err(err).Msg("Failed to delete conversation")
		respondError(w, http.StatusInternalServerError, "Failed to delete conversation")
		return
	}

	log.Info().Str("request_id", requestID).Str("conversation_id", id.String()).Msg("Conversation deleted")
	w.WriteHeader(http.StatusNoContent)
}
