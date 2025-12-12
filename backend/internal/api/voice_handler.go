package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"github.com/yourusername/ai-voice-agent/internal/logger"
	"github.com/yourusername/ai-voice-agent/internal/services"
	"github.com/yourusername/ai-voice-agent/internal/voice/pipeline"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Allow connections from any origin in development
		// In production, you should check the origin
		return true
	},
}

// VoiceHandler handles WebSocket connections for voice conversations
type VoiceHandler struct {
	pipeline            *pipeline.VoicePipeline
	agentService        *services.AgentService
	conversationService *services.ConversationService
}

// NewVoiceHandler creates a new voice handler
func NewVoiceHandler(
	pipeline *pipeline.VoicePipeline,
	agentService *services.AgentService,
	conversationService *services.ConversationService,
) *VoiceHandler {
	return &VoiceHandler{
		pipeline:            pipeline,
		agentService:        agentService,
		conversationService: conversationService,
	}
}

// HandleWebSocket handles WebSocket connections for voice sessions
func (h *VoiceHandler) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	log := logger.WithComponent("voice-handler")

	agentIDStr := chi.URLParam(r, "agentId")
	agentID, err := uuid.Parse(agentIDStr)
	if err != nil {
		log.Warn().Str("agent_id_str", agentIDStr).Msg("Invalid agent ID format")
		http.Error(w, "Invalid agent ID", http.StatusBadRequest)
		return
	}

	// Get agent configuration
	agent, err := h.agentService.GetByID(agentID)
	if err != nil {
		log.Warn().Str("agent_id", agentID.String()).Msg("Agent not found")
		http.Error(w, "Agent not found", http.StatusNotFound)
		return
	}

	if !agent.IsActive {
		log.Warn().Str("agent_id", agentID.String()).Str("agent_name", agent.Name).Msg("Attempted connection to inactive agent")
		http.Error(w, "Agent is not active", http.StatusForbidden)
		return
	}

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Error().Err(err).Str("agent_id", agentID.String()).Msg("WebSocket upgrade failed")
		return
	}

	// Create session ID
	sessionID := uuid.New().String()

	// Create conversation record
	conversation, err := h.conversationService.Create(agentID, sessionID)
	if err != nil {
		log.Error().Err(err).Str("session_id", sessionID).Str("agent_id", agentID.String()).Msg("Failed to create conversation")
		conn.Close()
		return
	}

	log.Info().
		Str("session_id", sessionID).
		Str("agent_id", agentID.String()).
		Str("agent_name", agent.Name).
		Str("conversation_id", conversation.ID.String()).
		Msg("Voice session started")

	// Start voice pipeline
	session := pipeline.NewSession(conn, agent, conversation, h.conversationService)
	h.pipeline.HandleSession(session)
}
