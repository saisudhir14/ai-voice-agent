import { createFileRoute } from '@tanstack/react-router'
import { AgentsScreen } from '@/console/screens'

export const Route = createFileRoute('/console/agents')({
  component: AgentsScreen,
})
