import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTweaks } from '../hooks/useTweaks'
import { useKeyboardShortcut } from '../hooks/useKeyboard'
import { Sidebar, type NavId } from './Sidebar'
import { Topbar, type Breadcrumb } from './Topbar'
import { CommandPalette, type CommandItem } from './CommandPalette'
import { TweaksPanel } from './TweaksPanel'

type ConsoleShellProps = {
  view: NavId
  onNavigate: (id: NavId) => void
  breadcrumbs: Breadcrumb[]
  commands?: CommandItem[]
  actions?: ReactNode
  children: ReactNode
  user?: { name: string }
}

export function ConsoleShell({ view, onNavigate, breadcrumbs, commands = [], actions, children, user }: ConsoleShellProps) {
  const { tweaks, update, toggleTheme } = useTweaks()
  const [collapsed, setCollapsed] = useState(tweaks.sidebar === 'rail')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [tweaksOpen, setTweaksOpen] = useState(false)

  useEffect(() => { setCollapsed(tweaks.sidebar === 'rail') }, [tweaks.sidebar])
  useKeyboardShortcut('k', () => setPaletteOpen((o) => !o), { meta: true })

  const rootClass = useMemo(
    () => ['lattice-root', `lattice-theme-${tweaks.theme}`, `lattice-accent-${tweaks.accent}`, `lattice-density-${tweaks.density}`].join(' '),
    [tweaks.theme, tweaks.accent, tweaks.density],
  )

  return (
    <div
      className={rootClass}
      data-theme={tweaks.theme}
      data-accent={tweaks.accent}
      data-density={tweaks.density}
      style={{ display: 'flex', height: '100vh', background: 'var(--lattice-bg)', color: 'var(--lattice-text)', fontFamily: 'var(--lattice-sans)' }}
    >
      <Sidebar view={view} onNavigate={onNavigate} collapsed={collapsed} onToggleCollapse={() => { const next = collapsed ? 'expanded' : 'rail'; update('sidebar', next); setCollapsed(!collapsed) }} className="lattice-hide-sm" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar breadcrumbs={breadcrumbs} actions={actions} theme={tweaks.theme} onToggleTheme={toggleTheme} onOpenCommand={() => setPaletteOpen(true)} onOpenTweaks={() => setTweaksOpen((o) => !o)} user={user} />
        <main style={{ flex: 1, overflowY: 'auto' }}>{children}</main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={commands} />
      <TweaksPanel open={tweaksOpen} onClose={() => setTweaksOpen(false)} theme={tweaks.theme} onTheme={(v) => update('theme', v)} accent={tweaks.accent} onAccent={(v) => update('accent', v)} density={tweaks.density} onDensity={(v) => update('density', v)} sidebar={tweaks.sidebar} onSidebar={(v) => update('sidebar', v)} />
    </div>
  )
}
