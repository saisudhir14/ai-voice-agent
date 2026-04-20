import type { CSSProperties, ReactNode } from 'react'
import { TONE_VARS, type Tone } from '../utils'

type BadgeProps = {
  tone?: Tone
  dot?: boolean
  children: ReactNode
  style?: CSSProperties
}

export function Badge({ tone = 'neutral', dot, children, style }: BadgeProps) {
  const t = TONE_VARS[tone]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
        padding: '2px 7px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 500,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.fg }} />}
      {children}
    </span>
  )
}
