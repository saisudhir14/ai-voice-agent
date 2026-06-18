import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { agentsApi, conversationsApi } from '@/lib/api'
import { Bot, MessageSquare, Plus, TrendingUp, Clock, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { MkButton } from '@/components/landing/mk-button'
import { MkBadge } from '@/components/landing/primitives'
import { Container, Display, Lede } from '@/components/landing/primitives'
import {
  StatCard,
  EmptyState,
  AnimatedSection,
  SpotlightCard,
} from '@/components/shared'
import { StatsSkeleton } from '@/components/shared/loading'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

interface Agent {
  id: string
  name: string
  description: string
  is_active: boolean
  industry: {
    name: string
    icon: string
  }
}

interface Conversation {
  id: string
  started_at: string
  duration_secs: number
  agent: {
    name: string
  }
}

export function DashboardPage() {
  const { user } = useAuthStore()
  const [agents, setAgents] = useState<Agent[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsRes, convsRes] = await Promise.all([
          agentsApi.list(),
          conversationsApi.list(),
        ])
        setAgents(agentsRes.data || [])
        setConversations(convsRes.data || [])
      } catch {
        // Failed to fetch data
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <Container className="py-10 sm:py-12">
        <div className="mb-10">
          <div className="h-9 w-64 bg-paper-3 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-80 bg-paper-3 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {[1, 2, 3].map((i) => <StatsSkeleton key={i} />)}
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-10 sm:py-12">
      <AnimatedSection>
        <div className="mb-10">
          <Display as="h1" size="md" className="mb-2">
            Welcome back, {user?.name?.split(' ')[0]}
          </Display>
          <Lede className="text-base">Here's what's happening with your voice agents.</Lede>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <AnimatedSection delay={0.1}>
          <StatCard label="Total Agents" value={agents.length} icon={Bot} />
        </AnimatedSection>
        <AnimatedSection delay={0.15}>
          <StatCard label="Conversations" value={conversations.length} icon={MessageSquare} />
        </AnimatedSection>
        <AnimatedSection delay={0.2}>
          <StatCard
            label="Active Agents"
            value={agents.filter((a) => a.is_active).length}
            icon={TrendingUp}
          />
        </AnimatedSection>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <AnimatedSection delay={0.25} className="h-full">
          <SpotlightCard className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold text-ink">Your Agents</h2>
              <MkButton asChild variant="primary" size="md">
                <Link to="/agents/create">
                  <Plus className="h-4 w-4" />
                  New Agent
                </Link>
              </MkButton>
            </div>

            {agents.length === 0 ? (
              <EmptyState
                icon={Bot}
                title="No agents yet"
                description="Create your first voice agent to get started."
                action={
                  <MkButton asChild variant="primary" size="md">
                    <Link to="/agents/create">Create your first agent</Link>
                  </MkButton>
                }
              />
            ) : (
              <div className="space-y-2">
                {agents.slice(0, 5).map((agent) => (
                  <Link
                    key={agent.id}
                    to="/agents/$agentId"
                    params={{ agentId: agent.id }}
                    className="group flex items-center justify-between rounded-xl border border-line bg-paper p-4 transition-colors hover:border-line-2 hover:bg-paper-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-brand-tint flex items-center justify-center">
                        <Bot className="h-5 w-5 text-brand-ink" />
                      </div>
                      <div>
                        <p className="font-medium text-ink group-hover:text-brand-ink transition-colors">{agent.name}</p>
                        <p className="text-xs text-ink-3">{agent.industry?.name || 'Custom persona'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MkBadge variant={agent.is_active ? 'brand' : 'neutral'}>
                        {agent.is_active ? 'Online' : 'Offline'}
                      </MkBadge>
                      <ChevronRight className="h-4 w-4 text-ink-3 group-hover:text-ink transition-colors" />
                    </div>
                  </Link>
                ))}
                {agents.length > 5 && (
                  <Link
                    to="/agents"
                    className="flex items-center justify-center gap-1.5 text-sm text-ink-3 hover:text-brand-ink py-3 transition-colors"
                  >
                    View all agents <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            )}
          </SpotlightCard>
        </AnimatedSection>

        <AnimatedSection delay={0.3} className="h-full">
          <SpotlightCard className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold text-ink">Recent Sessions</h2>
              <MkButton asChild variant="ghost" size="md">
                <Link to="/conversations">View history</Link>
              </MkButton>
            </div>

            {conversations.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No sessions yet"
                description="Start a voice session with one of your agents."
              />
            ) : (
              <div className="space-y-2">
                {conversations.slice(0, 5).map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between rounded-xl border border-line bg-paper p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-paper-3 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-ink-2" />
                      </div>
                      <div>
                        <p className="font-medium text-ink">{conv.agent?.name}</p>
                        <p className="text-xs text-ink-3">{formatDate(conv.started_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-ink-3 text-sm tab-nums">
                      <Clock className="h-3.5 w-3.5" />
                      {Math.floor(conv.duration_secs / 60)}:{(conv.duration_secs % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SpotlightCard>
        </AnimatedSection>
      </div>
    </Container>
  )
}
