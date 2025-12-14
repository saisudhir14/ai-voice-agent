package api

import (
	"net/http"

	"github.com/go-chi/chi/v5/middleware"

	"github.com/yourusername/ai-voice-agent/internal/logger"
	appMiddleware "github.com/yourusername/ai-voice-agent/internal/middleware"
	"github.com/yourusername/ai-voice-agent/internal/services"
)

// UserHandler handles user endpoints
type UserHandler struct {
	userService *services.UserService
}

// NewUserHandler creates a new user handler
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
