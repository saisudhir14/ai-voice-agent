import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { agentsApi, conversationsApi } from '@/lib/api'
import { Bot, MessageSquare, Plus, TrendingUp, Clock, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  StatCard, 
  EmptyState, 
  AnimatedSection,
  SpotlightCard,
  GradientBackground
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
      } catch (error) {
        // Failed to fetch data
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
        <div className="mb-8">
          <div className="h-9 w-64 bg-white/5 rounded animate-pulse mb-2" />
          <div className="h-5 w-80 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => <StatsSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GradientBackground intensity="low" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 mt-20">
        <AnimatedSection>
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Welcome back, <span className="text-gradient-nebula">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-slate-400">Here's what's happening with your voice agents</p>
          </div>
        </AnimatedSection>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <AnimatedSection delay={0.1}>
            <StatCard label="Total Agents" value={agents.length} icon={Bot} />
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <StatCard label="Conversations" value={conversations.length} icon={MessageSquare} />
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <StatCard label="Active Status" value={agents.filter((a) => a.is_active).length + " Active"} icon={TrendingUp} />
          </AnimatedSection>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Agents Column */}
          <AnimatedSection delay={0.4} className="h-full">
            <SpotlightCard className="h-full">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-white">Your Agents</h3>
                <Button size="sm" asChild className="bg-white text-black hover:bg-slate-200 rounded-full px-4">
                  <Link to="/agents/create">
                    <Plus className="h-4 w-4 mr-2" />
                    New Agent
                  </Link>
                </Button>
              </div>

              {agents.length === 0 ? (
                <EmptyState
                  icon={Bot}
                  title="No agents yet"
                  description="Create your first voice agent to get started"
                  action={
                    <Button asChild className="bg-cyan-500 hover:bg-cyan-400 text-white rounded-full">
                      <Link to="/agents/create">Create Your First Agent</Link>
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {agents.slice(0, 5).map((agent) => (
                    <Link
                      key={agent.id}
                      to="/agents/$agentId"
                      params={{ agentId: agent.id }}
                      className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                          <Bot className="h-6 w-6 text-cyan-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-cyan-400 transition-colors">{agent.name}</p>
                          <p className="text-xs text-slate-500">{agent.industry?.name || 'Custom Persona'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={agent.is_active ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"}>
                          {agent.is_active ? 'Online' : 'Offline'}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors" />
                      </div>
                    </Link>
                  ))}
                  {agents.length > 5 && (
                    <Link to="/agents" className="flex items-center justify-center gap-2 text-slate-400 hover:text-white py-4 text-sm transition-colors">
                      View all agents <ChevronRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              )}
            </SpotlightCard>
          </AnimatedSection>

          {/* Conversations Column */}
          <AnimatedSection delay={0.5} className="h-full">
            <SpotlightCard className="h-full">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-white">Recent Sessions</h3>
                <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white hover:bg-white/5 rounded-full">
                  <Link to="/conversations">View History</Link>
                </Button>
              </div>

              {conversations.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No sessions yet"
                  description="Start a voice session with one of your agents"
                />
              ) : (
                <div className="space-y-4">
                  {conversations.slice(0, 5).map((conv) => (
                    <div
                      key={conv.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                          <MessageSquare className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white">{conv.agent?.name}</p>
                          <p className="text-xs text-slate-500">{formatDate(conv.started_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-sm font-mono">
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
      </div>
    </div>
  )
}