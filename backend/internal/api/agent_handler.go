package api

import (
	"net/http"

	"github.com/go-chi/chi/v5/middleware"

	"github.com/yourusername/ai-voice-agent/internal/logger"
	appMiddleware "github.com/yourusername/ai-voice-agent/internal/middleware"
	"github.com/yourusername/ai-voice-agent/internal/services"
)

// AgentHandler handles agent endpoints
type AgentHandler struct {
	agentService *services.AgentService
}

// NewAgentHandler creates a new agent handler
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
