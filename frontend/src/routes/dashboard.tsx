import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { agentsApi, conversationsApi } from '@/lib/api'
import { Bot, MessageSquare, Plus, TrendingUp, Clock, Mic } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { EmptyState } from '@/components/shared/empty-state'
import { StatsSkeleton, ListItemSkeleton } from '@/components/shared/loading'

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-9 w-64 bg-muted rounded animate-pulse mb-2" />
          <div className="h-5 w-80 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => <StatsSkeleton key={i} />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader><div className="h-6 w-32 bg-muted rounded animate-pulse" /></CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => <ListItemSkeleton key={i} />)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><div className="h-6 w-40 bg-muted rounded animate-pulse" /></CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => <ListItemSkeleton key={i} />)}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}! 👋`}
        description="Here's what's happening with your voice agents"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="Total Agents" value={agents.length} icon={Bot} />
        <StatCard label="Conversations" value={conversations.length} icon={MessageSquare} />
        <StatCard label="Active Agents" value={agents.filter((a) => a.is_active).length} icon={TrendingUp} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Agents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Your Agents</CardTitle>
            <Button size="sm" asChild>
              <Link to="/agents/create">
                <Plus className="h-4 w-4" />
                New Agent
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {agents.length === 0 ? (
              <EmptyState
                icon={Bot}
                title="No agents yet"
                description="Create your first voice agent to get started"
                action={
                  <Button asChild>
                    <Link to="/agents/create">Create Your First Agent</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {agents.slice(0, 5).map((agent) => (
                  <Link
                    key={agent.id}
                    to="/agents/$agentId"
                    params={{ agentId: agent.id }}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">{agent.industry?.name || 'Custom'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={agent.is_active ? "success" : "secondary"}>
                        {agent.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link to="/voice/$agentId" params={{ agentId: agent.id }}>
                          <Mic className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </Link>
                ))}
                {agents.length > 5 && (
                  <Link to="/agents" className="block text-center text-primary hover:underline py-2 text-sm">
                    View all agents →
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Conversations</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/conversations">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {conversations.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No conversations yet"
                description="Start a voice session with one of your agents"
              />
            ) : (
              <div className="space-y-3">
                {conversations.slice(0, 5).map((conv) => (
                  <Link
                    key={conv.id}
                    to="/conversations"
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">{conv.agent?.name}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(conv.started_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Clock className="h-4 w-4" />
                      {Math.floor(conv.duration_secs / 60)}:{(conv.duration_secs % 60).toString().padStart(2, '0')}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
