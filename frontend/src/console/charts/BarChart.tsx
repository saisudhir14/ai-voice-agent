type BarChartProps = {
  data: number[]
  width?: number
  height?: number
  color?: string
  xLabels?: string[]
}

export function BarChart({
  data,
  width = 600,
  height = 180,
  color = 'var(--lattice-accent)',
  xLabels = [],
}: BarChartProps) {
  if (!data?.length) return null
  const padL = 40
  const padR = 10
  const padT = 10
  const padB = 24
  const w = width - padL - padR
  const h = height - padT - padB
  const max = Math.max(...data)
  const gap = 3
  const bw = w / data.length - gap

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {[0.25, 0.5, 0.75, 1].map((f, i) => (
        <line
          key={i}
          x1={padL}
          y1={padT + h * (1 - f)}
          x2={padL + w}
          y2={padT + h * (1 - f)}
          stroke="var(--lattice-border)"
          strokeDasharray="3 3"
        />
      ))}
      {data.map((v, i) => {
        const bh = (v / max) * h
        const x = padL + i * (bw + gap)
        const y = padT + h - bh
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={bw}
            height={bh}
            rx="2"
            fill={color}
            opacity={i === data.length - 1 ? 1 : 0.35 + (i / data.length) * 0.5}
          />
        )
      })}
      {xLabels.map((label, i) => {
        const x = padL + i * (bw + gap) + bw / 2
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
    </svg>
  )
}
