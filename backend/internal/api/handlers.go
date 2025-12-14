package api

import (
	"github.com/yourusername/ai-voice-agent/internal/config"
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
