package langchain

// AgentConfig holds configuration for creating an agent
type AgentConfig struct {
	SessionID    string   `json:"session_id"`
	SystemPrompt string   `json:"system_prompt"`
	Greeting     string   `json:"greeting,omitempty"`
	Model        string   `json:"model"`
	Temperature  float64  `json:"temperature"`
	MaxTokens    int      `json:"max_tokens"`
	Tools        []string `json:"tools,omitempty"`
}

// CreateAgentResponse is the response from creating an agent
type CreateAgentResponse struct {
	SessionID string `json:"session_id"`
	Status    string `json:"status"`
	Greeting  string `json:"greeting,omitempty"`
}

// ChatResponse is the response from a chat request
type ChatResponse struct {
	SessionID string                   `json:"session_id"`
	Response  string                   `json:"response"`
	ToolCalls []map[string]interface{} `json:"tool_calls,omitempty"`
}
