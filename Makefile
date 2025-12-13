.PHONY: dev dev-backend dev-frontend build seed clean help

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Run both backend and frontend
	@echo "Starting backend and frontend..."
	@cd backend && go run cmd/server/server.go & \
	cd frontend && npm run dev & \
	wait

dev-backend: ## Run only backend
	@cd backend && go run cmd/server/server.go

dev-frontend: ## Run only frontend
	@cd frontend && npm run dev

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
