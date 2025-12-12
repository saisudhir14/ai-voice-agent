package logger

import (
	"os"
	"time"

	"github.com/rs/zerolog"
)

// Log is the global logger instance
var Log zerolog.Logger

// Init initializes the global logger
// In development mode, it uses a pretty console writer
// In production, it outputs structured JSON logs
func Init(isDevelopment bool) {
	zerolog.TimeFieldFormat = time.RFC3339

	if isDevelopment {
		// Pretty console output for development
		output := zerolog.ConsoleWriter{
			Out:        os.Stdout,
			TimeFormat: "15:04:05",
		}
		Log = zerolog.New(output).With().Timestamp().Caller().Logger()
	} else {
		// Structured JSON output for production
		Log = zerolog.New(os.Stdout).With().Timestamp().Logger()
	}
}

// WithComponent creates a logger with a component field
// Use this to identify which part of the app logged the message
func WithComponent(component string) zerolog.Logger {
	return Log.With().Str("component", component).Logger()
}

// WithRequestID creates a logger with a request ID field
// Use this for tracing requests across the system
func WithRequestID(requestID string) zerolog.Logger {
	return Log.With().Str("request_id", requestID).Logger()
}

// WithSessionID creates a logger with a session ID field
// Use this for voice session tracking
func WithSessionID(sessionID string) zerolog.Logger {
	return Log.With().Str("session_id", sessionID).Logger()
}

// WithUserID creates a logger with a user ID field
func WithUserID(userID string) zerolog.Logger {
	return Log.With().Str("user_id", userID).Logger()
}
