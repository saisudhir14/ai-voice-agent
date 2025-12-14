package main

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"

	"github.com/yourusername/ai-voice-agent/internal/api"
	"github.com/yourusername/ai-voice-agent/internal/config"
	"github.com/yourusername/ai-voice-agent/internal/database"
	"github.com/yourusername/ai-voice-agent/internal/logger"
	appMiddleware "github.com/yourusername/ai-voice-agent/internal/middleware"
	"github.com/yourusername/ai-voice-agent/internal/repository"
	"github.com/yourusername/ai-voice-agent/internal/services"
	"github.com/yourusername/ai-voice-agent/internal/voice/pipeline"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		// Not an error - we might be using system env vars
	}

	// Load configuration
	cfg := config.Load()

	// Initialize logger (pretty output in development, JSON in production)
	logger.Init(cfg.IsDevelopment())
	log := logger.WithComponent("main")

	log.Info().Msg("Starting AI Voice Agent server")

	// Initialize database
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to database")
	}

	// Run migrations
	if err := database.Migrate(db); err != nil {
		log.Fatal().Err(err).Msg("Failed to run migrations")
	}

	// Seed database if AUTO_SEED is enabled (default: true)
	// In production, set AUTO_SEED=false and use the seed CLI tool instead
	if cfg.AutoSeed {
		log.Info().Msg("Auto-seeding database (AUTO_SEED=true)...")
		database.SeedIndustries(db)
		log.Info().Msg("Database seeding completed")
	} else {
		log.Info().Msg("Skipping auto-seed (AUTO_SEED=false). Use 'make seed' or 'go run cmd/seed/seed.go' to seed manually.")
	}

	// Initialize repositories
	repos := repository.NewRepositories(db)

	// Initialize services
	svc := services.NewServices(repos, cfg)

	// Initialize voice pipeline
	voicePipeline := pipeline.NewVoicePipeline(cfg)

	// Initialize API handlers
	handlers := api.NewHandlers(svc, voicePipeline, cfg)

	// Setup router
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(appMiddleware.RequestLogger) // Custom zerolog middleware
	r.Use(middleware.Recoverer)

	// CORS - Allow all origins in production for WebSocket support
	corsOrigins := []string{"http://localhost:5173", "http://localhost:5174"}
	if cfg.IsProduction() {
		// In production, allow all origins for WebSocket compatibility
		corsOrigins = []string{"*"}
	}
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   corsOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Request-ID"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Root endpoint
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"service": "AI Voice Agent API",
			"status":  "running",
			"version": "1.0.0",
		})
	})

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// API routes
	r.Route("/api", func(r chi.Router) {
		// Public routes (no auth required)
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", handlers.Auth.Register)
			r.Post("/login", handlers.Auth.Login)
			r.Post("/refresh", handlers.Auth.RefreshToken)
		})

		// Public industries list
		r.Get("/industries", handlers.Industry.List)

		// Protected routes (auth required)
		r.Group(func(r chi.Router) {
			r.Use(appMiddleware.JWTAuth(cfg.JWTSecret))

			// User routes
			r.Route("/users", func(r chi.Router) {
				r.Get("/me", handlers.User.GetMe)
				r.Put("/me", handlers.User.UpdateMe)
			})

			// Agent routes
			r.Route("/agents", func(r chi.Router) {
				r.Get("/", handlers.Agent.List)
				r.Post("/", handlers.Agent.Create)
				r.Get("/{id}", handlers.Agent.Get)
				r.Put("/{id}", handlers.Agent.Update)
				r.Delete("/{id}", handlers.Agent.Delete)
			})

			// Conversation routes
			r.Route("/conversations", func(r chi.Router) {
				r.Get("/", handlers.Conversation.List)
				r.Get("/{id}", handlers.Conversation.Get)
				r.Delete("/{id}", handlers.Conversation.Delete)
			})
		})
	})

	// WebSocket route for voice
	r.Get("/ws/voice/{agentId}", handlers.Voice.HandleWebSocket)

	// Get port
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Info().
		Str("port", port).
		Bool("langchain_enabled", cfg.UseLangChain).
		Str("env", cfg.Env).
		Msg("Server starting")

	log.Info().Msgf("WebSocket endpoint: ws://localhost:%s/ws/voice/{agentId}", port)

	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal().Err(err).Msg("Server failed to start")
	}
}
