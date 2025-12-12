# AI Voice Agent Platform

A voice AI platform built with Go and React for creating customizable voice assistants. The system integrates speech-to-text, large language models, and text-to-speech services to enable real-time voice conversations.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Vercel)                          │
│                 React + TypeScript + Zustand                    │
│              TanStack Router + TanStack Table                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │ WebSocket + REST API
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  GO BACKEND (Fly.io)                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    VOICE PIPELINE                          │ │
│  │   Audio ──► AssemblyAI ──► Claude/GPT ──► Cartesia         │ │
│  │   (PCM)      (STT)         (LLM)         (TTS)             │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    BUSINESS LOGIC                          │ │
│  │   Users | Industries | Agents | Conversations              │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL)                        │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Backend
- Go 1.22+ with Chi Router
- GORM for PostgreSQL
- gorilla/websocket for real-time communication
- AssemblyAI for speech-to-text
- Cartesia for text-to-speech
- Anthropic Claude or OpenAI for LLM processing

### Frontend
- React 18 with TypeScript
- Vite build tool
- Zustand for state management
- Zod for schema validation
- TanStack Router and Table
- Tailwind CSS

### Infrastructure
- Fly.io for backend hosting
- Vercel for frontend hosting
- Supabase for PostgreSQL database
- GitHub Actions for CI/CD

## Project Structure

```
.
├── backend/
│   ├── cmd/server/          # Application entry point
│   ├── internal/
│   │   ├── api/             # HTTP handlers
│   │   ├── config/          # Configuration management
│   │   ├── database/        # Database connection
│   │   ├── middleware/      # HTTP middleware
│   │   ├── models/          # GORM models
│   │   ├── repository/      # Data access layer
│   │   ├── services/        # Business logic
│   │   └── voice/           # Voice pipeline components
│   │       ├── assemblyai/  # STT client
│   │       ├── cartesia/    # TTS client
│   │       ├── llm/         # LLM client
│   │       └── pipeline/    # Voice orchestration
│   ├── Dockerfile
│   └── fly.toml
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities
│   │   ├── routes/          # Page components
│   │   └── stores/          # State management
│   ├── vercel.json
│   └── vite.config.ts
├── langchain-service/       # Python AI agent service
│   ├── src/
│   │   ├── agent.py
│   │   ├── main.py
│   │   └── tools.py
│   ├── Dockerfile
│   └── fly.toml
└── .github/workflows/       # CI/CD pipelines
```

## Prerequisites

- Go 1.22 or later
- Node.js 20 or later
- pnpm
- Docker (optional, for containerized development)
- Fly.io CLI
- Vercel CLI

## Environment Variables

### Backend

Create a `.env` file in the `backend/` directory:

```
PORT=8080
ENV=development

DATABASE_URL=postgresql://user:password@host:5432/dbname

ASSEMBLYAI_API_KEY=your_assemblyai_key
CARTESIA_API_KEY=your_cartesia_key

ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key

JWT_SECRET=your_jwt_secret
```

### Frontend

Create a `.env` file in the `frontend/` directory:

```
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080
```

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/saisudhir14/ai-voice-agent.git
cd ai-voice-agent
```

### Start the Backend

```bash
cd backend
go mod download
go run cmd/server/main.go
```

### Start the Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

The application will be available at `http://localhost:5173`.

## Deployment

### Backend (Fly.io)

```bash
cd backend
fly auth login
fly launch
fly secrets set DATABASE_URL="your_supabase_url"
fly secrets set ASSEMBLYAI_API_KEY="your_key"
fly secrets set CARTESIA_API_KEY="your_key"
fly secrets set ANTHROPIC_API_KEY="your_key"
fly secrets set JWT_SECRET="your_secret"
fly deploy
```

### Frontend (Vercel)

```bash
cd frontend
vercel login
vercel --prod
```

### LangChain Service (Fly.io)

```bash
cd langchain-service
fly auth login
fly launch
fly secrets set OPENAI_API_KEY="your_key"
fly deploy
```

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate user |

### Agents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents` | List all agents |
| POST | `/api/agents` | Create an agent |
| GET | `/api/agents/:id` | Get agent details |
| PUT | `/api/agents/:id` | Update an agent |
| DELETE | `/api/agents/:id` | Delete an agent |

### Industries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/industries` | List available industries |

### Conversations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations` | List conversations |

### WebSocket

Connect to `/ws/voice/:agentId` for real-time voice communication. The WebSocket accepts PCM audio data and returns synthesized speech responses.

## Features

- Multi-industry voice agent templates
- Customizable agent instructions and system prompts
- Real-time speech-to-text transcription
- Natural text-to-speech synthesis
- Conversation history and analytics
- JWT-based authentication
- Responsive web interface

## License

MIT License. See LICENSE file for details.
