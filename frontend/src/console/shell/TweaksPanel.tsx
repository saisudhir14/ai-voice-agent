import type { ReactNode } from 'react'
import { Icon } from '../icons'
import { SegControl } from '../primitives'
import type { Accent, Density, SidebarMode, Theme } from '../hooks/useTweaks'
import { iconBtnStyle } from './Topbar'

type TweaksPanelProps = {
  open: boolean
  onClose: () => void
  theme: Theme
  onTheme: (v: Theme) => void
  accent: Accent
  onAccent: (v: Accent) => void
  density: Density
  onDensity: (v: Density) => void
  sidebar: SidebarMode
  onSidebar: (v: SidebarMode) => void
}

const ACCENT_SWATCHES: { v: Accent; c: string }[] = [
  { v: 'emerald', c: 'oklch(0.62 0.13 160)' },
  { v: 'blue', c: 'oklch(0.6 0.16 250)' },
  { v: 'violet', c: 'oklch(0.58 0.18 295)' },
  { v: 'orange', c: 'oklch(0.68 0.16 55)' },
]

export function TweaksPanel({
  open,
  onClose,
  theme,
  onTheme,
  accent,
  onAccent,
  density,
  onDensity,
  sidebar,
  onSidebar,
}: TweaksPanelProps) {
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-label="Tweaks"
      style={{
        position: 'fixed',
        top: 70,
        right: 20,
        zIndex: 80,
        width: 300,
        background: 'var(--lattice-surface)',
        border: '1px solid var(--lattice-border)',
        borderRadius: 10,
        boxShadow: 'var(--lattice-shadow-lg)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid var(--lattice-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600 }}>Tweaks</div>
        <button onClick={onClose} style={iconBtnStyle()} aria-label="Close tweaks">
          <Icon.close size={14} />
        </button>
      </div>
      <div
        style={{
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <TweakRow label="Theme">
          <SegControl
            value={theme}
            onChange={onTheme}
            options={[
              { v: 'light', l: 'Light' },
              { v: 'dark', l: 'Dark' },
            ]}
          />
        </TweakRow>

        <TweakRow label="Accent">
          <div style={{ display: 'flex', gap: 6 }}>
            {ACCENT_SWATCHES.map((a) => (
              <button
                key={a.v}
                onClick={() => onAccent(a.v)}
                aria-label={`Set accent to ${a.v}`}
                aria-pressed={accent === a.v}
                title={a.v}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: a.c,
                  border: `2px solid ${accent === a.v ? 'var(--lattice-text)' : 'transparent'}`,
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </TweakRow>

        <TweakRow label="Density">
          <SegControl
            value={density}
            onChange={onDensity}
            options={[
              { v: 'compact', l: 'Compact' },
              { v: 'balanced', l: 'Balanced' },
              { v: 'comfortable', l: 'Roomy' },
            ]}
          />
        </TweakRow>

        <TweakRow label="Sidebar">
          <SegControl
            value={sidebar}
            onChange={onSidebar}
            options={[
              { v: 'rail', l: 'Icon rail' },
              { v: 'expanded', l: 'Expanded' },
            ]}
          />
        </TweakRow>
      </div>
    </div>
  )
}

function TweakRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--lattice-text-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  )
}
