import { useEffect, useState } from 'react'
import { PageHeader } from '../shell/PageHeader'
import { Card } from '../primitives/Card'
import { Badge } from '../primitives/Badge'
import { Button } from '../primitives/Button'
import { Input } from '../primitives/Input'
import { EmptyState, LoadingState, ErrorState } from '../primitives/misc'
import { Icon } from '../icons'
import { consoleAgentsApi } from '../data/api'
import type { ConsoleAgent } from '../data/types'

export function AgentsScreen() {
  const [agents, setAgents] = useState<ConsoleAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    consoleAgentsApi.list()
      .then((r) => setAgents(r.data ?? []))
      .catch(() => setError('Failed to load agents'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = agents.filter((a) =>
    !query || a.name.toLowerCase().includes(query.toLowerCase()) || a.industry?.name?.toLowerCase().includes(query.toLowerCase())
  )

  const handleToggle = async (agent: ConsoleAgent) => {
    setToggling(agent.id)
    try {
      const updated = await consoleAgentsApi.toggleActive(agent.id, !agent.is_active)
      setAgents((prev) => prev.map((a) => a.id === agent.id ? updated.data : a))
    } catch {
      // keep optimistic update rollback
    } finally {
      setToggling(null)
    }
  }

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null)
    setDeletingId(id)
    try {
      await consoleAgentsApi.delete(id)
      setAgents((prev) => prev.filter((a) => a.id !== id))
    } catch {
      setError('Failed to delete agent')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="Agents"
        subtitle={`${agents.length} agent${agents.length !== 1 ? 's' : ''} in your workspace`}
        actions={
          <a href="/agents/create" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', height: 32, background: 'var(--lattice-accent)', color: 'var(--lattice-accent-fg)', borderRadius: 'var(--lattice-radius)', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
            <Icon.plus size={14} /> New Agent
          </a>
        }
      />

      <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        {error && (
          <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--lattice-danger-soft)', color: 'var(--lattice-danger)', border: '1px solid var(--lattice-danger)', borderRadius: 'var(--lattice-radius)', fontSize: 13 }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <Input icon={Icon.search} placeholder="Search agents by name or industry…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: 320 }} />
        </div>

        {loading ? (
          <LoadingState label="Loading agents…" />
        ) : error && agents.length === 0 ? (
          <ErrorState message={error} retry={load} />
        ) : filtered.length === 0 && agents.length === 0 ? (
          <EmptyState
            title="No agents yet"
            description="Create your first voice agent to get started."
            icon={<Icon.agents size={32} stroke="var(--lattice-text-3)" />}
            action={
              <a href="/agents/create" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', height: 32, background: 'var(--lattice-accent)', color: 'var(--lattice-accent-fg)', borderRadius: 'var(--lattice-radius)', fontSize: 13, fontWeight: 500, textDecoration: 'none', marginTop: 8 }}>
                <Icon.plus size={14} /> Create Agent
              </a>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState title="No results" description={`No agents match "${query}"`} icon={<Icon.search size={28} stroke="var(--lattice-text-3)" />} />
        ) : (
          <Card padding={0}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--lattice-border)' }}>
                  {['Agent', 'Industry', 'Voice / LLM', 'Status', ''].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--lattice-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((agent) => (
                  <tr key={agent.id} style={{ borderBottom: '1px solid var(--lattice-border)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--lattice-surface-2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{agent.name}</div>
                      {agent.description && <div style={{ fontSize: 11.5, color: 'var(--lattice-text-3)', marginTop: 2, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.description}</div>}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--lattice-text-2)' }}>{agent.industry?.name ?? '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 12, color: 'var(--lattice-text-2)', fontFamily: 'var(--lattice-mono)' }}>{agent.voice_id || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--lattice-text-3)', fontFamily: 'var(--lattice-mono)', marginTop: 2 }}>{agent.llm_model || '—'}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge tone={agent.is_active ? 'success' : 'neutral'} dot>{agent.is_active ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Button variant="ghost" size="sm" onClick={() => handleToggle(agent)} disabled={toggling === agent.id} title={agent.is_active ? 'Deactivate' : 'Activate'}>
                          {toggling === agent.id ? '…' : agent.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <a href={`/agents/${agent.id}`} style={{ display: 'inline-flex', alignItems: 'center', padding: '0 10px', height: 28, background: 'transparent', border: '1px solid var(--lattice-border)', borderRadius: 'var(--lattice-radius)', fontSize: 12.5, color: 'var(--lattice-text)', textDecoration: 'none', fontWeight: 500 }}>
                          <Icon.edit size={12} style={{ marginRight: 4 }} /> Edit
                        </a>
                        {confirmDeleteId === agent.id ? (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(agent.id)} disabled={deletingId === agent.id} style={{ color: 'var(--lattice-danger)' }}>
                              {deletingId === agent.id ? '…' : 'Delete'}
                            </Button>
                          </>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(agent.id)} disabled={deletingId === agent.id} title="Delete agent" style={{ color: 'var(--lattice-danger)' }}>
                            <Icon.trash size={13} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  )
}
