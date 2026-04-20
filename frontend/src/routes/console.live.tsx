import { createFileRoute } from '@tanstack/react-router'
import { LiveCallScreen } from '@/console/screens'

export const Route = createFileRoute('/console/live')({
  component: LiveCallScreen,
})
