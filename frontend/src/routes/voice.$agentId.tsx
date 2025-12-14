import { useEffect, useRef, useState } from 'react'
import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import { useVoiceStore, type VoiceStatus } from '@/stores/voiceStore'
import { agentsApi } from '@/lib/api'
import { Mic, MicOff, Phone, PhoneOff, ArrowLeft, Volume2, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageLoading } from '@/components/shared/loading'
import { cn } from '@/lib/utils'

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
      } catch (error) {
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

      // Initialize playback AudioContext early and resume it (required for autoplay)
      // This must happen on user interaction to work properly
      if (!playbackContextRef.current || playbackContextRef.current.state === 'closed') {
        playbackContextRef.current = new AudioContext({ sampleRate: 44100 })
        // Create gain node for volume control
        gainNodeRef.current = playbackContextRef.current.createGain()
        gainNodeRef.current.gain.value = 1.0 // Full volume
        gainNodeRef.current.connect(playbackContextRef.current.destination)
      }
      
      // Resume AudioContext - this is critical for audio playback
      if (playbackContextRef.current.state !== 'running') {
        try {
          await playbackContextRef.current.resume()
        } catch (error) {
          // AudioContext resume failed
        }
      }
      
      // Ensure gain node exists
      if (!gainNodeRef.current && playbackContextRef.current) {
        gainNodeRef.current = playbackContextRef.current.createGain()
        gainNodeRef.current.gain.value = 1.0
        gainNodeRef.current.connect(playbackContextRef.current.destination)
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
        
        // Ensure AudioContext is running before we start processing
        if (playbackContextRef.current && playbackContextRef.current.state !== 'running') {
          try {
            await playbackContextRef.current.resume()
            
            // Test audio playback with a short beep to verify it works
            if (gainNodeRef.current) {
              const testDuration = 0.1 // 100ms
              const testFrequency = 440 // A4 note
              const sampleRate = playbackContextRef.current.sampleRate
              const numSamples = Math.floor(testDuration * sampleRate)
              const buffer = playbackContextRef.current.createBuffer(1, numSamples, sampleRate)
              const data = buffer.getChannelData(0)
              
              for (let i = 0; i < numSamples; i++) {
                data[i] = Math.sin(2 * Math.PI * testFrequency * i / sampleRate) * 0.1 // 10% volume
              }
              
              const source = playbackContextRef.current.createBufferSource()
              source.buffer = buffer
              source.connect(gainNodeRef.current)
              source.start(0)
            }
          } catch (err) {
            // AudioContext resume failed
          }
        }
        
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
        } catch (error) {
          // Failed to parse WebSocket message
        }
      }

      ws.onerror = (error) => {
        setError('Connection error')
      }

      ws.onclose = () => {
        setConnected(false)
        setStatus('idle')
      }

    } catch (error) {
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

    // Clear audio queue and agent response
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
        // Accumulate agent response text
        const chunkText = (event.data?.text as string) || ''
        agentResponseRef.current += chunkText
        break

      case 'agent_end':
        // Add the complete agent message to chat
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
              
              // Play audio queue (non-blocking)
              playAudioQueue().catch(() => {
                // Error in playAudioQueue
              })
            }
          } catch (error) {
            // Failed to process TTS chunk
          }
        }
        break

      case 'error':
        const errorMessage = (event.data?.message as string) || 'An error occurred'
        setError(errorMessage)
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
    if (isPlayingRef.current) {
      // Already playing, will process queue when current playback finishes
      return
    }
    
    if (audioQueueRef.current.length === 0) {
      return
    }
    
    isPlayingRef.current = true
    
    // Use persistent playback context with high quality sample rate
    if (!playbackContextRef.current || playbackContextRef.current.state === 'closed') {
      playbackContextRef.current = new AudioContext({ sampleRate: 44100 })
      gainNodeRef.current = playbackContextRef.current.createGain()
      gainNodeRef.current.gain.value = 1.0
      gainNodeRef.current.connect(playbackContextRef.current.destination)
    }
    
    const playbackContext = playbackContextRef.current

    // Ensure gain node exists
    if (!gainNodeRef.current) {
      gainNodeRef.current = playbackContext.createGain()
      gainNodeRef.current.gain.value = 1.0
      gainNodeRef.current.connect(playbackContext.destination)
    }

    // Resume AudioContext if suspended (required by browser autoplay policy)
    if (playbackContext.state !== 'running') {
      try {
        await playbackContext.resume()
      } catch (error) {
        isPlayingRef.current = false
        return
      }
    }

    // Process all queued audio chunks sequentially
    // Wait for each chunk to finish before playing the next to prevent overlap
    while (audioQueueRef.current.length > 0) {
      const audioData = audioQueueRef.current.shift()!
      
      try {
        // Cartesia returns PCM S16LE (signed 16-bit little-endian)
        // The ArrayBuffer from base64 decode is already in the correct byte order
        // Create Int16Array view - this handles little-endian correctly on most systems
        const int16Array = new Int16Array(audioData)
        
        if (int16Array.length === 0) {
          continue
        }
        
        // Check if we have valid audio data (not all zeros)
        const hasAudio = int16Array.some(sample => sample !== 0)
        if (!hasAudio) {
          continue
        }
        
        // Convert Int16 to Float32 (-1.0 to 1.0 range)
        const float32Array = new Float32Array(int16Array.length)
        for (let i = 0; i < int16Array.length; i++) {
          // Normalize from [-32768, 32767] to [-1.0, 1.0]
          // Use 32768.0 to ensure floating point division
          float32Array[i] = Math.max(-1, Math.min(1, int16Array[i] / 32768.0))
        }
        
        // Create audio buffer (mono, 44100 Hz)
        const audioBuffer = playbackContext.createBuffer(1, float32Array.length, 44100)
        audioBuffer.getChannelData(0).set(float32Array)
        
        // Create and play audio source
        const source = playbackContext.createBufferSource()
        source.buffer = audioBuffer
        
        // Connect through gain node if available, otherwise directly to destination
        if (gainNodeRef.current) {
          source.connect(gainNodeRef.current)
        } else {
          source.connect(playbackContext.destination)
        }
        
        // Play immediately and wait for it to finish before next chunk
        await new Promise<void>((resolve, reject) => {
          source.onended = () => {
            resolve()
          }
          try {
            source.start(0)
          } catch (error) {
            reject(error)
          }
        })
      } catch (error) {
        // Continue with next chunk even if this one failed
      }
    }

    isPlayingRef.current = false
    
    // If more chunks arrived while playing, process them
    if (audioQueueRef.current.length > 0) {
      playAudioQueue().catch(() => {
        // Error in recursive playAudioQueue
      })
    } else {
      setStatus('ready')
    }
  }

  const toggleMute = () => {
    setMuted(!isMuted)
  }

  const { error } = useVoiceStore()
  
  const getStatusText = (status: VoiceStatus) => {
    if (status === 'error' && error) {
      return error
    }
    const statusMap: Record<VoiceStatus, string> = {
      idle: 'Ready to connect',
      connecting: 'Connecting...',
      ready: 'Listening...',
      listening: 'Hearing you...',
      processing: 'Thinking...',
      speaking: 'Speaking...',
      error: 'Error occurred',
    }
    return statusMap[status] || ''
  }

  if (loading) {
    return <PageLoading />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/agents' })}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="text-center">
          <h1 className="font-semibold">{agent?.name}</h1>
          <p className="text-muted-foreground text-sm">{agent?.industry?.name}</p>
        </div>
        <div className="w-20" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Voice Animation */}
        <div className="relative mb-8">
          <div 
            className={cn(
              "absolute inset-0 rounded-full blur-3xl transition-all duration-500",
              status === 'speaking' && "bg-primary/30 scale-150",
              status === 'listening' && "bg-accent/30 scale-125",
              isConnected && "bg-primary/10"
            )}
          />
          <div 
            className={cn(
              "relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300",
              isConnected 
                ? "bg-gradient-to-br from-primary to-accent" 
                : "bg-muted border-2 border-border"
            )}
          >
            {isConnected ? (
              status === 'speaking' ? (
                <Volume2 className="h-16 w-16 text-white animate-pulse" />
              ) : (
                <div className="voice-wave">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )
            ) : (
              <Bot className="h-16 w-16 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Status */}
        <div className="text-center mb-8">
          <p className="text-lg font-medium mb-2">{getStatusText(status)}</p>
          {currentTranscript && (
            <p className="text-muted-foreground italic">"{currentTranscript}"</p>
          )}
        </div>

        {/* Messages */}
        <div className="w-full max-w-md mb-8 max-h-48 overflow-y-auto space-y-3">
          {messages.slice(-5).map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "px-4 py-2 rounded-2xl text-sm",
                msg.role === 'user'
                  ? "bg-primary text-primary-foreground ml-auto max-w-[80%]"
                  : "bg-muted mr-auto max-w-[80%]"
              )}
            >
              {msg.content}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {isConnected && (
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="icon"
              className="h-14 w-14 rounded-full"
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
          )}

          <Button
            variant={isConnected ? "destructive" : "default"}
            size="icon"
            className="h-20 w-20 rounded-full"
            onClick={isConnected ? disconnect : connect}
          >
            {isConnected ? (
              <PhoneOff className="h-8 w-8" />
            ) : (
              <Phone className="h-8 w-8" />
            )}
          </Button>

          {isConnected && <div className="w-14" />}
        </div>

        {!isConnected && (
          <p className="text-muted-foreground text-sm mt-4">
            Press the button to start a conversation
          </p>
        )}
      </main>
    </div>
  )
}
