package pipeline

// EventType represents the type of event sent to client
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
