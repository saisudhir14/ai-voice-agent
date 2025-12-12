"""
LangChain Voice Agent Implementation
Supports multiple LLM providers, tools, and conversation memory.
"""

import os
from typing import AsyncGenerator
from dataclasses import dataclass, field

from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI

from tools import get_tools, AVAILABLE_TOOLS


@dataclass
class AgentConfig:
    """Configuration for a voice agent."""
    system_prompt: str
    greeting: str | None = None
    model: str = "claude-3-haiku-20240307"
    temperature: float = 0.7
    max_tokens: int = 1024
    tools: list[str] = field(default_factory=list)


class VoiceAgent:
    """
    LangChain-powered voice agent with:
    - Conversation memory
    - Tool support
    - Streaming responses
    """
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.messages: list = []
        self.llm = self._create_llm()
        self.tools = get_tools(config.tools) if config.tools else []
        self.chain = self._create_chain()
    
    def _create_llm(self):
        """Create the appropriate LLM based on model name."""
        model = self.config.model
        
        if model.startswith("claude"):
            return ChatAnthropic(
                model=model,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens,
                anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
            )
        elif model.startswith("gpt") or model.startswith("o1"):
            return ChatOpenAI(
                model=model,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens,
                openai_api_key=os.getenv("OPENAI_API_KEY"),
            )
        else:
            # Default to Claude
            return ChatAnthropic(
                model="claude-3-haiku-20240307",
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens,
                anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
            )
    
    def _create_chain(self):
        """Create the LangChain chain with prompt template."""
        # Add voice-specific instructions to system prompt
        voice_instructions = """
IMPORTANT VOICE AGENT GUIDELINES:
- Keep responses concise and conversational (1-3 sentences when possible)
- Do NOT use emojis, special characters, or markdown formatting
- Avoid bullet points or numbered lists - speak naturally
- Your responses will be converted to speech, so write as you would speak
- If you need to convey multiple points, do so in flowing sentences
"""
        
        full_system_prompt = f"{self.config.system_prompt}\n\n{voice_instructions}"
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", full_system_prompt),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{input}"),
        ])
        
        # Bind tools if available
        if self.tools:
            llm_with_tools = self.llm.bind_tools(self.tools)
            return prompt | llm_with_tools
        
        return prompt | self.llm | StrOutputParser()
    
    async def chat(self, message: str) -> tuple[str, list[dict] | None]:
        """
        Send a message and get a complete response.
        Returns (response_text, tool_calls)
        """
        # Add user message to history
        self.messages.append(HumanMessage(content=message))
        
        # Get response
        response = await self.chain.ainvoke({
            "history": self.messages[:-1],  # Exclude current message
            "input": message,
        })
        
        # Handle tool calls if present
        tool_calls = None
        if hasattr(response, 'tool_calls') and response.tool_calls:
            tool_calls = await self._handle_tool_calls(response.tool_calls)
            # Get final response after tool execution
            response = await self.chain.ainvoke({
                "history": self.messages,
                "input": f"Tool results: {tool_calls}. Please provide your response.",
            })
        
        # Extract text content
        if hasattr(response, 'content'):
            response_text = response.content
        else:
            response_text = str(response)
        
        # Add assistant message to history
        self.messages.append(AIMessage(content=response_text))
        
        return response_text, tool_calls
    
    async def stream(self, message: str) -> AsyncGenerator[str, None]:
        """
        Send a message and stream the response.
        Yields text chunks as they're generated.
        """
        # Add user message to history
        self.messages.append(HumanMessage(content=message))
        
        full_response = ""
        
        async for chunk in self.chain.astream({
            "history": self.messages[:-1],
            "input": message,
        }):
            # Handle different chunk types
            if hasattr(chunk, 'content'):
                text = chunk.content
            elif isinstance(chunk, str):
                text = chunk
            else:
                continue
            
            if text:
                full_response += text
                yield text
        
        # Add assistant message to history
        self.messages.append(AIMessage(content=full_response))
    
    async def _handle_tool_calls(self, tool_calls: list) -> list[dict]:
        """Execute tool calls and return results."""
        results = []
        
        for tool_call in tool_calls:
            tool_name = tool_call.get("name")
            tool_args = tool_call.get("args", {})
            
            # Find and execute the tool
            for tool in self.tools:
                if tool.name == tool_name:
                    try:
                        result = await tool.ainvoke(tool_args)
                        results.append({
                            "tool": tool_name,
                            "args": tool_args,
                            "result": result,
                        })
                    except Exception as e:
                        results.append({
                            "tool": tool_name,
                            "args": tool_args,
                            "error": str(e),
                        })
                    break
        
        return results
    
    def get_history(self) -> list[dict]:
        """Get conversation history as a list of dicts."""
        return [
            {
                "role": "user" if isinstance(msg, HumanMessage) else "assistant",
                "content": msg.content,
            }
            for msg in self.messages
        ]
    
    def clear_history(self):
        """Clear conversation history."""
        self.messages = []

