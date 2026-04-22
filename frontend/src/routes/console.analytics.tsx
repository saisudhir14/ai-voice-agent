import { createFileRoute } from '@tanstack/react-router'
import { AnalyticsScreen } from '@/console/screens'

export const Route = createFileRoute('/console/analytics')({
  component: AnalyticsScreen,
})
