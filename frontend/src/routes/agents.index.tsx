import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { agentsApi } from '@/lib/api'
import { Bot, Plus, Mic, Settings, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { AgentCardSkeleton } from '@/components/shared/loading'

export const Route = createFileRoute('/agents/')({
  component: AgentsIndexPage,
})

interface Agent {
  id: string
  name: string
  description: string
  is_active: boolean
  created_at: string
  industry: {
    name: string
    slug: string
  }
}

export function AgentsIndexPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await agentsApi.list()
      setAgents(response.data || [])
    } catch (error) {
      console.error('Failed to fetch agents:', error)
      toast.error('Failed to load agents')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await agentsApi.delete(id)
      setAgents((prev) => prev.filter((a) => a.id !== id))
      toast.success('Agent deleted')
    } catch (error) {
      console.error('Failed to delete agent:', error)
      toast.error('Failed to delete agent')
    }
  }

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.industry?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="h-9 w-40 bg-muted rounded animate-pulse mb-2" />
            <div className="h-5 w-64 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-10 w-full max-w-md bg-muted rounded animate-pulse mb-6" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <AgentCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader
        title="Voice Agents"
        description="Manage your AI voice assistants"
        action={
          <Button asChild>
            <Link to="/agents/create">
              <Plus className="h-4 w-4" />
              Create Agent
            </Link>
          </Button>
        }
      />

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Agents Grid */}
      {filteredAgents.length === 0 ? (
        <EmptyState
          icon={Bot}
          title={searchQuery ? 'No agents found' : 'No agents yet'}
          description={searchQuery ? 'Try a different search term' : 'Create your first voice agent to get started'}
          action={
            !searchQuery && (
              <Button asChild>
                <Link to="/agents/create">
                  <Plus className="h-4 w-4" />
                  Create Agent
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className="overflow-hidden group">
              <CardContent className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant={agent.is_active ? "success" : "secondary"}>
                    {agent.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold mb-1">{agent.name}</h3>
                <p className="text-muted-foreground text-sm mb-2">{agent.industry?.name || 'Custom'}</p>
                {agent.description && (
                  <p className="text-muted-foreground/70 text-sm line-clamp-2">{agent.description}</p>
                )}
              </CardContent>

              {/* Card Actions */}
              <div className="px-6 py-4 bg-muted/30 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button size="sm" asChild>
                    <Link to="/voice/$agentId" params={{ agentId: agent.id }}>
                      <Mic className="h-4 w-4" />
                      Test
                    </Link>
                  </Button>
                  <Button variant="secondary" size="icon" asChild>
                    <Link to="/agents/$agentId" params={{ agentId: agent.id }}>
                      <Settings className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <ConfirmDialog
                  trigger={
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                  title="Delete Agent"
                  description={`Are you sure you want to delete "${agent.name}"? This action cannot be undone.`}
                  confirmText="Delete"
                  variant="destructive"
                  onConfirm={() => handleDelete(agent.id)}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
