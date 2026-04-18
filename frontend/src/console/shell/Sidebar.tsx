import type { CSSProperties } from 'react'
import { Icon, type IconName } from '../icons'
import { Avatar, Badge, Progress, StatusDot } from '../primitives'

export type NavId =
  | 'dashboard'
  | 'agents'
  | 'live'
  | 'conversations'
  | 'analytics'
  | 'numbers'
  | 'keys'

export type NavItem = {
  id: NavId
  label: string
  icon: IconName
  count?: number
  pulse?: boolean
}

const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'agents', label: 'Agents', icon: 'agents', count: 8 },
  { id: 'live', label: 'Live Call', icon: 'phone', pulse: true },
  { id: 'conversations', label: 'Conversations', icon: 'chat', count: 10 },
  { id: 'analytics', label: 'Analytics', icon: 'chart' },
  { id: 'numbers', label: 'Phone Numbers', icon: 'hash' },
  { id: 'keys', label: 'API Keys', icon: 'key' },
]

type SidebarProps = {
  view: NavId
  onNavigate: (id: NavId) => void
  collapsed: boolean
  onToggleCollapse: () => void
  style?: CSSProperties
  className?: string
  orgName?: string
  planName?: string
  planUsage?: { used: number; total: number; unit?: string }
}

export function Sidebar({
  view,
  onNavigate,
  collapsed,
  onToggleCollapse,
  style,
  className,
  orgName = 'Meridian Health',
  planName = 'Scale Plan',
  planUsage = { used: 67482, total: 100000, unit: 'min' },
}: SidebarProps) {
  const width = collapsed ? 56 : 232
  const pct = Math.min(100, (planUsage.used / planUsage.total) * 100)

  return (
    <aside
      className={className}
      aria-label="Primary navigation"
      style={{
        width,
        flexShrink: 0,
        borderRight: '1px solid var(--lattice-border)',
        background: 'var(--lattice-surface)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 180ms ease',
        overflow: 'hidden',
        ...style,
      }}
    >
      <Brand collapsed={collapsed} />
      {!collapsed && <OrgSwitcher name={orgName} />}

      <nav
        style={{ flex: 1, padding: 8, overflowY: 'auto' }}
        aria-label="Sections"
      >
        {NAV.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={view === item.id}
            collapsed={collapsed}
            onClick={() => onNavigate(item.id)}
          />
        ))}

        {!collapsed && (
          <>
            <SectionLabel>Workspace</SectionLabel>
            <WorkspaceLink icon="settings" label="Settings" />
            <WorkspaceLink icon="book" label="Documentation" external />
          </>
        )}
      </nav>

      {!collapsed && <PlanCard name={planName} usage={planUsage} pct={pct} />}

      <button
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          height: 34,
          width: '100%',
          border: 'none',
          borderTop: '1px solid var(--lattice-border)',
          background: 'transparent',
          color: 'var(--lattice-text-3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontSize: 11,
        }}
      >
        <Icon.sidebar size={13} />
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  )
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      style={{
        padding: collapsed ? '14px 12px' : '14px 16px',
        borderBottom: '1px solid var(--lattice-border)',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          background: 'var(--lattice-text)',
          color: 'var(--lattice-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon.logo size={15} stroke="var(--lattice-bg)" sw={2} />
      </div>
      {!collapsed && (
        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}
          >
            Lattice
          </div>
          <div
            style={{
              fontSize: 10.5,
              color: 'var(--lattice-text-3)',
              fontWeight: 500,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            Voice Console
          </div>
        </div>
      )}
    </div>
  )
}

function OrgSwitcher({ name }: { name: string }) {
  return (
    <div style={{ padding: 10, borderBottom: '1px solid var(--lattice-border)' }}>
      <button
        style={{
          width: '100%',
          height: 36,
          padding: '0 10px',
          background: 'var(--lattice-surface-2)',
          border: '1px solid var(--lattice-border)',
          borderRadius: 'var(--lattice-radius)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          fontSize: 12.5,
          color: 'var(--lattice-text)',
        }}
        aria-label={`Switch organization (current: ${name})`}
      >
        <Avatar name={name} size={20} tone="oklch(0.75 0.1 160)" />
        <span style={{ flex: 1, textAlign: 'left', fontWeight: 500 }}>{name}</span>
        <Icon.chevronDown size={12} stroke="var(--lattice-text-3)" />
      </button>
      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
        <Tag>Production</Tag>
        <Tag mono>us-east-1</Tag>
      </div>
    </div>
  )
}

function Tag({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <span
      style={{
        fontSize: 10.5,
        color: 'var(--lattice-text-3)',
        padding: '2px 6px',
        background: 'var(--lattice-surface-2)',
        borderRadius: 3,
        fontFamily: mono ? 'var(--lattice-mono)' : undefined,
      }}
    >
      {children}
    </span>
  )
}

type NavButtonProps = {
  item: NavItem
  active: boolean
  collapsed: boolean
  onClick: () => void
}

function NavButton({ item, active, collapsed, onClick }: NavButtonProps) {
  const IconEl = Icon[item.icon]
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      aria-current={active ? 'page' : undefined}
      style={{
        width: '100%',
        height: 34,
        padding: collapsed ? 0 : '0 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: active ? 'var(--lattice-surface-2)' : 'transparent',
        border: 'none',
        borderRadius: 'var(--lattice-radius)',
        cursor: 'pointer',
        color: active ? 'var(--lattice-text)' : 'var(--lattice-text-2)',
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        marginBottom: 1,
        justifyContent: collapsed ? 'center' : 'flex-start',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = 'var(--lattice-surface-2)'
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent'
      }}
    >
      <IconEl size={15} stroke={active ? 'var(--lattice-accent)' : 'var(--lattice-text-2)'} />
      {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>}
      {!collapsed && item.count != null && (
        <span
          style={{
            fontSize: 10.5,
            color: 'var(--lattice-text-3)',
            fontFamily: 'var(--lattice-mono)',
          }}
        >
          {item.count}
        </span>
      )}
      {!collapsed && item.pulse && <StatusDot tone="success" pulse />}
      {collapsed && item.pulse && (
        <span
          style={{
            position: 'absolute',
            top: 6,
            right: 8,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--lattice-accent)',
          }}
        />
      )}
    </button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10.5,
        fontWeight: 600,
        color: 'var(--lattice-text-3)',
        padding: '16px 10px 6px',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </div>
  )
}

function WorkspaceLink({
  icon,
  label,
  external,
}: {
  icon: IconName
  label: string
  external?: boolean
}) {
  const IconEl = Icon[icon]
  return (
    <button
      title={label}
      style={{
        width: '100%',
        height: 30,
        padding: '0 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'transparent',
        border: 'none',
        borderRadius: 'var(--lattice-radius)',
        cursor: 'pointer',
        color: 'var(--lattice-text-2)',
        fontSize: 12.5,
        fontWeight: 400,
        marginBottom: 1,
      }}
    >
      <IconEl size={15} stroke="var(--lattice-text-2)" />
      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
      {external && (
        <Icon.external
          size={11}
          stroke="var(--lattice-text-3)"
          style={{ marginLeft: 'auto' }}
        />
      )}
    </button>
  )
}

type PlanCardProps = {
  name: string
  usage: { used: number; total: number; unit?: string }
  pct: number
}

function PlanCard({ name, usage, pct }: PlanCardProps) {
  return (
    <div style={{ padding: 10, borderTop: '1px solid var(--lattice-border)' }}>
      <div
        style={{
          padding: 10,
          background: 'var(--lattice-surface-2)',
          borderRadius: 'var(--lattice-radius)',
          border: '1px solid var(--lattice-border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--lattice-text)' }}>
            {name}
          </span>
          <Badge tone="accent">Active</Badge>
        </div>
        <div
          className="lattice-mono"
          style={{
            fontSize: 10.5,
            color: 'var(--lattice-text-2)',
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <span>
            {usage.used.toLocaleString()} {usage.unit ?? ''}
          </span>
          <span>/ {usage.total.toLocaleString()}</span>
        </div>
        <Progress value={pct} />
      </div>
    </div>
  )
}
