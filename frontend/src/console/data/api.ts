import { api } from '@/lib/api'
import type { ConsoleAgent, ConsoleConversation, Industry } from './types'

export const consoleAgentsApi = {
  list: () => api.get<ConsoleAgent[]>('/agents'),
  get: (id: string) => api.get<ConsoleAgent>(`/agents/${id}`),
  create: (data: {
    industry_id: string
    name: string
    description?: string
    system_prompt?: string
    greeting?: string
    voice_id?: string
    llm_model?: string
    temperature?: number
  }) => api.post<ConsoleAgent>('/agents', data),
  update: (id: string, data: Partial<{
    name: string
    description: string
    system_prompt: string
    greeting: string
    voice_id: string
    llm_model: string
    temperature: number
    is_active: boolean
  }>) => api.put<ConsoleAgent>(`/agents/${id}`, data),
  delete: (id: string) => api.delete(`/agents/${id}`),
  toggleActive: (id: string, is_active: boolean) => api.put<ConsoleAgent>(`/agents/${id}`, { is_active }),
}

export const consoleConversationsApi = {
  list: () => api.get<ConsoleConversation[]>('/conversations'),
  get: (id: string) => api.get<ConsoleConversation>(`/conversations/${id}`),
  delete: (id: string) => api.delete(`/conversations/${id}`),
}

export const consoleIndustriesApi = {
  list: () => api.get<Industry[]>('/industries'),
}
