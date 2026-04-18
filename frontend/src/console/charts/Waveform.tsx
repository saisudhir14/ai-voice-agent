import { useEffect, useState } from 'react'

type WaveformProps = {
  bars?: number
  active?: boolean
  height?: number
  intensity?: number
  color?: string
}

export function WaveformBars({
  bars = 64,
  active = true,
  height = 80,
  intensity = 1,
  color = 'var(--lattice-accent)',
}: WaveformProps) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setTick((t) => t + 1), 80)
    return () => clearInterval(id)
  }, [active])
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height, width: '100%' }} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => {
        const base =
          Math.sin((i + tick * 0.8) / 3.1) * 0.5 + Math.cos((i + tick * 0.6) / 2.2) * 0.3 + Math.sin((i + tick) / 1.4) * 0.2
        const h = active ? (Math.abs(base) * intensity + 0.08) * height : 4
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h}px`,
              background: active ? color : 'var(--lattice-border-strong)',
              borderRadius: 2,
              transition: 'height 80ms linear',
              opacity: active ? 0.4 + Math.abs(base) * 0.6 : 0.6,
            }}
          />
        )
      })}
    </div>
  )
}

export function DualWaveCaller({
  active,
  bars = 48,
  height = 72,
  color = 'var(--lattice-info)',
}: WaveformProps) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setTick((t) => t + 1), 80)
    return () => clearInterval(id)
  }, [active])
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height, width: '100%' }} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => {
        const base = Math.cos((i - tick * 0.7) / 2.6) * 0.4 + Math.sin((i - tick * 1.1) / 1.9) * 0.3
        const h = active ? (Math.abs(base) + 0.1) * height : 3
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h}px`,
              background: active ? color : 'var(--lattice-border-strong)',
              borderRadius: 2,
              transition: 'height 80ms',
              opacity: active ? 0.5 + Math.abs(base) * 0.5 : 0.6,
            }}
          />
        )
      })}
    </div>
  )
}
