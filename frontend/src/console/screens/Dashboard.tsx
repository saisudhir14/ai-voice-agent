import { useEffect, useState } from 'react'
import { PageHeader } from '../shell/PageHeader'
import { Card, CardHeader } from '../primitives/Card'
import { Badge } from '../primitives/Badge'
import { Skeleton } from '../primitives/misc'
import { Sparkline } from '../charts/Sparkline'
import { AreaChart } from '../charts/AreaChart'
import { Icon } from '../icons'
import { consoleAgentsApi, consoleConversationsApi } from '../data/api'
import type { ConsoleAgent, ConsoleConversation } from '../data/types'
import { formatDuration } from '../utils'
import type { NavId } from '../shell/Sidebar'

type Props = { onNavigate: (id: NavId) => void }

export function DashboardScreen({ onNavigate }: Props) {
  const [agents, setAgents] = useState<ConsoleAgent[]>([])
  const [conversations, setConversations] = useState<ConsoleConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([consoleAgentsApi.list(), consoleConversationsApi.list()])
      .then(([ag, cv]) => {
        setAgents(ag.data ?? [])
        setConversations(cv.data ?? [])
      })
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  const activeAgents = agents.filter((a) => a.is_active).length
  const totalDuration = conversations.reduce((s, c) => s + (c.duration_secs ?? 0), 0)
  const avgDuration = conversations.length ? Math.round(totalDuration / conversations.length) : 0

  // Build calls-per-day for the last 7 days from real data
  const callsByDay = buildCallsByDay(conversations, 7)
  const callLabels = ['6d', '5d', '4d', '3d', '2d', '1d', 'Today']

  const recent = [...conversations].sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()).slice(0, 8)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your voice agents and conversations"
        actions={
          <button onClick={() => onNavigate('agents')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', height: 32, background: 'var(--lattice-accent)', color: 'var(--lattice-accent-fg)', border: 'none', borderRadius: 'var(--lattice-radius)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            <Icon.plus size={14} /> New Agent
          </button>
        }
      />

      <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        {error && (
          <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--lattice-danger-soft)', border: '1px solid var(--lattice-danger)', borderRadius: 'var(--lattice-radius)', fontSize: 13, color: 'var(--lattice-danger)' }}>
            {error}
          </div>
        )}

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <KpiCard label="Total Agents" value={loading ? null : agents.length} icon={<Icon.agents size={18} stroke="var(--lattice-accent)" />} spark={null} delta={null} />
          <KpiCard label="Active Agents" value={loading ? null : activeAgents} icon={<Icon.bolt size={18} stroke="var(--lattice-accent)" />} spark={null} delta={null} />
          <KpiCard label="Total Conversations" value={loading ? null : conversations.length} icon={<Icon.chat size={18} stroke="var(--lattice-accent)" />} spark={callsByDay} delta={null} />
          <KpiCard label="Avg Duration" value={loading ? null : formatDuration(avgDuration)} icon={<Icon.clock size={18} stroke="var(--lattice-accent)" />} spark={null} delta={null} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Calls chart */}
          <Card padding={0}>
            <CardHeader title="Conversations (last 7 days)" />
            <div style={{ padding: '16px 8px 8px' }}>
              {loading ? (
                <div style={{ padding: '16px 12px' }}><Skeleton height={120} /></div>
              ) : (
                <AreaChart data={callsByDay} height={140} xLabels={callLabels} />
              )}
            </div>
          </Card>

          {/* Agent status */}
          <Card padding={0}>
            <CardHeader title="Agents" right={<button onClick={() => onNavigate('agents')} style={{ fontSize: 12, color: 'var(--lattice-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>View all</button>} />
            <div style={{ padding: '8px 0' }}>
              {loading ? (
                <div style={{ padding: '0 16px' }}>{[1,2,3].map(i => <div key={i} style={{ padding: '10px 0' }}><Skeleton height={14} /></div>)}</div>
              ) : agents.length === 0 ? (
                <EmptyRow text="No agents yet" action={{ label: 'Create agent', onClick: () => onNavigate('agents') }} />
              ) : (
                agents.slice(0, 6).map((agent) => (
                  <AgentRow key={agent.id} agent={agent} />
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Recent conversations */}
        <Card padding={0}>
          <CardHeader title="Recent Conversations" right={<button onClick={() => onNavigate('conversations')} style={{ fontSize: 12, color: 'var(--lattice-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>View all</button>} />
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: 16 }}>{[1,2,3,4].map(i => <div key={i} style={{ marginBottom: 10 }}><Skeleton height={14} /></div>)}</div>
            ) : recent.length === 0 ? (
              <EmptyRow text="No conversations yet" action={{ label: 'Start a call', onClick: () => onNavigate('live') }} />
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--lattice-border)' }}>
                    {['Agent', 'Started', 'Duration', 'ID'].map((h) => (
                      <th key={h} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--lattice-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--lattice-border)' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 500 }}>{c.agent?.name ?? '—'}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--lattice-text-2)' }}>{fmtDate(c.started_at)}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'var(--lattice-mono)', fontSize: 12 }}>{formatDuration(c.duration_secs ?? 0)}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'var(--lattice-mono)', fontSize: 11, color: 'var(--lattice-text-3)' }}>{c.id?.slice(0, 8)}…</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

function KpiCard({ label, value, icon, spark, delta }: { label: string; value: string | number | null; icon: React.ReactNode; spark: number[] | null; delta: string | null }) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--lattice-text-2)', fontWeight: 500 }}>{label}</span>
        <span style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--lattice-accent-soft)', borderRadius: 8 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value === null ? <Skeleton width={80} height={28} /> : value}
      </div>
      {spark && spark.length > 1 && (
        <Sparkline data={spark} height={28} width={160} />
      )}
      {delta && <span style={{ fontSize: 11, color: 'var(--lattice-text-3)' }}>{delta}</span>}
    </Card>
  )
}

function AgentRow({ agent }: { agent: ConsoleAgent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px' }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: agent.is_active ? 'var(--lattice-accent)' : 'var(--lattice-text-3)', flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</span>
      <span style={{ fontSize: 11.5, color: 'var(--lattice-text-3)' }}>{agent.industry?.name}</span>
      <Badge tone={agent.is_active ? 'success' : 'neutral'}>{agent.is_active ? 'Active' : 'Inactive'}</Badge>
    </div>
  )
}

function EmptyRow({ text, action }: { text: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--lattice-text-3)', fontSize: 13 }}>
      {text}
      {action && (
        <button onClick={action.onClick} style={{ marginLeft: 8, color: 'var(--lattice-accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>{action.label} →</button>
      )}
    </div>
  )
}

function buildCallsByDay(conversations: ConsoleConversation[], days: number): number[] {
  const now = Date.now()
  const buckets = Array(days).fill(0)
  for (const c of conversations) {
    const age = Math.floor((now - new Date(c.started_at).getTime()) / 86400000)
    if (age >= 0 && age < days) buckets[days - 1 - age]++
  }
  return buckets
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}
