package api

import (
	"net/http"

	"github.com/go-chi/chi/v5/middleware"

	"github.com/yourusername/ai-voice-agent/internal/logger"
	appMiddleware "github.com/yourusername/ai-voice-agent/internal/middleware"
	"github.com/yourusername/ai-voice-agent/internal/services"
)

// ConversationHandler handles conversation endpoints
type ConversationHandler struct {
	conversationService *services.ConversationService
}

// NewConversationHandler creates a new conversation handler
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
