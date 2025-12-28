.PHONY: dev dev-backend dev-frontend build seed clean help

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Start database, backend, and frontend
	@echo "Starting database..."
	@docker-compose up -d postgres
	@echo "Starting backend and frontend..."
	@cd backend && go run cmd/server/server.go & \
	cd frontend && npm run dev & \
	wait

dev-backend: ## Start database and run backend
	@echo "Starting database..."
	@docker-compose up -d postgres
	@cd backend && go run cmd/server/server.go

dev-frontend: ## Run only frontend
	@cd frontend && npm run dev

db-up: ## Start only the database
	@docker-compose up -d postgres

db-down: ## Stop the database container
	@docker-compose down

build: ## Build both backend and frontend
	@echo "Building backend..."
	@cd backend && go build -o server ./cmd/server
	@echo "Building frontend..."
	@cd frontend && npm run build

seed: ## Seed the database
	@cd backend && go run cmd/seed/seed.go

clean: ## Clean build artifacts
	@rm -f backend/server backend/seed
	@rm -rf frontend/dist
	@echo "Clean complete"
