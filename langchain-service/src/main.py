"""
LangChain Voice Agent Service
A dedicated Python microservice for LangChain agent processing.
"""

import os
import asyncio
from typing import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from agent import VoiceAgent, AgentConfig

load_dotenv()

# Store active agents
agents: dict[str, VoiceAgent] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    print("🚀 LangChain Voice Agent Service starting...")
    yield
    # Cleanup
    agents.clear()
    print("👋 LangChain Voice Agent Service shutting down...")


app = FastAPI(
    title="LangChain Voice Agent Service",
    description="Microservice for LangChain-powered voice agent processing",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== Models ====================

class CreateAgentRequest(BaseModel):
    """Request to create a new agent session."""
    session_id: str
    system_prompt: str
    greeting: str | None = None
    model: str = "claude-3-haiku-20240307"
    temperature: float = 0.7
    max_tokens: int = 1024
    tools: list[str] | None = None  # Tool names to enable


class ChatRequest(BaseModel):
    """Request to chat with an agent."""
    session_id: str
    message: str


class ChatResponse(BaseModel):
    """Response from agent."""
    session_id: str
    response: str
    tool_calls: list[dict] | None = None


class StreamRequest(BaseModel):
    """Request for streaming chat."""
    session_id: str
    message: str


# ==================== Endpoints ====================

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "langchain-voice-agent"}


@app.post("/agents/create")
async def create_agent(request: CreateAgentRequest):
    """Create a new agent session."""
    try:
        config = AgentConfig(
            system_prompt=request.system_prompt,
            greeting=request.greeting,
            model=request.model,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            tools=request.tools or [],
        )
        
        agent = VoiceAgent(config)
        agents[request.session_id] = agent
        
        return {
            "session_id": request.session_id,
            "status": "created",
            "greeting": request.greeting,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/agents/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a message and get a complete response."""
    agent = agents.get(request.session_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent session not found")
    
    try:
        response, tool_calls = await agent.chat(request.message)
        return ChatResponse(
            session_id=request.session_id,
            response=response,
            tool_calls=tool_calls,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/agents/stream")
async def stream_chat(request: StreamRequest):
    """Send a message and get a streaming response."""
    agent = agents.get(request.session_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent session not found")
    
    async def generate() -> AsyncGenerator[str, None]:
        try:
            async for chunk in agent.stream(request.message):
                yield f"data: {chunk}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@app.delete("/agents/{session_id}")
async def delete_agent(session_id: str):
    """Delete an agent session."""
    if session_id in agents:
        del agents[session_id]
        return {"status": "deleted", "session_id": session_id}
    raise HTTPException(status_code=404, detail="Agent session not found")


@app.get("/agents/{session_id}/history")
async def get_history(session_id: str):
    """Get conversation history for an agent."""
    agent = agents.get(session_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent session not found")
    
    return {
        "session_id": session_id,
        "messages": agent.get_history(),
    }


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", "8081"))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=os.getenv("ENV", "development") == "development",
    )

