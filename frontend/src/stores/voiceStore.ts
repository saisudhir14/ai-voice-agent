import { create } from 'zustand'

export type VoiceStatus = 'idle' | 'connecting' | 'ready' | 'listening' | 'processing' | 'speaking' | 'error'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface VoiceState {
  status: VoiceStatus
  isConnected: boolean
  isMuted: boolean
  currentTranscript: string
  messages: Message[]
  error: string | null
  sessionId: string | null
  
  // Actions
  setStatus: (status: VoiceStatus) => void
  setConnected: (connected: boolean) => void
  setMuted: (muted: boolean) => void
  setCurrentTranscript: (transcript: string) => void
  addMessage: (message: Omit<Message, 'id'>) => void
  setError: (error: string | null) => void
  setSessionId: (sessionId: string | null) => void
  reset: () => void
}

export const useVoiceStore = create<VoiceState>((set) => ({
  status: 'idle',
  isConnected: false,
  isMuted: false,
  currentTranscript: '',
  messages: [],
  error: null,
  sessionId: null,

  setStatus: (status) => set({ status }),
  
  setConnected: (isConnected) => set({ isConnected }),
  
  setMuted: (isMuted) => set({ isMuted }),
  
  setCurrentTranscript: (currentTranscript) => set({ currentTranscript }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, { ...message, id: crypto.randomUUID() }],
  })),
  
  setError: (error) => set({ error, status: error ? 'error' : 'idle' }),
  
  setSessionId: (sessionId) => set({ sessionId }),
  
  reset: () => set({
    status: 'idle',
    isConnected: false,
    isMuted: false,
    currentTranscript: '',
    messages: [],
    error: null,
    sessionId: null,
  }),
}))

