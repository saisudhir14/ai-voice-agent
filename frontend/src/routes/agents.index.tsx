import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { agentsApi } from '@/lib/api'
import { Bot, Plus, Mic, Settings, Trash2, Search, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { MkButton } from '@/components/landing/mk-button'
import { MkBadge, Container, Display, Lede } from '@/components/landing/primitives'
import {
  EmptyState,
  ConfirmDialog,
  AnimatedSection,
  SpotlightCard,
} from '@/components/shared'
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
    } catch {
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
    } catch {
      toast.error('Failed to delete agent')
    }
  }

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.industry?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <Container className="py-10 sm:py-12">
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="h-10 w-48 bg-paper-3 rounded-lg animate-pulse mb-3" />
            <div className="h-5 w-72 bg-paper-3 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-paper-3 rounded-[10px] animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => <AgentCardSkeleton key={i} />)}
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-10 sm:py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <AnimatedSection>
          <Display as="h1" size="md" className="mb-2">Agents</Display>
          <Lede className="text-base">Manage and deploy your voice assistants.</Lede>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <MkButton asChild variant="primary" size="lg">
            <Link to="/agents/create">
              <Plus className="h-4 w-4" />
              Create agent
            </Link>
          </MkButton>
        </AnimatedSection>
      </div>

      <AnimatedSection delay={0.15}>
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3" />
          <Input
            type="text"
            placeholder="Search by name or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-[10px] border-line bg-paper focus-visible:ring-brand"
            aria-label="Search agents"
          />
        </div>
      </AnimatedSection>

      {filteredAgents.length === 0 ? (
        <AnimatedSection delay={0.2}>
          <EmptyState
            icon={Bot}
            title={searchQuery ? 'No agents found' : 'No agents yet'}
            description={
              searchQuery
                ? 'Try a different search term.'
                : 'Create your first voice agent to get started.'
            }
            action={
              !searchQuery && (
                <MkButton asChild variant="primary" size="md">
                  <Link to="/agents/create">
                    <Plus className="h-4 w-4" />
                    Create agent
                  </Link>
                </MkButton>
              )
            }
          />
        </AnimatedSection>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAgents.map((agent, index) => (
            <AnimatedSection key={agent.id} delay={0.05 * index}>
              <SpotlightCard className="p-0" containerClassName="h-full">
                <div className="flex flex-col h-full">
                  <div className="p-6 sm:p-7 flex-1">
                    <div className="flex items-start justify-between mb-5">
                      <div className="h-12 w-12 rounded-xl bg-brand-tint flex items-center justify-center">
                        <Bot className="h-6 w-6 text-brand-ink" />
                      </div>
                      <MkBadge variant={agent.is_active ? 'brand' : 'neutral'}>
                        {agent.is_active ? 'Online' : 'Offline'}
                      </MkBadge>
                    </div>

                    <h3 className="font-display text-lg font-semibold text-ink mb-1">{agent.name}</h3>
                    <div className="flex items-center gap-1.5 text-ink-3 text-xs mb-3">
                      <Globe className="h-3 w-3" />
                      {agent.industry?.name || 'General purpose'}
                    </div>

                    {agent.description ? (
                      <p className="text-ink-2 text-sm line-clamp-2 leading-relaxed">{agent.description}</p>
                    ) : (
                      <p className="text-ink-3 text-sm italic">No description provided.</p>
                    )}
                  </div>

                  <div className="px-6 py-4 border-t border-line flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MkButton asChild variant="primary" size="md">
                        <Link to="/voice/$agentId" params={{ agentId: agent.id }}>
                          <Mic className="h-3.5 w-3.5" />
                          Launch
                        </Link>
                      </MkButton>
                      <MkButton asChild variant="secondary" size="md">
                        <Link to="/agents/$agentId" params={{ agentId: agent.id }}>
                          <Settings className="h-3.5 w-3.5" />
                        </Link>
                      </MkButton>
                    </div>

                    <ConfirmDialog
                      trigger={
                        <MkButton variant="ghost" size="md" className="text-ink-3 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </MkButton>
                      }
                      title="Delete agent"
                      description={`This will permanently remove "${agent.name}" and all associated session logs.`}
                      confirmText="Delete agent"
                      variant="destructive"
                      onConfirm={() => handleDelete(agent.id)}
                    />
                  </div>
                </div>
              </SpotlightCard>
            </AnimatedSection>
          ))}
        </div>
      )}
    </Container>
  )
}
