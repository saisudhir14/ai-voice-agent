package api

import (
	"net/http"

	"github.com/go-chi/chi/v5/middleware"

	"github.com/yourusername/ai-voice-agent/internal/logger"
	"github.com/yourusername/ai-voice-agent/internal/services"
)

// AuthHandler handles authentication endpoints
type AuthHandler struct {
	authService *services.AuthService
}

// NewAuthHandler creates a new auth handler
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
