import type { CSSProperties, ReactNode } from 'react'
import { Icon, type IconName } from '../icons'
import { Avatar, KBD } from '../primitives'

export type Breadcrumb = { label: string; icon?: IconName; onClick?: () => void }

type TopbarProps = {
  breadcrumbs: Breadcrumb[]
  actions?: ReactNode
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onOpenCommand: () => void
  onOpenTweaks: () => void
  user?: { name: string }
  notifications?: number
}

export function Topbar({ breadcrumbs, actions, theme, onToggleTheme, onOpenCommand, onOpenTweaks, user = { name: 'User' }, notifications = 0 }: TopbarProps) {
  return (
    <header style={{ height: 56, flexShrink: 0, borderBottom: '1px solid var(--lattice-border)', background: 'var(--lattice-surface)', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <BreadcrumbTrail items={breadcrumbs} />
      <div style={{ flex: 1 }} />
      <button onClick={onOpenCommand} aria-label="Open command palette" className="lattice-hide-sm" style={{ height: 32, padding: '0 10px', background: 'var(--lattice-surface-2)', border: '1px solid var(--lattice-border)', borderRadius: 'var(--lattice-radius)', display: 'flex', alignItems: 'center', gap: 8, width: 260, cursor: 'pointer', color: 'var(--lattice-text-3)', fontSize: 12.5 }}>
        <Icon.search size={13} stroke="var(--lattice-text-3)" />
        <span style={{ flex: 1, textAlign: 'left' }}>Search agents, calls, IDs…</span>
        <KBD>⌘K</KBD>
      </button>
      {actions}
      <button onClick={onToggleTheme} style={iconBtnStyle()} title={theme === 'light' ? 'Switch to dark' : 'Switch to light'} aria-label="Toggle theme">
        {theme === 'light' ? <Icon.moon size={15} /> : <Icon.sun size={15} />}
      </button>
      <button style={iconBtnStyle()} title="Notifications" aria-label={`Notifications${notifications ? `, ${notifications} unread` : ''}`}>
        <span style={{ position: 'relative', display: 'inline-flex' }}>
          <Icon.bell size={15} />
          {notifications > 0 && <span style={{ position: 'absolute', top: -1, right: -1, width: 6, height: 6, borderRadius: '50%', background: 'var(--lattice-danger)', border: '1.5px solid var(--lattice-surface)' }} />}
        </span>
      </button>
      <button onClick={onOpenTweaks} style={iconBtnStyle()} title="Tweaks" aria-label="Open tweaks"><Icon.settings size={15} /></button>
      <div style={{ height: 20, width: 1, background: 'var(--lattice-border)' }} />
      <Avatar name={user.name} size={28} />
    </header>
  )
}

function BreadcrumbTrail({ items }: { items: Breadcrumb[] }) {
  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, minWidth: 0 }}>
      {items.map((b, i) => {
        const last = i === items.length - 1
        const IconEl = b.icon ? Icon[b.icon] : null
        return (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {i > 0 && <Icon.chevronRight size={12} stroke="var(--lattice-text-3)" sw={1.5} />}
            <button onClick={b.onClick} aria-current={last ? 'page' : undefined} disabled={!b.onClick} style={{ background: 'none', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: b.onClick ? 'pointer' : 'default', color: last ? 'var(--lattice-text)' : 'var(--lattice-text-2)', fontWeight: last ? 500 : 400, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              {IconEl && <IconEl size={13} stroke="var(--lattice-text-2)" />}
              {b.label}
            </button>
          </span>
        )
      })}
    </nav>
  )
}

export function iconBtnStyle(): CSSProperties {
  return { height: 32, width: 32, border: '1px solid transparent', background: 'transparent', borderRadius: 'var(--lattice-radius)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lattice-text-2)' }
}
