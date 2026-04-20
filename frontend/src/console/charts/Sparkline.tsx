type SparklineProps = {
  data: number[]
  width?: number
  height?: number
  color?: string
  fill?: boolean
  strokeWidth?: number
}

export function Sparkline({ data, width = 120, height = 32, color = 'var(--lattice-accent)', fill = true, strokeWidth = 1.5 }: SparklineProps) {
  if (!data?.length) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - 2 - ((v - min) / range) * (height - 4)
    return [x, y] as const
  })
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const area = `${path} L${width} ${height} L0 ${height} Z`
  const gid = `sg-${Math.random().toString(36).slice(2, 8)}`
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }} aria-hidden="true">
      {fill && (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gid})`} />
        </>
      )}
      <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
