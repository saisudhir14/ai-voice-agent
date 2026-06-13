import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon, type IconName } from '../icons'
import { KBD } from '../primitives'

export type CommandItem = {
  id: string
  label: string
  icon: IconName
  kind: string
  action: () => void
  keywords?: string[]
}

type CommandPaletteProps = { open: boolean; onClose: () => void; items: CommandItem[] }

export function CommandPalette({ open, onClose, items }: CommandPaletteProps) {
  const [q, setQ] = useState('')
  const [cursor, setCursor] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (!open) { setQ(''); setCursor(0) } }, [open])

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim()
    if (!needle) return items
    return items.filter((i) => [i.label, i.kind, ...(i.keywords ?? [])].join(' ').toLowerCase().includes(needle))
  }, [items, q])

  useEffect(() => { setCursor(0) }, [q])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(filtered.length - 1, c + 1)) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(0, c - 1)) }
      else if (e.key === 'Enter') { e.preventDefault(); const pick = filtered[cursor]; if (pick) { pick.action(); onClose() } }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, filtered, cursor, onClose])

  if (!open) return null

  return (
    <div onClick={onClose} onKeyDown={(e) => { if (e.key === 'Escape') onClose() }} role="dialog" aria-modal="true" aria-label="Command palette" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '14vh' }}>
      <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation" style={{ width: 560, maxWidth: '90vw', background: 'var(--lattice-surface)', border: '1px solid var(--lattice-border)', borderRadius: 10, boxShadow: 'var(--lattice-shadow-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '0 14px', display: 'flex', alignItems: 'center', gap: 10, height: 48, borderBottom: '1px solid var(--lattice-border)' }}>
          <Icon.search size={15} stroke="var(--lattice-text-3)" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a command or search…" aria-label="Search commands" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: 'var(--lattice-text)', fontFamily: 'var(--lattice-sans)' }} />
          <KBD>esc</KBD>
        </div>
        <div ref={listRef} role="listbox" style={{ maxHeight: 380, overflowY: 'auto', padding: 6 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--lattice-text-3)', fontSize: 13 }}>No results</div>
          ) : filtered.map((item, i) => {
            const IconEl = Icon[item.icon]
            const active = cursor === i
            return (
              <button key={item.id} role="option" aria-selected={active} onMouseEnter={() => setCursor(i)} onClick={() => { item.action(); onClose() }} style={{ width: '100%', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 10, background: active ? 'var(--lattice-surface-2)' : 'transparent', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--lattice-text)', fontSize: 13, textAlign: 'left' }}>
                <IconEl size={14} stroke="var(--lattice-text-2)" />
                <span style={{ flex: 1 }}>{item.label}</span>
                <span style={{ fontSize: 10.5, color: 'var(--lattice-text-3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{item.kind}</span>
              </button>
            )
          })}
        </div>
        <div style={{ padding: '8px 14px', borderTop: '1px solid var(--lattice-border)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--lattice-text-3)' }}>
          <KBD>↑↓</KBD> navigate <KBD>↵</KBD> select <div style={{ flex: 1 }} /> <Icon.command size={11} /> Lattice
        </div>
      </div>
    </div>
  )
}
