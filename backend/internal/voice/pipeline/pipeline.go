package pipeline

import (
	"context"
	"encoding/json"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/rs/zerolog"

	"github.com/yourusername/ai-voice-agent/internal/config"
	"github.com/yourusername/ai-voice-agent/internal/logger"
	"github.com/yourusername/ai-voice-agent/internal/models"
	"github.com/yourusername/ai-voice-agent/internal/services"
	"github.com/yourusername/ai-voice-agent/internal/voice/assemblyai"
	"github.com/yourusername/ai-voice-agent/internal/voice/cartesia"
	"github.com/yourusername/ai-voice-agent/internal/voice/langchain"
	"github.com/yourusername/ai-voice-agent/internal/voice/llm"
)

// Event types sent to client
type EventType string

const (
	EventSTTChunk   EventType = "stt_chunk"   // Partial transcription
	EventSTTOutput  EventType = "stt_output"  // Final transcription
	EventAgentChunk EventType = "agent_chunk" // Agent response chunk
	EventAgentEnd   EventType = "agent_end"   // Agent finished responding
	EventTTSChunk   EventType = "tts_chunk"   // Audio chunk for playback
	EventToolCall   EventType = "tool_call"   // Tool was called (LangChain)
	EventError      EventType = "error"       // Error occurred
	EventReady      EventType = "ready"       // Pipeline ready
	EventSessionEnd EventType = "session_end" // Session ended
)

// Event is the unified event structure
type Event struct {
	Type      EventType   `json:"type"`
	Data      interface{} `json:"data,omitempty"`
	Timestamp int64       `json:"timestamp"`
}

// VoicePipeline orchestrates the STT -> LLM -> TTS flow
type VoicePipeline struct {
	cfg             *config.Config
	sttClient       *assemblyai.Client
	ttsClient       *cartesia.Client
	llmClient       *llm.Client
	langchainClient *langchain.Client
}

// NewVoicePipeline creates a new voice pipeline
func NewVoicePipeline(cfg *config.Config) *VoicePipeline {
	log := logger.WithComponent("pipeline")

	pipeline := &VoicePipeline{
		cfg:       cfg,
		sttClient: assemblyai.NewClient(cfg.AssemblyAIKey),
		ttsClient: cartesia.NewClient(cfg.CartesiaKey, cfg.CartesiaVoice),
		llmClient: llm.NewClient(cfg.AnthropicKey, cfg.OpenAIKey),
	}

	// Initialize LangChain client if enabled
	if cfg.UseLangChain {
		pipeline.langchainClient = langchain.NewClient(cfg.LangChainServiceURL)
		log.Info().Str("url", cfg.LangChainServiceURL).Msg("LangChain service enabled")
	} else {
		log.Info().Msg("Using direct LLM API calls (LangChain disabled)")
	}

	return pipeline
}

// Session represents an active voice conversation
type Session struct {
	ID                  string
	conn                *websocket.Conn
	agent               *models.Agent
	conversation        *models.Conversation
	conversationService *services.ConversationService

	ctx              context.Context
	cancel           context.CancelFunc
	mu               sync.Mutex
	messages         []llm.Message
	startTime        time.Time
	langchainSession string // LangChain session ID
	useLangChain     bool
	log              zerolog.Logger
}

// NewSession creates a new voice session
func NewSession(
	conn *websocket.Conn,
	agent *models.Agent,
	conversation *models.Conversation,
	conversationService *services.ConversationService,
) *Session {
	ctx, cancel := context.WithCancel(context.Background())
	sessionID := uuid.New().String()

	return &Session{
		ID:                  sessionID,
		conn:                conn,
		agent:               agent,
		conversation:        conversation,
		conversationService: conversationService,
		ctx:                 ctx,
		cancel:              cancel,
		messages:            []llm.Message{},
		startTime:           time.Now(),
		log:                 logger.WithSessionID(sessionID),
	}
}

// HandleSession manages the voice session lifecycle
func (p *VoicePipeline) HandleSession(session *Session) {
	defer func() {
		session.cancel()
		session.conn.Close()

		// Cleanup LangChain session
		if session.useLangChain && p.langchainClient != nil {
			if err := p.langchainClient.DeleteAgent(context.Background(), session.langchainSession); err != nil {
				session.log.Debug().Err(err).Msg("Failed to cleanup LangChain session")
			}
		}

		session.log.Info().Msg("Voice session ended")
	}()

	// Determine if we should use LangChain
	session.useLangChain = p.cfg.UseLangChain && p.langchainClient != nil

	// Initialize LangChain agent session if enabled
	if session.useLangChain {
		if err := p.initLangChainSession(session); err != nil {
			session.log.Warn().Err(err).Msg("LangChain init failed, falling back to direct LLM")
			session.useLangChain = false
		}
	}

	// Send ready event
	session.sendEvent(EventReady, map[string]interface{}{
		"session_id":      session.ID,
		"agent_name":      session.agent.Name,
		"greeting":        session.agent.Greeting,
		"using_langchain": session.useLangChain,
	})

	// Channels for pipeline communication
	audioIn := make(chan []byte, 100)
	sttOut := make(chan assemblyai.TranscriptEvent, 10)
	llmOut := make(chan string, 100)
	ttsOut := make(chan []byte, 100)

	var wg sync.WaitGroup

	// Start STT goroutine
	wg.Add(1)
	go func() {
		defer wg.Done()
		p.runSTT(session, audioIn, sttOut)
	}()

	// Start LLM goroutine (uses LangChain or direct API)
	wg.Add(1)
	go func() {
		defer wg.Done()
		if session.useLangChain {
			p.runLangChain(session, sttOut, llmOut)
		} else {
			p.runLLM(session, sttOut, llmOut)
		}
	}()

	// Start TTS goroutine
	wg.Add(1)
	go func() {
		defer wg.Done()
		p.runTTS(session, llmOut, ttsOut)
	}()

	// Start output goroutine (sends audio to client)
	wg.Add(1)
	go func() {
		defer wg.Done()
		p.sendAudioToClient(session, ttsOut)
	}()

	// Read audio from WebSocket
	p.readAudioFromClient(session, audioIn)

	// Wait for all goroutines to finish
	wg.Wait()

	// End conversation
	session.conversationService.End(
		session.conversation.ID,
		"Conversation ended",
		"neutral",
	)

	session.sendEvent(EventSessionEnd, nil)
}

func (p *VoicePipeline) initLangChainSession(session *Session) error {
	// Determine tools based on industry
	tools := getToolsForIndustry(session.agent.Industry.Slug)

	config := langchain.AgentConfig{
		SessionID:    session.ID,
		SystemPrompt: session.agent.SystemPrompt,
		Greeting:     session.agent.Greeting,
		Model:        session.agent.LLMModel,
		Temperature:  session.agent.Temperature,
		MaxTokens:    session.agent.MaxTokens,
		Tools:        tools,
	}

	result, err := p.langchainClient.CreateAgent(session.ctx, config)
	if err != nil {
		return err
	}

	session.langchainSession = result.SessionID
	session.log.Info().Str("langchain_session", session.langchainSession).Msg("LangChain session created")
	return nil
}

func getToolsForIndustry(industrySlug string) []string {
	toolMap := map[string][]string{
		"customer-support": {"get_current_time", "check_order_status", "create_support_ticket"},
		"sales":            {"get_current_time", "check_product_availability", "get_pricing", "schedule_demo"},
		"healthcare":       {"get_current_time", "check_appointment_availability", "book_appointment"},
		"restaurant":       {"get_current_time", "check_reservation_availability", "make_reservation", "get_menu_info"},
	}

	if tools, ok := toolMap[industrySlug]; ok {
		return tools
	}
	return []string{"get_current_time"}
}

func (p *VoicePipeline) readAudioFromClient(session *Session, audioOut chan<- []byte) {
	defer close(audioOut)

	for {
		select {
		case <-session.ctx.Done():
			return
		default:
			messageType, data, err := session.conn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					session.log.Warn().Err(err).Msg("WebSocket read error")
				}
				return
			}

			if messageType == websocket.BinaryMessage {
				select {
				case audioOut <- data:
				case <-session.ctx.Done():
					return
				}
			} else if messageType == websocket.TextMessage {
				var msg map[string]interface{}
				if err := json.Unmarshal(data, &msg); err == nil {
					if msg["type"] == "end" {
						session.log.Info().Msg("Client requested session end")
						return
					}
				}
			}
		}
	}
}

func (p *VoicePipeline) runSTT(session *Session, audioIn <-chan []byte, sttOut chan<- assemblyai.TranscriptEvent) {
	defer close(sttOut)

	transcriptChan, err := p.sttClient.Stream(session.ctx, audioIn)
	if err != nil {
		session.log.Error().Err(err).Msg("STT stream initialization failed")
		session.sendEvent(EventError, map[string]string{"message": "STT initialization failed"})
		return
	}

	session.log.Debug().Msg("STT stream started")

	for {
		select {
		case <-session.ctx.Done():
			return
		case event, ok := <-transcriptChan:
			if !ok {
				return
			}

			if event.IsPartial {
				session.sendEvent(EventSTTChunk, map[string]string{"text": event.Text})
			} else {
				session.log.Debug().Str("text", event.Text).Msg("STT final transcript")
				session.sendEvent(EventSTTOutput, map[string]string{"text": event.Text})

				elapsed := int(time.Since(session.startTime).Milliseconds())
				session.conversationService.AddMessage(
					session.conversation.ID,
					"user",
					event.Text,
					elapsed,
					elapsed,
				)

				select {
				case sttOut <- event:
				case <-session.ctx.Done():
					return
				}
			}
		}
	}
}

// runLangChain processes transcripts through the Python LangChain service
func (p *VoicePipeline) runLangChain(session *Session, sttIn <-chan assemblyai.TranscriptEvent, llmOut chan<- string) {
	defer close(llmOut)

	for {
		select {
		case <-session.ctx.Done():
			return
		case event, ok := <-sttIn:
			if !ok {
				return
			}

			// Stream response from LangChain service
			var fullResponse string
			responseChan, err := p.langchainClient.Stream(session.ctx, session.langchainSession, event.Text)
			if err != nil {
				session.log.Error().Err(err).Msg("LangChain stream error")
				session.sendEvent(EventError, map[string]string{"message": "LangChain error"})
				continue
			}

			for chunk := range responseChan {
				fullResponse += chunk
				session.sendEvent(EventAgentChunk, map[string]string{"text": chunk})

				select {
				case llmOut <- chunk:
				case <-session.ctx.Done():
					return
				}
			}

			session.log.Debug().Int("response_length", len(fullResponse)).Msg("LangChain response complete")
			session.sendEvent(EventAgentEnd, nil)

			// Save assistant message
			elapsed := int(time.Since(session.startTime).Milliseconds())
			session.conversationService.AddMessage(
				session.conversation.ID,
				"assistant",
				fullResponse,
				elapsed,
				elapsed,
			)
		}
	}
}

// runLLM processes transcripts through direct LLM API calls (fallback)
func (p *VoicePipeline) runLLM(session *Session, sttIn <-chan assemblyai.TranscriptEvent, llmOut chan<- string) {
	defer close(llmOut)

	for {
		select {
		case <-session.ctx.Done():
			return
		case event, ok := <-sttIn:
			if !ok {
				return
			}

			session.mu.Lock()
			session.messages = append(session.messages, llm.Message{
				Role:    "user",
				Content: event.Text,
			})
			messages := make([]llm.Message, len(session.messages))
			copy(messages, session.messages)
			session.mu.Unlock()

			var fullResponse string
			responseChan, err := p.llmClient.Stream(
				session.ctx,
				session.agent.SystemPrompt,
				messages,
				session.agent.LLMModel,
				session.agent.Temperature,
				session.agent.MaxTokens,
			)
			if err != nil {
				session.log.Error().Err(err).Msg("LLM stream error")
				session.sendEvent(EventError, map[string]string{"message": "LLM error"})
				continue
			}

			for chunk := range responseChan {
				fullResponse += chunk
				session.sendEvent(EventAgentChunk, map[string]string{"text": chunk})

				select {
				case llmOut <- chunk:
				case <-session.ctx.Done():
					return
				}
			}

			session.log.Debug().Int("response_length", len(fullResponse)).Msg("LLM response complete")
			session.sendEvent(EventAgentEnd, nil)

			session.mu.Lock()
			session.messages = append(session.messages, llm.Message{
				Role:    "assistant",
				Content: fullResponse,
			})
			session.mu.Unlock()

			elapsed := int(time.Since(session.startTime).Milliseconds())
			session.conversationService.AddMessage(
				session.conversation.ID,
				"assistant",
				fullResponse,
				elapsed,
				elapsed,
			)
		}
	}
}

func (p *VoicePipeline) runTTS(session *Session, llmIn <-chan string, ttsOut chan<- []byte) {
	defer close(ttsOut)

	audioChan, err := p.ttsClient.Stream(session.ctx, llmIn, session.agent.VoiceID)
	if err != nil {
		session.log.Error().Err(err).Msg("TTS stream initialization failed")
		session.sendEvent(EventError, map[string]string{"message": "TTS initialization failed"})
		return
	}

	session.log.Debug().Msg("TTS stream started")

	for {
		select {
		case <-session.ctx.Done():
			return
		case audio, ok := <-audioChan:
			if !ok {
				return
			}

			select {
			case ttsOut <- audio:
			case <-session.ctx.Done():
				return
			}
		}
	}
}

func (p *VoicePipeline) sendAudioToClient(session *Session, ttsIn <-chan []byte) {
	for {
		select {
		case <-session.ctx.Done():
			return
		case audio, ok := <-ttsIn:
			if !ok {
				return
			}

			session.sendEvent(EventTTSChunk, map[string]interface{}{
				"audio": audio,
			})
		}
	}
}

func (s *Session) sendEvent(eventType EventType, data interface{}) {
	s.mu.Lock()
	defer s.mu.Unlock()

	event := Event{
		Type:      eventType,
		Data:      data,
		Timestamp: time.Now().UnixMilli(),
	}

	if err := s.conn.WriteJSON(event); err != nil {
		s.log.Warn().Err(err).Str("event_type", string(eventType)).Msg("Failed to send event")
	}
}
