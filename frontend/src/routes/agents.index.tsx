import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { agentsApi } from '@/lib/api'
import { Bot, Plus, Mic, Settings, Trash2, Search, Filter, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  EmptyState, 
  ConfirmDialog, 
  AnimatedSection, 
  SpotlightCard, 
  GradientBackground 
} from '@/components/shared'
import { AgentCardSkeleton } from '@/components/shared/loading'
import { cn } from '@/lib/utils'

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
      <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
        <div className="flex justify-between items-start mb-12">
          <div>
            <div className="h-10 w-48 bg-white/5 rounded animate-pulse mb-3" />
            <div className="h-5 w-72 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="h-12 w-36 bg-white/5 rounded-full animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => <AgentCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GradientBackground intensity="low" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <AnimatedSection>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tighter">
                Voice <span className="text-gradient-nebula">Intelligence</span>
              </h1>
              <p className="text-slate-400">Manage and deploy your neural voice assistants</p>
            </div>
          </AnimatedSection>
          
          <AnimatedSection delay={0.1}>
            <Button asChild className="bg-white text-black hover:bg-slate-200 rounded-full px-6 h-12 shadow-xl shadow-white/5 group">
              <Link to="/agents/create">
                <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Create New Agent
              </Link>
            </Button>
          </AnimatedSection>
        </div>

        {/* Search & Filter Bar */}
        <AnimatedSection delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <Input
                type="text"
                placeholder="Filter by name or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-white/5 border-white/5 rounded-2xl focus:border-cyan-500/50 focus:ring-cyan-500/20 text-white placeholder:text-slate-500 transition-all"
                aria-label="Filter agents"
              />
            </div>
            <Button variant="ghost" className="h-12 px-6 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </AnimatedSection>

        {/* Agents Grid */}
        {filteredAgents.length === 0 ? (
          <AnimatedSection delay={0.3}>
            <div className="glass-plus rounded-3xl p-20 text-center border-white/5">
              <EmptyState
                icon={Bot}
                title={searchQuery ? 'No match found' : 'The roster is empty'}
                description={searchQuery ? 'Refine your search parameters' : 'Start by building your first AI voice persona'}
                action={
                  !searchQuery && (
                    <Button asChild className="bg-cyan-500 hover:bg-cyan-400 text-white rounded-full mt-6">
                      <Link to="/agents/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Agent
                      </Link>
                    </Button>
                  )
                }
              />
            </div>
          </AnimatedSection>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAgents.map((agent, index) => (
              <AnimatedSection key={agent.id} delay={0.05 * index}>
                <SpotlightCard className="p-0">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <Bot className="h-7 w-7 text-cyan-400" />
                      </div>
                      <Badge className={cn(
                        "rounded-full px-3 py-1 text-[10px] uppercase tracking-widest border font-bold",
                        agent.is_active 
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" 
                          : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                      )}>
                        {agent.is_active ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{agent.name}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-4">
                      <Globe className="h-3 w-3" />
                      {agent.industry?.name || 'General Purpose'}
                    </div>
                    
                    {agent.description ? (
                      <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed h-10">{agent.description}</p>
                    ) : (
                      <p className="text-slate-600 text-sm italic h-10">No description provided for this agent persona.</p>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="mt-auto px-6 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button size="sm" asChild className="bg-cyan-500 hover:bg-cyan-400 text-white rounded-full px-4 h-9 shadow-lg shadow-cyan-500/20">
                        <Link to="/voice/$agentId" params={{ agentId: agent.id }}>
                          <Mic className="h-3.5 w-3.5 mr-2" />
                          Launch
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild className="rounded-full h-9 w-9 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <Link to="/agents/$agentId" params={{ agentId: agent.id }}>
                          <Settings className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                    
                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                      title="Delete Persona"
                      description={`This will permanently remove "${agent.name}" and all associated session logs.`}
                      confirmText="Delete Agent"
                      variant="destructive"
                      onConfirm={() => handleDelete(agent.id)}
                    />
                  </div>
                </SpotlightCard>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}