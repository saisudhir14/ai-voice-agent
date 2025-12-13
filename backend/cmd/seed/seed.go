package main

import (
	"github.com/joho/godotenv"
	"github.com/yourusername/ai-voice-agent/internal/config"
	"github.com/yourusername/ai-voice-agent/internal/database"
	"github.com/yourusername/ai-voice-agent/internal/logger"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		// Not an error - we might be using system env vars
	}

	// Load configuration
	cfg := config.Load()

	// Initialize logger
	logger.Init(cfg.IsDevelopment())
	log := logger.WithComponent("seed")

	log.Info().Msg("Starting database seeding...")

	// Initialize database
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to database")
	}

	// Run seeding
	database.SeedIndustries(db)

	log.Info().Msg("Database seeding completed successfully")
}
