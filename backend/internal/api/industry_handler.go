package api

import (
	"net/http"

	"github.com/go-chi/chi/v5/middleware"

	"github.com/yourusername/ai-voice-agent/internal/logger"
	"github.com/yourusername/ai-voice-agent/internal/services"
)

// IndustryHandler handles industry endpoints
type IndustryHandler struct {
	industryService *services.IndustryService
}

// NewIndustryHandler creates a new industry handler
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
