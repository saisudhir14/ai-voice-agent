#!/bin/bash

# Script to set Fly.io secrets from .env file
# Run this from the backend directory

# Source shell configuration to get fly command
source ~/.zshrc 2>/dev/null || source ~/.bashrc 2>/dev/null || true

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "❌ .env file not found!"
  exit 1
fi

echo "📋 Reading .env file and setting Fly.io secrets..."
echo ""

# Source the .env file
export $(grep -v '^#' .env | grep -v '^$' | xargs)

# Set all secrets
echo "Setting DATABASE_URL..."
fly secrets set DATABASE_URL="$DATABASE_URL" --app ai-voice-agent-api

echo "Setting ASSEMBLYAI_API_KEY..."
fly secrets set ASSEMBLYAI_API_KEY="$ASSEMBLYAI_API_KEY" --app ai-voice-agent-api

echo "Setting CARTESIA_API_KEY..."
fly secrets set CARTESIA_API_KEY="$CARTESIA_API_KEY" --app ai-voice-agent-api

echo "Setting CARTESIA_VOICE_ID..."
fly secrets set CARTESIA_VOICE_ID="$CARTESIA_VOICE_ID" --app ai-voice-agent-api

echo "Setting OPENAI_API_KEY..."
fly secrets set OPENAI_API_KEY="$OPENAI_API_KEY" --app ai-voice-agent-api

# Only set ANTHROPIC_API_KEY if it's not empty
if [ -n "$ANTHROPIC_API_KEY" ]; then
  echo "Setting ANTHROPIC_API_KEY..."
  fly secrets set ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" --app ai-voice-agent-api
else
  echo "Skipping ANTHROPIC_API_KEY (empty in .env)"
fi

echo "Setting JWT_SECRET..."
fly secrets set JWT_SECRET="$JWT_SECRET" --app ai-voice-agent-api

# Production overrides
echo "Setting ENV=production..."
fly secrets set ENV="production" --app ai-voice-agent-api

echo "Setting AUTO_SEED=false..."
fly secrets set AUTO_SEED="false" --app ai-voice-agent-api

# LangChain settings (we'll update URL after Step 2, but set it now)
echo "Setting USE_LANGCHAIN=false..."
fly secrets set USE_LANGCHAIN="false" --app ai-voice-agent-api

echo "Setting LANGCHAIN_SERVICE_URL (placeholder, will update after Step 2)..."
fly secrets set LANGCHAIN_SERVICE_URL="https://ai-voice-agent-langchain.fly.dev" --app ai-voice-agent-api

echo ""
echo "✅ All secrets set successfully!"
echo ""
echo "Verifying secrets..."
fly secrets list --app ai-voice-agent-api
