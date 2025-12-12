import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { conversationsApi } from '@/lib/api'
import { MessageSquare, Clock, Bot, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDate, formatDuration } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
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
    } catch (error) {
      console.error('Failed to delete conversation:', error)
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
        prev.map((c) => (c.id === id ? fullConversation : c))
      )
      setExpandedId(id)
    } catch (error) {
      console.error('Failed to fetch conversation:', error)
      toast.error('Failed to load conversation details')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-9 w-48 bg-muted rounded animate-pulse mb-2" />
          <div className="h-5 w-80 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <ListItemSkeleton />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader
        title="Conversations"
        description="View and manage voice conversation history"
      />

      {conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Start a voice session with one of your agents to see conversations here"
        />
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <Card key={conversation.id} className="overflow-hidden">
              {/* Header */}
              <button
                onClick={() => handleExpand(conversation.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{conversation.agent?.name || 'Unknown Agent'}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{formatDate(conversation.started_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{formatDuration(conversation.duration_secs)}</span>
                  </div>
                  {conversation.sentiment && (
                    <Badge
                      variant={
                        conversation.sentiment === 'positive' ? 'success' :
                        conversation.sentiment === 'negative' ? 'destructive' : 'secondary'
                      }
                    >
                      {conversation.sentiment}
                    </Badge>
                  )}
                  {expandedId === conversation.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {expandedId === conversation.id && (
                <div className="border-t">
                  {/* Messages */}
                  <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                    {conversation.messages?.length > 0 ? (
                      conversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn("flex", message.role === 'user' ? 'justify-end' : 'justify-start')}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] rounded-2xl px-4 py-3",
                              message.role === 'user'
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No messages recorded</p>
                    )}
                  </div>

                  {/* Summary & Actions */}
                  <div className="px-6 py-4 bg-muted/30 border-t flex items-center justify-between">
                    {conversation.summary && (
                      <p className="text-muted-foreground text-sm">Summary: {conversation.summary}</p>
                    )}
                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      }
                      title="Delete Conversation"
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
    </div>
  )
}
