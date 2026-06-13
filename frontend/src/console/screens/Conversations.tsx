import { useEffect, useState } from 'react'
import { PageHeader } from '../shell/PageHeader'
import { Input } from '../primitives/Input'
import { Button } from '../primitives/Button'
import { EmptyState, LoadingState, ErrorState } from '../primitives/misc'
import { Icon } from '../icons'
import { consoleConversationsApi } from '../data/api'
import type { ConsoleConversation } from '../data/types'
import { formatDuration } from '../utils'

export function ConversationsScreen() {
  const [conversations, setConversations] = useState<ConsoleConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    consoleConversationsApi.list()
      .then((r) => setConversations(r.data ?? []))
      .catch(() => setError('Failed to load conversations'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = conversations.filter((c) => {
    if (!query) return true
    const q = query.toLowerCase()
    return c.agent?.name?.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
  })

  const selected = conversations.find((c) => c.id === selectedId)

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null)
    setDeleting(id)
    try {
      await consoleConversationsApi.delete(id)
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (selectedId === id) setSelectedId(null)
    } catch {
      setError('Failed to delete conversation')
    } finally {
      setDeleting(null)
    }
  }

  const sorted = [...filtered].sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="Conversations"
        subtitle={`${conversations.length} conversation${conversations.length !== 1 ? 's' : ''} total`}
      />

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Left: list */}
        <div style={{ width: selectedId ? 380 : '100%', minWidth: 300, borderRight: selectedId ? '1px solid var(--lattice-border)' : 'none', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--lattice-border)' }}>
            <Input icon={Icon.search} placeholder="Search by agent or ID…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          {error && <div style={{ margin: 12, padding: '8px 12px', background: 'var(--lattice-danger-soft)', color: 'var(--lattice-danger)', borderRadius: 'var(--lattice-radius)', fontSize: 12 }}>{error}</div>}

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <LoadingState label="Loading conversations…" />
            ) : error && conversations.length === 0 ? (
              <ErrorState message={error} retry={load} />
            ) : sorted.length === 0 ? (
              <EmptyState
                title={query ? 'No results' : 'No conversations yet'}
                description={query ? `Nothing matches "${query}"` : 'Conversations will appear here after a live call.'}
                icon={<Icon.chat size={28} stroke="var(--lattice-text-3)" />}
              />
            ) : (
              sorted.map((c) => {
                const active = selectedId === c.id
                return (
                  <div
                    key={c.id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={active}
                    onClick={() => setSelectedId(active ? null : c.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(active ? null : c.id) } }}
                    style={{ padding: '12px 16px', borderBottom: '1px solid var(--lattice-border)', cursor: 'pointer', background: active ? 'var(--lattice-accent-soft)' : 'transparent', borderLeft: active ? `3px solid var(--lattice-accent)` : '3px solid transparent' }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--lattice-surface-2)' }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{c.agent?.name ?? 'Unknown agent'}</span>
                      <span style={{ fontFamily: 'var(--lattice-mono)', fontSize: 11.5, color: 'var(--lattice-text-2)' }}>{formatDuration(c.duration_secs ?? 0)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11.5, color: 'var(--lattice-text-3)' }}>{fmtDate(c.started_at)}</span>
                      <span style={{ fontFamily: 'var(--lattice-mono)', fontSize: 10.5, color: 'var(--lattice-text-3)' }}>{c.id.slice(0, 8)}…</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right: detail */}
        {selected && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--lattice-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{selected.agent?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--lattice-text-3)', fontFamily: 'var(--lattice-mono)' }}>{selected.id}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--lattice-text-2)' }}>{fmtDate(selected.started_at)}</span>
                <span style={{ fontFamily: 'var(--lattice-mono)', fontSize: 12 }}>{formatDuration(selected.duration_secs ?? 0)}</span>
                {confirmDeleteId === selected.id ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(selected.id)} disabled={deleting === selected.id} style={{ color: 'var(--lattice-danger)' }}>
                      {deleting === selected.id ? '…' : 'Delete'}
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(selected.id)} disabled={deleting === selected.id} style={{ color: 'var(--lattice-danger)' }}>
                    <Icon.trash size={13} />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}><Icon.close size={13} /></Button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              {selected.transcript && selected.transcript.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {selected.transcript.map((turn, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, minWidth: 40, paddingTop: 3, textTransform: 'uppercase', color: turn.role === 'agent' ? 'var(--lattice-accent)' : 'var(--lattice-info)' }}>
                        {turn.role === 'agent' ? 'Agent' : 'User'}
                      </span>
                      <div style={{ flex: 1, fontSize: 13.5, lineHeight: 1.6, background: 'var(--lattice-surface-2)', borderRadius: 8, padding: '8px 12px' }}>
                        {turn.content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No transcript"
                  description="Transcript data was not captured for this conversation."
                  icon={<Icon.chat size={28} stroke="var(--lattice-text-3)" />}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return iso }
}
