package database

import (
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"

	"github.com/yourusername/ai-voice-agent/internal/logger"
	"github.com/yourusername/ai-voice-agent/internal/models"
)

// Connect establishes a connection to the PostgreSQL database
func Connect(databaseURL string) (*gorm.DB, error) {
	log := logger.WithComponent("database")

	config := &gorm.Config{
		Logger: gormlogger.Default.LogMode(gormlogger.Warn),
	}

	db, err := gorm.Open(postgres.Open(databaseURL), config)
	if err != nil {
		log.Error().Err(err).Msg("Failed to connect to database")
		return nil, err
	}

	// Get underlying SQL DB for connection pool settings
	sqlDB, err := db.DB()
	if err != nil {
		log.Error().Err(err).Msg("Failed to get database connection")
		return nil, err
	}

	// Set connection pool settings
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	log.Info().Msg("Database connected successfully")
	return db, nil
}

// Migrate runs database migrations
func Migrate(db *gorm.DB) error {
	log := logger.WithComponent("database")
	log.Info().Msg("Running database migrations")

	// Enable UUID extension
	db.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")

	// Auto migrate models
	err := db.AutoMigrate(
		&models.User{},
		&models.Industry{},
		&models.Agent{},
		&models.Conversation{},
		&models.Message{},
		&models.APIKey{},
	)
	if err != nil {
		log.Error().Err(err).Msg("Migration failed")
		return err
	}

	log.Info().Msg("Database migrations completed")
	return nil
}

// SeedIndustries seeds default industries into the database
func SeedIndustries(db *gorm.DB) {
	log := logger.WithComponent("database")

	industries := []models.Industry{
		{
			Name:        "Customer Support",
			Slug:        "customer-support",
			Description: "Handle customer inquiries, complaints, and support requests",
			Icon:        "headphones",
			DefaultSystemPrompt: `You are a helpful customer support agent. Your role is to:
- Listen carefully to customer concerns
- Provide accurate and helpful information
- Resolve issues efficiently and professionally
- Maintain a friendly and empathetic tone
- Escalate complex issues when necessary

Always be patient, understanding, and solution-oriented.`,
			DefaultGreeting: "Hello! Thank you for calling. How can I help you today?",
		},
		{
			Name:        "Sales",
			Slug:        "sales",
			Description: "Engage potential customers and close deals",
			Icon:        "trending-up",
			DefaultSystemPrompt: `You are a professional sales representative. Your role is to:
- Understand customer needs and pain points
- Present relevant products or services
- Handle objections professionally
- Guide customers through the buying process
- Build rapport and trust

Be persuasive but not pushy. Focus on value and solving customer problems.`,
			DefaultGreeting: "Hi there! Thanks for your interest. I'd love to learn more about what you're looking for.",
		},
		{
			Name:        "Healthcare",
			Slug:        "healthcare",
			Description: "Medical appointment scheduling and patient support",
			Icon:        "heart-pulse",
			DefaultSystemPrompt: `You are a healthcare assistant. Your role is to:
- Help patients schedule appointments
- Provide general health information
- Answer questions about services and procedures
- Maintain patient confidentiality
- Direct emergencies to appropriate services

IMPORTANT: Never provide medical diagnoses or specific medical advice. Always recommend consulting with a healthcare professional.`,
			DefaultGreeting: "Hello! Welcome to our healthcare center. How may I assist you today?",
		},
		{
			Name:        "Real Estate",
			Slug:        "real-estate",
			Description: "Property inquiries and scheduling viewings",
			Icon:        "home",
			DefaultSystemPrompt: `You are a real estate assistant. Your role is to:
- Answer questions about available properties
- Schedule property viewings
- Collect buyer/renter requirements
- Provide neighborhood information
- Connect serious inquiries with agents

Be informative and helpful while qualifying leads effectively.`,
			DefaultGreeting: "Hi! Thank you for calling. Are you looking to buy, sell, or rent a property?",
		},
		{
			Name:        "Restaurant",
			Slug:        "restaurant",
			Description: "Handle reservations and menu inquiries",
			Icon:        "utensils",
			DefaultSystemPrompt: `You are a restaurant assistant. Your role is to:
- Take and manage reservations
- Answer questions about the menu
- Inform about dietary options and allergens
- Describe specials and recommendations
- Handle takeout and delivery orders

Be warm and welcoming, representing the restaurant's hospitality.`,
			DefaultGreeting: "Thank you for calling! Would you like to make a reservation or hear about today's specials?",
		},
		{
			Name:        "Legal Services",
			Slug:        "legal",
			Description: "Initial client intake and appointment scheduling",
			Icon:        "scale",
			DefaultSystemPrompt: `You are a legal services assistant. Your role is to:
- Gather initial case information
- Schedule consultations with attorneys
- Explain general service offerings
- Collect contact information
- Screen for conflicts of interest

IMPORTANT: Never provide legal advice. Always clarify that only licensed attorneys can provide legal counsel.`,
			DefaultGreeting: "Hello, thank you for contacting our law firm. How may I direct your inquiry?",
		},
		{
			Name:        "Education",
			Slug:        "education",
			Description: "Student inquiries and enrollment assistance",
			Icon:        "graduation-cap",
			DefaultSystemPrompt: `You are an education assistant. Your role is to:
- Answer questions about programs and courses
- Guide students through enrollment
- Provide information about schedules and fees
- Connect students with advisors
- Share campus resources information

Be encouraging and supportive of students' educational goals.`,
			DefaultGreeting: "Welcome! I'm here to help with any questions about our programs. What would you like to know?",
		},
		{
			Name:                "Custom",
			Slug:                "custom",
			Description:         "Build a fully customized voice agent",
			Icon:                "settings",
			DefaultSystemPrompt: `You are a helpful AI assistant. Be professional, friendly, and helpful in all interactions.`,
			DefaultGreeting:     "Hello! How can I assist you today?",
		},
	}

	for _, industry := range industries {
		var existing models.Industry
		result := db.Where("slug = ?", industry.Slug).First(&existing)
		if result.Error != nil {
			db.Create(&industry)
			log.Debug().Str("industry", industry.Name).Msg("Created industry")
		}
	}
}
