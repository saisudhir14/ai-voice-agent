import { useCallback, useEffect, useRef, useState } from 'react'
import { PageHeader } from '../shell/PageHeader'
import { Card } from '../primitives/Card'
import { Badge } from '../primitives/Badge'
import { Button } from '../primitives/Button'
import { EmptyState, LoadingState } from '../primitives/misc'
import { WaveformBars, DualWaveCaller } from '../charts/Waveform'
import { Icon } from '../icons'
import { consoleAgentsApi } from '../data/api'
import type { ConsoleAgent } from '../data/types'

type CallState = 'idle' | 'connecting' | 'connected' | 'ended'

type TranscriptLine = { role: 'agent' | 'user'; text: string; ts: number }

const WS_URL = (import.meta.env.VITE_API_URL || '').replace(/^http/, 'ws')

export function LiveCallScreen() {
  const [agents, setAgents] = useState<ConsoleAgent[]>([])
  const [loadingAgents, setLoadingAgents] = useState(true)
  const [selectedId, setSelectedId] = useState<string>('')
  const [callState, setCallState] = useState<CallState>('idle')
  const [transcript, setTranscript] = useState<TranscriptLine[]>([])
  const [elapsed, setElapsed] = useState(0)
  const [agentSpeaking, setAgentSpeaking] = useState(false)
  const [userSpeaking, setUserSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const mediaRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const transcriptRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    consoleAgentsApi.list()
      .then((r) => {
        const active = (r.data ?? []).filter((a) => a.is_active)
        setAgents(active)
        if (active.length) setSelectedId(active[0].id)
      })
      .finally(() => setLoadingAgents(false))
  }, [])

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [transcript])

  const startCall = useCallback(async () => {
    if (!selectedId) return
    setError(null)
    setCallState('connecting')
    setTranscript([])
    setElapsed(0)

    let stream: MediaStream | null = null
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRef.current = stream
    } catch {
      setError('Microphone access denied. Please allow microphone access to start a call.')
      setCallState('idle')
      return
    }

    const ws = new WebSocket(`${WS_URL}/api/voice/${selectedId}`)
    wsRef.current = ws

    ws.onopen = () => {
      setCallState('connected')
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000)
    }

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as { type: string; text?: string; role?: string }
        if (msg.type === 'transcript' && msg.text) {
          setTranscript((prev) => [...prev, { role: (msg.role as 'agent' | 'user') ?? 'agent', text: msg.text!, ts: Date.now() }])
        }
        if (msg.type === 'agent_start') setAgentSpeaking(true)
        if (msg.type === 'agent_end') setAgentSpeaking(false)
        if (msg.type === 'user_start') setUserSpeaking(true)
        if (msg.type === 'user_end') setUserSpeaking(false)
      } catch { /* non-JSON frame */ }
    }

    ws.onerror = () => {
      setError('WebSocket connection error. Make sure the backend is running.')
      endCall()
    }

    ws.onclose = () => {
      if (callState !== 'idle') endCall()
    }

    // Stream audio to WebSocket
    const ctx = new AudioContext()
    const src = ctx.createMediaStreamSource(stream)
    const processor = ctx.createScriptProcessor(4096, 1, 1)
    processor.onaudioprocess = (e) => {
      if (ws.readyState === WebSocket.OPEN) {
        const buf = e.inputBuffer.getChannelData(0)
        const int16 = new Int16Array(buf.length)
        for (let i = 0; i < buf.length; i++) int16[i] = Math.max(-32768, Math.min(32767, buf[i] * 32768))
        ws.send(int16.buffer)
      }
    }
    src.connect(processor)
    processor.connect(ctx.destination)
  }, [selectedId, callState])

  const endCall = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
    mediaRef.current?.getTracks().forEach((t) => t.stop())
    mediaRef.current = null
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setCallState('ended')
    setAgentSpeaking(false)
    setUserSpeaking(false)
  }, [])

  useEffect(() => () => { endCall() }, [endCall])

  const selectedAgent = agents.find((a) => a.id === selectedId)
  const fmtElapsed = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="Live Call"
        subtitle="Start a real-time voice session with one of your active agents"
        meta={callState === 'connected' ? <Badge tone="success" dot>Live · {fmtElapsed}</Badge> : undefined}
      />

      <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        {error && (
          <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--lattice-danger-soft)', color: 'var(--lattice-danger)', border: '1px solid var(--lattice-danger)', borderRadius: 'var(--lattice-radius)', fontSize: 13 }}>
            {error} <button onClick={() => setError(null)} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
          </div>
        )}

        {loadingAgents ? (
          <LoadingState label="Loading agents…" />
        ) : agents.length === 0 ? (
          <EmptyState
            title="No active agents"
            description="Activate at least one agent in the Agents screen to start a live call."
            icon={<Icon.phone size={32} stroke="var(--lattice-text-3)" />}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16 }}>
            {/* Left panel — agent picker + controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Card>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--lattice-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>Agent</label>
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    disabled={callState === 'connected' || callState === 'connecting'}
                    style={{ width: '100%', height: 36, padding: '0 10px', background: 'var(--lattice-surface-2)', border: '1px solid var(--lattice-border)', borderRadius: 'var(--lattice-radius)', fontSize: 13, color: 'var(--lattice-text)', cursor: 'pointer' }}
                  >
                    {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>

                {selectedAgent && (
                  <div style={{ fontSize: 12, color: 'var(--lattice-text-2)', marginBottom: 14 }}>
                    <div style={{ marginBottom: 4 }}><span style={{ color: 'var(--lattice-text-3)' }}>Industry: </span>{selectedAgent.industry?.name}</div>
                    {selectedAgent.voice_id && <div style={{ marginBottom: 4 }}><span style={{ color: 'var(--lattice-text-3)' }}>Voice: </span><span style={{ fontFamily: 'var(--lattice-mono)', fontSize: 11 }}>{selectedAgent.voice_id}</span></div>}
                    {selectedAgent.llm_model && <div><span style={{ color: 'var(--lattice-text-3)' }}>LLM: </span><span style={{ fontFamily: 'var(--lattice-mono)', fontSize: 11 }}>{selectedAgent.llm_model}</span></div>}
                  </div>
                )}

                {callState === 'idle' || callState === 'ended' ? (
                  <Button style={{ width: '100%' }} onClick={startCall} icon={Icon.phone}>
                    {callState === 'ended' ? 'Call again' : 'Start call'}
                  </Button>
                ) : callState === 'connecting' ? (
                  <Button variant="secondary" style={{ width: '100%' }} disabled>Connecting…</Button>
                ) : (
                  <Button variant="danger" style={{ width: '100%' }} onClick={endCall} icon={Icon.phoneOff}>End call</Button>
                )}
              </Card>

              {/* Waveforms */}
              {callState === 'connected' && (
                <Card>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--lattice-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Agent</div>
                  <WaveformBars active={agentSpeaking} height={48} bars={40} />
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--lattice-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8, marginTop: 14 }}>You</div>
                  <DualWaveCaller active={userSpeaking} height={40} bars={32} />
                </Card>
              )}
            </div>

            {/* Right panel — transcript */}
            <Card padding={0} style={{ display: 'flex', flexDirection: 'column', minHeight: 480 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--lattice-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Transcript</span>
                {callState === 'connected' && <Badge tone="success" dot>Live</Badge>}
                {callState === 'ended' && <Badge tone="neutral">Ended · {fmtElapsed}</Badge>}
              </div>
              <div ref={transcriptRef} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {transcript.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lattice-text-3)', fontSize: 13 }}>
                    {callState === 'connected' ? 'Waiting for speech…' : callState === 'ended' ? 'Call ended — no transcript captured' : 'Start a call to see transcript'}
                  </div>
                ) : (
                  transcript.map((line, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: line.role === 'agent' ? 'var(--lattice-accent)' : 'var(--lattice-info)', minWidth: 36, paddingTop: 2, textTransform: 'uppercase' }}>{line.role === 'agent' ? 'Agent' : 'You'}</span>
                      <span style={{ fontSize: 13, lineHeight: 1.5 }}>{line.text}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
