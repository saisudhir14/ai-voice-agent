import { createFileRoute } from '@tanstack/react-router'
import { ConversationsScreen } from '@/console/screens'

export const Route = createFileRoute('/console/conversations')({
  component: ConversationsScreen,
})
