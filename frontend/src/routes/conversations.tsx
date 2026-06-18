import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { conversationsApi } from '@/lib/api'
import { MessageSquare, Clock, Bot, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDate, formatDuration } from '@/lib/utils'
import { toast } from 'sonner'
import { Card } from '@/components/landing/card'
import { MkBadge } from '@/components/landing/primitives'
import { MkButton } from '@/components/landing/mk-button'
import { Container } from '@/components/landing/primitives'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ListItemSkeleton } from '@/components/shared/loading'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/conversations')({
  component: ConversationsPage,
})

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  start_time: number
}

interface Conversation {
  id: string
  session_id: string
  started_at: string
  ended_at: string | null
  duration_secs: number
  summary: string | null
  sentiment: string | null
  agent: {
    id: string
    name: string
  }
  messages: Message[]
}

export function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await conversationsApi.list()
      setConversations(response.data || [])
    } catch {
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await conversationsApi.delete(id)
      setConversations((prev) => prev.filter((c) => c.id !== id))
      toast.success('Conversation deleted')
    } catch {
      toast.error('Failed to delete conversation')
    }
  }

  const handleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }

    try {
      const response = await conversationsApi.get(id)
      const fullConversation = response.data
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? fullConversation : c)),
      )
      setExpandedId(id)
    } catch {
      toast.error('Failed to load conversation details')
    }
  }

  if (loading) {
    return (
      <Container className="py-10 sm:py-12" size="narrow">
        <div className="mb-10">
          <div className="h-9 w-48 bg-paper-3 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-80 bg-paper-3 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} padding="none">
              <ListItemSkeleton />
            </Card>
          ))}
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-10 sm:py-12" size="narrow">
      <PageHeader
        title="Conversations"
        description="View and manage voice conversation history."
      />

      {conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Start a voice session with one of your agents to see conversations here."
        />
      ) : (
        <div className="space-y-3">
          {conversations.map((conversation) => (
            <Card key={conversation.id} padding="none" elevated className="overflow-hidden">
              <button
                type="button"
                onClick={() => handleExpand(conversation.id)}
                className="w-full p-5 sm:p-6 flex items-center justify-between hover:bg-paper-2 transition-colors text-left"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-brand-tint flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-brand-ink" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Bot className="h-3.5 w-3.5 text-ink-3 shrink-0" />
                      <span className="font-medium text-ink truncate">{conversation.agent?.name || 'Unknown agent'}</span>
                    </div>
                    <p className="text-ink-3 text-sm">{formatDate(conversation.started_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <div className="hidden sm:flex items-center gap-1.5 text-ink-3 text-sm tab-nums">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDuration(conversation.duration_secs)}
                  </div>
                  {conversation.sentiment && (
                    <MkBadge
                      variant="outline"
                      className={cn(
                        conversation.sentiment === 'positive' && 'border-green-200 bg-green-50 text-green-700',
                        conversation.sentiment === 'negative' && 'border-red-200 bg-red-50 text-red-700',
                      )}
                    >
                      {conversation.sentiment}
                    </MkBadge>
                  )}
                  {expandedId === conversation.id ? (
                    <ChevronUp className="h-5 w-5 text-ink-3" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-ink-3" />
                  )}
                </div>
              </button>

              {expandedId === conversation.id && (
                <div className="border-t border-line">
                  <div className="p-5 sm:p-6 space-y-3 max-h-96 overflow-y-auto bg-paper-2/50">
                    {conversation.messages?.length > 0 ? (
                      conversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
                        >
                          <div
                            className={cn(
                              'max-w-[80%] rounded-xl px-4 py-2.5 text-sm',
                              message.role === 'user'
                                ? 'bg-brand text-ink-on'
                                : 'bg-paper border border-line text-ink-2',
                            )}
                          >
                            {message.content}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-ink-3 text-center py-4 text-sm">No messages recorded</p>
                    )}
                  </div>

                  <div className="px-5 sm:px-6 py-4 border-t border-line flex items-center justify-between gap-4 bg-paper">
                    {conversation.summary ? (
                      <p className="text-ink-3 text-sm">
                        <span className="font-medium text-ink-2">Summary:</span> {conversation.summary}
                      </p>
                    ) : (
                      <span />
                    )}
                    <ConfirmDialog
                      trigger={
                        <MkButton variant="ghost" size="md" className="text-ink-3 hover:text-destructive shrink-0">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </MkButton>
                      }
                      title="Delete conversation"
                      description="Are you sure you want to delete this conversation? This action cannot be undone."
                      confirmText="Delete"
                      variant="destructive"
                      onConfirm={() => handleDelete(conversation.id)}
                    />
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </Container>
  )
}
