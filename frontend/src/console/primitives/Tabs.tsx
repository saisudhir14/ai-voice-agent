import type { CSSProperties } from 'react'

export type TabDef = {
  value: string
  label: string
  count?: number
}

type TabsProps = {
  tabs: TabDef[]
  value: string
  onChange: (value: string) => void
  style?: CSSProperties
}

export function Tabs({ tabs, value, onChange, style }: TabsProps) {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        gap: 4,
        borderBottom: '1px solid var(--lattice-border)',
        overflowX: 'auto',
        ...style,
      }}
    >
      {tabs.map((t) => {
        const active = t.value === value
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 12px',
              fontSize: 13,
              fontWeight: 500,
              color: active ? 'var(--lattice-text)' : 'var(--lattice-text-2)',
              borderBottom: `2px solid ${active ? 'var(--lattice-accent)' : 'transparent'}`,
              marginBottom: -1,
              transition: 'all 120ms',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
            }}
          >
            {t.label}
            {t.count != null && (
              <span
                style={{
                  background: 'var(--lattice-surface-2)',
                  color: 'var(--lattice-text-2)',
                  padding: '1px 6px',
                  borderRadius: 10,
                  fontSize: 10.5,
                  fontWeight: 600,
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
