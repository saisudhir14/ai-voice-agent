package main

import (
	"flag"
	"os"

	"github.com/joho/godotenv"
	"github.com/yourusername/ai-voice-agent/internal/config"
	"github.com/yourusername/ai-voice-agent/internal/database"
	"github.com/yourusername/ai-voice-agent/internal/logger"
)

func main() {
	// Parse command line flags
	seedAll := flag.Bool("all", false, "Seed all data (industries, etc.)")
	seedIndustries := flag.Bool("industries", true, "Seed industries (default: true)")
	flag.Parse()

	// Load environment variables
	if err := godotenv.Load(); err != nil {
		// Not an error - we might be using system env vars
	}

	// Load configuration
	cfg := config.Load()

	// Initialize logger
	logger.Init(cfg.IsDevelopment())
	log := logger.WithComponent("seed")

	// Initialize database
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to database")
	}

	// Run migrations first to ensure schema is up to date
	log.Info().Msg("Running migrations...")
	if err := database.Migrate(db); err != nil {
		log.Fatal().Err(err).Msg("Failed to run migrations")
	}

	// Determine what to seed
	if *seedAll {
		log.Info().Msg("Seeding all data...")
		database.SeedAll(db)
	} else if *seedIndustries {
		log.Info().Msg("Seeding industries...")
		database.SeedIndustries(db)
	} else {
		log.Warn().Msg("No seed operations specified. Use -all or -industries flags.")
		os.Exit(1)
	}

	log.Info().Msg("Database seeding completed successfully")
}
