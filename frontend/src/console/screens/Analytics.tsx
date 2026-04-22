import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../shell/PageHeader'
import { Card, CardHeader } from '../primitives/Card'
import { Skeleton } from '../primitives/misc'
import { AreaChart } from '../charts/AreaChart'
import { BarChart } from '../charts/BarChart'
import { Donut } from '../charts/Donut'
import { Icon } from '../icons'
import { consoleAgentsApi, consoleConversationsApi } from '../data/api'
import type { ConsoleAgent, ConsoleConversation } from '../data/types'
import { formatDuration } from '../utils'

type Range = '7d' | '30d' | '90d'

export function AnalyticsScreen() {
  const [agents, setAgents] = useState<ConsoleAgent[]>([])
  const [conversations, setConversations] = useState<ConsoleConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState<Range>('30d')

  useEffect(() => {
    Promise.all([consoleAgentsApi.list(), consoleConversationsApi.list()])
      .then(([ag, cv]) => { setAgents(ag.data ?? []); setConversations(cv.data ?? []) })
      .catch(() => setError('Failed to load analytics data'))
      .finally(() => setLoading(false))
  }, [])

  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90

  const stats = useMemo(() => computeStats(conversations, agents, days), [conversations, agents, days])

  const xLabels = useMemo(() => {
    return stats.callsByDay.map((_, i) => {
      if (stats.callsByDay.length <= 10 || i % Math.floor(stats.callsByDay.length / 7) === 0) {
        const d = new Date(Date.now() - (stats.callsByDay.length - 1 - i) * 86400000)
        return `${d.getMonth() + 1}/${d.getDate()}`
      }
      return ''
    })
  }, [stats.callsByDay])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="Analytics"
        subtitle="Conversation volume and performance metrics"
        actions={
          <div style={{ display: 'flex', background: 'var(--lattice-surface-2)', border: '1px solid var(--lattice-border)', borderRadius: 'var(--lattice-radius)', padding: 2 }}>
            {(['7d', '30d', '90d'] as Range[]).map((r) => (
              <button key={r} onClick={() => setRange(r)} style={{ padding: '4px 12px', fontSize: 12.5, background: range === r ? 'var(--lattice-surface)' : 'transparent', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: range === r ? 600 : 400, color: range === r ? 'var(--lattice-text)' : 'var(--lattice-text-2)', boxShadow: range === r ? 'var(--lattice-shadow-sm)' : 'none' }}>{r}</button>
            ))}
          </div>
        }
      />

      <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        {error && (
          <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--lattice-danger-soft)', color: 'var(--lattice-danger)', border: '1px solid var(--lattice-danger)', borderRadius: 'var(--lattice-radius)', fontSize: 13 }}>{error}</div>
        )}

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
          <StatTile label="Total Calls" value={loading ? null : stats.total} icon={<Icon.chat size={16} stroke="var(--lattice-accent)" />} />
          <StatTile label="Avg Duration" value={loading ? null : formatDuration(stats.avgDuration)} icon={<Icon.clock size={16} stroke="var(--lattice-accent)" />} />
          <StatTile label="Total Duration" value={loading ? null : fmtHours(stats.totalDuration)} icon={<Icon.bolt size={16} stroke="var(--lattice-accent)" />} />
          <StatTile label="Active Agents" value={loading ? null : stats.activeAgents} icon={<Icon.agents size={16} stroke="var(--lattice-accent)" />} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Calls over time */}
          <Card padding={0}>
            <CardHeader title={`Conversations — last ${range}`} />
            <div style={{ padding: '12px 8px 8px' }}>
              {loading ? <div style={{ padding: '0 12px' }}><Skeleton height={160} /></div> : (
                <AreaChart data={stats.callsByDay} height={160} xLabels={xLabels} />
              )}
            </div>
          </Card>

          {/* Calls by agent donut */}
          <Card padding={0}>
            <CardHeader title="By Agent" />
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
              {loading ? <Skeleton height={100} width={100} style={{ borderRadius: '50%' }} /> : (
                <>
                  {stats.total > 0 ? (
                    <Donut value={stats.topAgentPct} size={100} stroke={10} label={<><span style={{ fontSize: 16 }}>{stats.topAgentPct}%</span></>} />
                  ) : (
                    <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--lattice-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--lattice-text-3)' }}>No data</div>
                  )}
                  <div style={{ width: '100%', fontSize: 12, color: 'var(--lattice-text-3)', textAlign: 'center' }}>
                    {stats.topAgentName ? `${stats.topAgentName} leads with ${stats.topAgentPct}% of calls` : 'No calls yet'}
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Duration distribution */}
        <Card padding={0}>
          <CardHeader title="Call Duration Distribution" subtitle="Bucketed by duration in seconds" />
          <div style={{ padding: '12px 8px 8px' }}>
            {loading ? <div style={{ padding: '0 12px' }}><Skeleton height={120} /></div> : (
              <BarChart data={stats.durationBuckets} height={140} xLabels={['0-30s', '30-60s', '1-2m', '2-5m', '5-10m', '10m+']} />
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

function StatTile({ label, value, icon }: { label: string; value: string | number | null; icon: React.ReactNode }) {
  return (
    <Card style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--lattice-accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--lattice-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1 }}>
          {value === null ? <Skeleton width={60} height={22} /> : value}
        </div>
      </div>
    </Card>
  )
}

function computeStats(conversations: ConsoleConversation[], agents: ConsoleAgent[], days: number) {
  const cutoff = Date.now() - days * 86400000
  const recent = conversations.filter((c) => new Date(c.started_at).getTime() >= cutoff)

  const total = recent.length
  const totalDuration = recent.reduce((s, c) => s + (c.duration_secs ?? 0), 0)
  const avgDuration = total ? Math.round(totalDuration / total) : 0
  const activeAgents = agents.filter((a) => a.is_active).length

  // calls per day
  const callsByDay = Array(days).fill(0)
  for (const c of recent) {
    const age = Math.floor((Date.now() - new Date(c.started_at).getTime()) / 86400000)
    if (age >= 0 && age < days) callsByDay[days - 1 - age]++
  }

  // by agent
  const agentCount: Record<string, number> = {}
  for (const c of recent) {
    const name = c.agent?.name ?? 'Unknown'
    agentCount[name] = (agentCount[name] ?? 0) + 1
  }
  const sorted = Object.entries(agentCount).sort((a, b) => b[1] - a[1])
  const topAgentName = sorted[0]?.[0] ?? ''
  const topAgentPct = total ? Math.round(((sorted[0]?.[1] ?? 0) / total) * 100) : 0

  // duration buckets: 0-30, 30-60, 60-120, 120-300, 300-600, 600+
  const bucketFns = [(s: number) => s < 30, (s: number) => s < 60, (s: number) => s < 120, (s: number) => s < 300, (s: number) => s < 600, () => true]
  const durationBuckets: number[] = Array(6).fill(0)
  for (const c of recent) {
    const d = c.duration_secs ?? 0
    const idx = bucketFns.findIndex((fn) => fn(d))
    if (idx >= 0) durationBuckets[idx]++
  }

  return { total, totalDuration, avgDuration, activeAgents, callsByDay, topAgentName, topAgentPct, durationBuckets }
}

function fmtHours(secs: number): string {
  if (secs < 60) return `${secs}s`
  if (secs < 3600) return `${Math.round(secs / 60)}m`
  return `${(secs / 3600).toFixed(1)}h`
}
