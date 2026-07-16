import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: number | string
  children: ReactNode
}

export function Card({ children, style, padding = 20, ...rest }: CardProps) {
  return (
    <div
      style={{
        background: 'var(--lattice-surface)',
        border: '1px solid var(--lattice-border)',
        borderRadius: 'var(--lattice-radius-lg)',
        padding,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

type CardHeaderProps = {
  title: ReactNode
  subtitle?: ReactNode
  right?: ReactNode
  style?: CSSProperties
}

export function CardHeader({ title, subtitle, right, style }: CardHeaderProps) {
  return (
    <div
      style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--lattice-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        ...style,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11.5, color: 'var(--lattice-text-3)' }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  )
}
