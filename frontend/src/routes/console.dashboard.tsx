import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { DashboardScreen } from '@/console/screens'
import type { NavId } from '@/console/shell/Sidebar'

export const Route = createFileRoute('/console/dashboard')({
  component: ConsoleDashboard,
})

function ConsoleDashboard() {
  const navigate = useNavigate()
  const handleNavigate = (id: NavId) => {
    const paths: Record<NavId, string> = {
      dashboard: '/console/dashboard', agents: '/console/agents', live: '/console/live',
      conversations: '/console/conversations', analytics: '/console/analytics',
      numbers: '/console/numbers', keys: '/console/keys',
    }
    navigate({ to: paths[id] as never })
  }
  return <DashboardScreen onNavigate={handleNavigate} />
}
