type AreaChartProps = {
  data: number[]
  width?: number
  height?: number
  color?: string
  xLabels?: string[]
  yTicks?: number
}

export function AreaChart({
  data,
  width = 600,
  height = 180,
  color = 'var(--lattice-accent)',
  xLabels = [],
  yTicks = 4,
}: AreaChartProps) {
  if (!data?.length) return null
  const padL = 40
  const padR = 10
  const padT = 10
  const padB = 24
  const w = width - padL - padR
  const h = height - padT - padB
  const max = Math.max(...data)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const pts = data.map((v, i) => [padL + (i / (data.length - 1)) * w, padT + h - ((v - min) / range) * h] as const)
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const area = `${path} L${padL + w} ${padT + h} L${padL} ${padT + h} Z`
  const gid = `ar-${Math.random().toString(36).slice(2, 8)}`
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => min + (range * i) / yTicks)
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => {
        const y = padT + h - ((t - min) / range) * h
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={padL + w} y2={y} stroke="var(--lattice-border)" strokeDasharray="3 3" />
            <text x={padL - 8} y={y + 3} textAnchor="end" fontSize="10" fill="var(--lattice-text-3)" fontFamily="var(--lattice-mono)">
              {Math.round(t)}
            </text>
          </g>
        )
      })}
      {xLabels.map((label, i) => {
        const x = padL + (i / (xLabels.length - 1)) * w
        return (
          <text
            key={i}
            x={x}
            y={height - 8}
            textAnchor="middle"
            fontSize="10"
            fill="var(--lattice-text-3)"
            fontFamily="var(--lattice-mono)"
          >
            {label}
          </text>
        )
      })}
      <path d={area} fill={`url(#${gid})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.75" strokeLinejoin="round" />
      {pts.length > 0 && <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill={color} />}
    </svg>
  )
}
