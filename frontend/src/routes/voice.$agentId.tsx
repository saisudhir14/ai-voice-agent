import { useEffect, useRef, useState } from 'react'
import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import { useVoiceStore, type VoiceStatus } from '@/stores/voiceStore'
import { agentsApi } from '@/lib/api'
import { Mic, MicOff, Phone, PhoneOff, ArrowLeft, Sparkles, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  PageLoading, 
  GradientBackground, 
  OrbVisualizer
} from '@/components/shared'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export const Route = createFileRoute('/voice/$agentId')({
  component: VoicePage,
})

interface Agent {
  id: string
  name: string
  greeting: string
  industry: {
    name: string
  }
}

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080'

export function VoicePage() {
  const { agentId } = useParams({ from: '/voice/$agentId' })
  const navigate = useNavigate()
  
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  
  const {
    status,
    setStatus,
    isConnected,
    setConnected,
    isMuted,
    setMuted,
    currentTranscript,
    setCurrentTranscript,
    messages,
    addMessage,
    setError,
    reset,
  } = useVoiceStore()

  const wsRef = useRef<WebSocket | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const playbackContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const audioQueueRef = useRef<ArrayBuffer[]>([])
  const isPlayingRef = useRef(false)
  const agentResponseRef = useRef<string>('')

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await agentsApi.get(agentId)
        setAgent(response.data)
      } catch {
        navigate({ to: '/agents' })
      } finally {
        setLoading(false)
      }
    }
    fetchAgent()

    return () => {
      disconnect()
    }
  }, [agentId])

  const connect = async () => {
    try {
      setStatus('connecting')

      if (!playbackContextRef.current || playbackContextRef.current.state === 'closed') {
        playbackContextRef.current = new AudioContext({ sampleRate: 44100 })
        gainNodeRef.current = playbackContextRef.current.createGain()
        gainNodeRef.current.gain.value = 1.0
        gainNodeRef.current.connect(playbackContextRef.current.destination)
      }
      
      if (playbackContextRef.current.state !== 'running') {
        try {
          await playbackContextRef.current.resume()
        } catch {
          // Silent fail
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      })
      mediaStreamRef.current = stream

      audioContextRef.current = new AudioContext({ sampleRate: 16000 })
      const source = audioContextRef.current.createMediaStreamSource(stream)
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1)
      
      const ws = new WebSocket(`${WS_URL}/ws/voice/${agentId}`)
      wsRef.current = ws

      ws.onopen = async () => {
        setConnected(true)
        setStatus('ready')
        
        processorRef.current!.onaudioprocess = (e) => {
          if (isMuted || ws.readyState !== WebSocket.OPEN) return
          
          const inputData = e.inputBuffer.getChannelData(0)
          const pcmData = new Int16Array(inputData.length)
          
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]))
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
          }
          
          ws.send(pcmData.buffer)
        }
        
        source.connect(processorRef.current!)
        processorRef.current!.connect(audioContextRef.current!.destination)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleVoiceEvent(data)
        } catch {
          // Parse error
        }
      }

      ws.onerror = () => setError('Connection error')
      ws.onclose = () => {
        setConnected(false)
        setStatus('idle')
      }

    } catch {
      setError('Failed to access microphone')
    }
  }

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'end' }))
      wsRef.current.close()
      wsRef.current = null
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }

    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect()
      gainNodeRef.current = null
    }

    if (playbackContextRef.current) {
      playbackContextRef.current.close()
      playbackContextRef.current = null
    }

    audioQueueRef.current = []
    isPlayingRef.current = false
    agentResponseRef.current = ''
    reset()
  }

  const handleVoiceEvent = (event: { type: string; data?: Record<string, unknown>; timestamp: number }) => {
    switch (event.type) {
      case 'ready':
        setStatus('ready')
        if (agent?.greeting) {
          addMessage({ role: 'assistant', content: agent.greeting, timestamp: event.timestamp })
        }
        break

      case 'stt_chunk':
        setCurrentTranscript((event.data?.text as string) || '')
        setStatus('listening')
        break

      case 'stt_output':
        const userText = (event.data?.text as string) || ''
        if (userText) {
          addMessage({ role: 'user', content: userText, timestamp: event.timestamp })
        }
        setCurrentTranscript('')
        setStatus('processing')
        break

      case 'agent_chunk':
        setStatus('speaking')
        const chunkText = (event.data?.text as string) || ''
        agentResponseRef.current += chunkText
        break

      case 'agent_end':
        if (agentResponseRef.current) {
          addMessage({ role: 'assistant', content: agentResponseRef.current, timestamp: event.timestamp })
          agentResponseRef.current = ''
        }
        break

      case 'tts_chunk':
        if (event.data?.audio) {
          try {
            const audioData = base64ToArrayBuffer(event.data.audio as string)
            if (audioData.byteLength > 0) {
              audioQueueRef.current.push(audioData)
              playAudioQueue().catch(() => {})
            }
          } catch {}
        }
        break

      case 'error':
        setError((event.data?.message as string) || 'An error occurred')
        break

      case 'session_end':
        setStatus('idle')
        break
    }
  }

  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }

  const playAudioQueue = async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return
    
    isPlayingRef.current = true
    
    if (!playbackContextRef.current || playbackContextRef.current.state === 'closed') {
      playbackContextRef.current = new AudioContext({ sampleRate: 44100 })
      gainNodeRef.current = playbackContextRef.current.createGain()
      gainNodeRef.current.gain.value = 1.0
      gainNodeRef.current.connect(playbackContextRef.current.destination)
    }
    
    const playbackContext = playbackContextRef.current

    if (playbackContext.state !== 'running') {
      try {
        await playbackContext.resume()
      } catch {
        isPlayingRef.current = false
        return
      }
    }

    while (audioQueueRef.current.length > 0) {
      const audioData = audioQueueRef.current.shift()!
      try {
        const int16Array = new Int16Array(audioData)
        if (int16Array.length === 0) continue
        
        const float32Array = new Float32Array(int16Array.length)
        for (let i = 0; i < int16Array.length; i++) {
          float32Array[i] = Math.max(-1, Math.min(1, int16Array[i] / 32768.0))
        }
        
        const audioBuffer = playbackContext.createBuffer(1, float32Array.length, 44100)
        audioBuffer.getChannelData(0).set(float32Array)
        
        const source = playbackContext.createBufferSource()
        source.buffer = audioBuffer
        source.connect(gainNodeRef.current || playbackContext.destination)
        
        await new Promise<void>((resolve) => {
          source.onended = () => resolve()
          source.start(0)
        })
      } catch {}
    }

    isPlayingRef.current = false
    if (audioQueueRef.current.length > 0) {
      playAudioQueue()
    } else {
      setStatus('ready')
    }
  }

  const toggleMute = () => setMuted(!isMuted)

  const { error } = useVoiceStore()
  
  const getStatusInfo = (status: VoiceStatus) => {
    if (status === 'error' && error) return { text: error, color: 'text-red-400' }
    const statusMap: Record<VoiceStatus, { text: string; color: string }> = {
      idle: { text: 'Ready to connect', color: 'text-slate-400' },
      connecting: { text: 'Initiating neural link...', color: 'text-cyan-400' },
      ready: { text: 'Active - Listening', color: 'text-cyan-400' },
      listening: { text: 'User speaking...', color: 'text-cyan-400' },
      processing: { text: 'Thinking...', color: 'text-purple-400' },
      speaking: { text: 'Agent responding...', color: 'text-purple-400' },
      error: { text: 'Signal lost', color: 'text-red-400' },
    }
    return statusMap[status] || { text: '', color: '' }
  }

  const statusInfo = getStatusInfo(status)

  if (loading) return <PageLoading />

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-nebula-deep">
      <GradientBackground intensity="medium" />
      
      {/* Header */}
      <header className="relative z-20 p-6 flex items-center justify-between mt-20">
        <Button 
          variant="ghost" 
          onClick={() => navigate({ to: '/dashboard' })}
          className="text-slate-400 hover:text-white rounded-full bg-white/5"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-white tracking-tight">{agent?.name}</h1>
          <p className="text-xs text-cyan-400 uppercase tracking-widest font-mono">
            {agent?.industry?.name} • Session Active
          </p>
        </div>
        <div className="w-24" />
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 gap-12">
        <div className="relative">
          {/* Activity Ring */}
          <AnimatePresence>
            {isConnected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 -m-12"
              >
                <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-0 rounded-full border border-cyan-500/10 animate-[spin_15s_linear_infinite_reverse]" />
              </motion.div>
            )}
          </AnimatePresence>

          <OrbVisualizer 
            size="lg" 
            className={cn(
              "transition-all duration-700",
              !isConnected && "grayscale opacity-50 scale-75 blur-sm"
            )}
          />

          {/* Status Label Floating */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 glass-plus px-4 py-1.5 rounded-full border-white/10"
          >
            <div className="flex items-center gap-2">
              <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", isConnected ? "bg-cyan-400" : "bg-slate-600")} />
              <span className={cn("text-xs font-bold uppercase tracking-tighter", statusInfo.color)}>
                {statusInfo.text}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Transcription Area */}
        <div className="w-full max-w-2xl text-center min-h-[4rem]">
          <AnimatePresence mode="wait">
            {currentTranscript ? (
              <motion.p
                key="transcript"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-xl text-white font-medium italic"
              >
                "{currentTranscript}"
              </motion.p>
            ) : status === 'speaking' ? (
              <motion.div
                key="speaking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2"
              >
                <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                <span className="text-slate-400 font-mono tracking-widest text-xs uppercase">Synthesizing Voice...</span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Recent Message History (Minimal) */}
        <div className="w-full max-w-lg space-y-4">
          <AnimatePresence initial={false}>
            {messages.slice(-3).map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1 - (2 - i) * 0.3, x: 0 }}
                className={cn(
                  "p-4 rounded-2xl text-sm transition-smooth",
                  msg.role === 'user'
                    ? "bg-white/5 text-slate-300 ml-auto rounded-tr-none border border-white/5"
                    : "bg-purple-500/10 text-slate-200 mr-auto rounded-tl-none border border-purple-500/10"
                )}
              >
                <p>{msg.content}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8 relative z-20">
          {isConnected && (
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-16 w-16 rounded-full border transition-all duration-300",
                  isMuted 
                    ? "bg-red-500/10 border-red-500/20 text-red-400" 
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                )}
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
            </motion.div>
          )}

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant={isConnected ? "destructive" : "default"}
              size="icon"
              className={cn(
                "h-24 w-24 rounded-full shadow-2xl transition-all duration-500",
                isConnected 
                  ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" 
                  : "bg-white text-black hover:bg-slate-200 shadow-white/10"
              )}
              onClick={isConnected ? disconnect : connect}
              aria-label={isConnected ? "End call" : "Start call"}
            >
              {isConnected ? (
                <PhoneOff className="h-10 w-10" />
              ) : (
                <Phone className="h-10 w-10" />
              )}
            </Button>
          </motion.div>

          {isConnected && (
            <motion.div 
              initial={{ opacity: 0, scale: 0 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="h-16 w-16 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-400"
            >
              <Activity className="h-6 w-6 animate-pulse" />
            </motion.div>
          )}
        </div>
      </main>

      {/* Background Decorative Grid */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0,transparent_70%)]" />
    </div>
  )
}