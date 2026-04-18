import type { ReactNode } from 'react'

type DonutProps = {
  value: number
  max?: number
  size?: number
  stroke?: number
  color?: string
  label?: ReactNode
}

export function Donut({
  value,
  max = 100,
  size = 80,
  stroke = 8,
  color = 'var(--lattice-accent)',
  label,
}: DonutProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = (value / max) * c
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--lattice-surface-2)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${pct} ${c}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 400ms' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          fontFamily: 'var(--lattice-mono)',
          fontSize: size * 0.24,
          fontWeight: 600,
          color: 'var(--lattice-text)',
        }}
      >
        {label ?? `${value}%`}
      </div>
    </div>
  )
}
