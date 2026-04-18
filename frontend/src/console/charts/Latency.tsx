export type LatencyBreakdown = {
  stt: number
  llm: number
  tts: number
  net: number
}

type LatencyStackProps = LatencyBreakdown & {
  height?: number
  showLabel?: boolean
}

const COLORS = {
  stt: 'oklch(0.72 0.12 200)',
  llm: 'oklch(0.6 0.14 295)',
  tts: 'oklch(0.68 0.13 55)',
  net: 'var(--lattice-text-3)',
} as const

export function LatencyStack({ stt, llm, tts, net, height = 8, showLabel = false }: LatencyStackProps) {
  const total = stt + llm + tts + net
  const parts = [
    { v: stt, color: COLORS.stt, name: 'STT' },
    { v: llm, color: COLORS.llm, name: 'LLM' },
    { v: tts, color: COLORS.tts, name: 'TTS' },
    { v: net, color: COLORS.net, name: 'Net' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          height,
          borderRadius: 3,
          overflow: 'hidden',
          background: 'var(--lattice-surface-2)',
        }}
      >
        {parts.map((p) => (
          <div
            key={p.name}
            title={`${p.name}: ${p.v}ms`}
            style={{ width: `${(p.v / total) * 100}%`, background: p.color, transition: 'width 200ms' }}
          />
        ))}
      </div>
      {showLabel && (
        <span
          className="lattice-mono"
          style={{ fontSize: 11, color: 'var(--lattice-text-2)', minWidth: 52, textAlign: 'right' }}
        >
          {total}ms
        </span>
      )}
    </div>
  )
}

type LatencyRidgeProps = {
  rows: LatencyBreakdown[]
  height?: number
}

export function LatencyRidge({ rows, height = 80 }: LatencyRidgeProps) {
  if (!rows.length) return null
  const max = Math.max(...rows.map((r) => r.stt + r.llm + r.tts + r.net))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height, width: '100%' }} aria-hidden="true">
      {rows.map((r, i) => {
        const scale = height / max
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{ height: r.net * scale, background: COLORS.net }} />
            <div style={{ height: r.tts * scale, background: COLORS.tts }} />
            <div style={{ height: r.llm * scale, background: COLORS.llm }} />
            <div style={{ height: r.stt * scale, background: COLORS.stt }} />
          </div>
        )
      })}
    </div>
  )
}

export const LATENCY_COLORS = COLORS
