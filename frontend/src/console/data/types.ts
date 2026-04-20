export type AgentStatus = 'active' | 'inactive'

export type ConsoleAgent = {
  id: string
  name: string
  description: string
  is_active: boolean
  industry: { id: string; name: string; icon: string }
  voice_id: string
  llm_model: string
  system_prompt: string
  greeting: string
  temperature: number
  created_at: string
  updated_at: string
}

export type ConsoleConversation = {
  id: string
  started_at: string
  ended_at: string | null
  duration_secs: number
  agent: { id: string; name: string }
  transcript: TranscriptTurn[]
  metadata: Record<string, unknown>
}

export type TranscriptTurn = {
  role: 'agent' | 'user'
  content: string
  timestamp: number
}

export type Industry = {
  id: string
  name: string
  slug: string
  icon: string
  description: string
}

export type DashboardStats = {
  totalAgents: number
  activeAgents: number
  totalConversations: number
  totalDurationSecs: number
  avgDurationSecs: number
  conversationsThisWeek: number[]
}
