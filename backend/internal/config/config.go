package config

import (
	"os"
)

type Config struct {
	// Server
	Port string
	Env  string

	// Database
	DatabaseURL string

	// Voice Services
	AssemblyAIKey  string
	CartesiaKey    string
	CartesiaVoice  string

	// LLM (direct API - fallback)
	AnthropicKey string
	OpenAIKey    string

	// LangChain Service (Python microservice)
	LangChainServiceURL string
	UseLangChain        bool

	// Auth
	JWTSecret string
}

func Load() *Config {
	return &Config{
		Port:                getEnv("PORT", "8080"),
		Env:                 getEnv("ENV", "development"),
		DatabaseURL:         getEnv("DATABASE_URL", ""),
		AssemblyAIKey:       getEnv("ASSEMBLYAI_API_KEY", ""),
		CartesiaKey:         getEnv("CARTESIA_API_KEY", ""),
		CartesiaVoice:       getEnv("CARTESIA_VOICE_ID", "a0e99841-438c-4a64-b679-ae501e7d6091"),
		AnthropicKey:        getEnv("ANTHROPIC_API_KEY", ""),
		OpenAIKey:           getEnv("OPENAI_API_KEY", ""),
		LangChainServiceURL: getEnv("LANGCHAIN_SERVICE_URL", "http://localhost:8081"),
		UseLangChain:        getEnv("USE_LANGCHAIN", "true") == "true",
		JWTSecret:           getEnv("JWT_SECRET", "change-this-secret"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func (c *Config) IsDevelopment() bool {
	return c.Env == "development"
}

func (c *Config) IsProduction() bool {
	return c.Env == "production"
}

