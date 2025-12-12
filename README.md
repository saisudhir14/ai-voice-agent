# 🎙️ AI Voice Agent Platform

A production-ready AI Voice Agent application built with Go, React, and modern cloud infrastructure. Enables businesses to create customizable voice AI assistants for various industries.

## 🏗️ Architecture

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
│  ┌────────────────────────────────────────────────────────┐    │
│  │              VOICE PIPELINE                             │    │
│  │   Audio ──► AssemblyAI ──► Claude/GPT ──► Cartesia     │    │
│  │   (PCM)      (STT)         (LLM)         (TTS)         │    │
│  └────────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              BUSINESS LOGIC                             │    │
│  │   Users • Industries • Agents • Conversations          │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL)                        │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Tech Stack

### Backend
- **Go 1.22+** - High-performance backend
- **Chi Router** - Lightweight HTTP router
- **GORM** - ORM for PostgreSQL
- **gorilla/websocket** - WebSocket handling
- **AssemblyAI** - Speech-to-Text
- **Cartesia** - Text-to-Speech
- **Anthropic Claude / OpenAI** - LLM processing

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Zustand** - State management
- **Zod** - Schema validation
- **TanStack Router** - Client-side routing
- **TanStack Table** - Data tables
- **Tailwind CSS** - Styling

### Infrastructure
- **Fly.io** - Backend hosting
- **Vercel** - Frontend hosting
- **Supabase** - PostgreSQL database
- **GitHub Actions** - CI/CD

## 📁 Project Structure

```
.
├── backend/                 # Go backend
│   ├── cmd/
│   │   └── server/         # Main application entry
│   ├── internal/
│   │   ├── api/            # HTTP handlers
│   │   ├── config/         # Configuration
│   │   ├── database/       # Database connection
│   │   ├── middleware/     # HTTP middleware
│   │   ├── models/         # GORM models
│   │   ├── repository/     # Data access layer
│   │   ├── services/       # Business logic
│   │   └── voice/          # Voice pipeline
│   │       ├── assemblyai/ # STT client
│   │       ├── cartesia/   # TTS client
│   │       ├── llm/        # LLM client
│   │       └── pipeline/   # Voice orchestration
│   ├── go.mod
│   ├── go.sum
│   ├── Dockerfile
│   └── fly.toml
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities
│   │   ├── routes/         # TanStack Router pages
│   │   ├── stores/         # Zustand stores
│   │   ├── types/          # TypeScript types
│   │   └── api/            # API client
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
├── database/               # Database migrations
│   └── migrations/
├── .github/
│   └── workflows/          # GitHub Actions
├── .env.example
└── README.md
```

## 🛠️ Prerequisites

- Go 1.22+
- Node.js 20+
- pnpm
- Docker (optional)
- Fly.io CLI
- Vercel CLI

## 🔑 Environment Variables

### Backend (.env)
```env
# Server
PORT=8080
ENV=development

# Database (Supabase)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Voice Services
ASSEMBLYAI_API_KEY=your_assemblyai_key
CARTESIA_API_KEY=your_cartesia_key

# LLM
ANTHROPIC_API_KEY=your_anthropic_key
# or
OPENAI_API_KEY=your_openai_key

# Auth
JWT_SECRET=your_jwt_secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080
```

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/yourusername/ai-voice-agent.git
cd ai-voice-agent

# Copy environment files
cp .env.example backend/.env
cp .env.example frontend/.env
```

### 2. Start Backend

```bash
cd backend
go mod download
go run cmd/server/main.go
```

### 3. Start Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

### 4. Open Application

Visit `http://localhost:5173`

## 📦 Deployment

### Deploy Backend to Fly.io

```bash
cd backend
fly auth login
fly launch
fly secrets set DATABASE_URL="your_supabase_url"
fly secrets set ASSEMBLYAI_API_KEY="your_key"
fly secrets set CARTESIA_API_KEY="your_key"
fly secrets set ANTHROPIC_API_KEY="your_key"
fly deploy
```

### Deploy Frontend to Vercel

```bash
cd frontend
vercel login
vercel
```

## 📚 API Documentation

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/industries` | List industries |
| GET | `/api/agents` | List user's agents |
| POST | `/api/agents` | Create new agent |
| PUT | `/api/agents/:id` | Update agent |
| DELETE | `/api/agents/:id` | Delete agent |
| GET | `/api/conversations` | List conversations |

### WebSocket

Connect to `/ws/voice/:agentId` for real-time voice communication.

## 🎯 Features

- ✅ Multi-industry voice agent templates
- ✅ Custom agent instructions & prompts
- ✅ Real-time speech-to-text
- ✅ Natural text-to-speech
- ✅ Conversation history
- ✅ Agent analytics
- ✅ User authentication
- ✅ Responsive design

## 📄 License

MIT License - see LICENSE file for details.

