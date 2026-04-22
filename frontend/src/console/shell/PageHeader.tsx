import type { ReactNode } from 'react'

type PageHeaderProps = { title: string; subtitle?: string; actions?: ReactNode; meta?: ReactNode }

export function PageHeader({ title, subtitle, actions, meta }: PageHeaderProps) {
  return (
    <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--lattice-border)', background: 'var(--lattice-surface)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0, letterSpacing: '-0.015em' }}>{title}</h1>
          {subtitle && <p style={{ fontSize: 13, color: 'var(--lattice-text-2)', margin: '3px 0 0' }}>{subtitle}</p>}
          {meta && <div style={{ display: 'flex', gap: 14, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>{meta}</div>}
        </div>
        {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>{actions}</div>}
      </div>
    </div>
  )
}
