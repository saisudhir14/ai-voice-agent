package middleware

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5/middleware"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"github.com/yourusername/ai-voice-agent/internal/logger"
)

type contextKey string

const (
	UserIDKey contextKey = "userID"
	UserKey   contextKey = "user"
)

// Claims holds JWT token claims
type Claims struct {
	UserID uuid.UUID `json:"user_id"`
	Email  string    `json:"email"`
	Role   string    `json:"role"`
	jwt.RegisteredClaims
}

// JWTAuth middleware validates JWT tokens and adds user info to context
func JWTAuth(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			log := logger.WithComponent("auth")
			requestID := middleware.GetReqID(r.Context())

			// Get token from Authorization header
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				log.Warn().
					Str("request_id", requestID).
					Str("path", r.URL.Path).
					Msg("Missing authorization header")
				http.Error(w, "Authorization header required", http.StatusUnauthorized)
				return
			}

			// Check Bearer prefix
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
				log.Warn().
					Str("request_id", requestID).
					Msg("Invalid authorization header format")
				http.Error(w, "Invalid authorization header format", http.StatusUnauthorized)
				return
			}

			tokenString := parts[1]

			// Parse and validate token
			token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
				return []byte(secret), nil
			})

			if err != nil || !token.Valid {
				log.Warn().
					Str("request_id", requestID).
					Err(err).
					Msg("Invalid or expired token")
				http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
				return
			}

			claims, ok := token.Claims.(*Claims)
			if !ok {
				log.Warn().
					Str("request_id", requestID).
					Msg("Invalid token claims")
				http.Error(w, "Invalid token claims", http.StatusUnauthorized)
				return
			}

			log.Debug().
				Str("request_id", requestID).
				Str("user_id", claims.UserID.String()).
				Str("email", claims.Email).
				Msg("Token validated")

			// Add user info to context
			ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
			ctx = context.WithValue(ctx, UserKey, claims)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequestLogger is a middleware that logs HTTP requests using zerolog
func RequestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log := logger.WithComponent("http")
		start := time.Now()

		// Wrap response writer to capture status code
		ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)

		defer func() {
			log.Info().
				Str("request_id", middleware.GetReqID(r.Context())).
				Str("method", r.Method).
				Str("path", r.URL.Path).
				Int("status", ww.Status()).
				Int("bytes", ww.BytesWritten()).
				Dur("duration", time.Since(start)).
				Str("remote_addr", r.RemoteAddr).
				Msg("Request completed")
		}()

		next.ServeHTTP(ww, r)
	})
}

// GetUserID extracts user ID from context
func GetUserID(ctx context.Context) (uuid.UUID, bool) {
	userID, ok := ctx.Value(UserIDKey).(uuid.UUID)
	return userID, ok
}

// GetClaims extracts full claims from context
func GetClaims(ctx context.Context) (*Claims, bool) {
	claims, ok := ctx.Value(UserKey).(*Claims)
	return claims, ok
}
