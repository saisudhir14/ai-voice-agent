import { createFileRoute, Outlet, useNavigate, useRouter } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { ConsoleShell } from '@/console/shell/ConsoleShell'
import type { NavId } from '@/console/shell/Sidebar'
import type { CommandItem } from '@/console/shell/CommandPalette'
import type { Breadcrumb } from '@/console/shell/Topbar'
import { useAuthStore } from '@/stores/authStore'
import '@/console/tokens.css'

export const Route = createFileRoute('/console')({
  component: ConsoleLayout,
})

const NAV_LABELS: Record<NavId, string> = {
  dashboard: 'Dashboard',
  agents: 'Agents',
  live: 'Live Call',
  conversations: 'Conversations',
  analytics: 'Analytics',
  numbers: 'Phone Numbers',
  keys: 'API Keys',
}

const NAV_PATHS: Record<NavId, string> = {
  dashboard: '/console/dashboard',
  agents: '/console/agents',
  live: '/console/live',
  conversations: '/console/conversations',
  analytics: '/console/analytics',
  numbers: '/console/numbers',
  keys: '/console/keys',
}

function ConsoleLayout() {
  const navigate = useNavigate()
  const router = useRouter()
  const { user } = useAuthStore()

  const currentPath = router.state.location.pathname

  const view = useMemo((): NavId => {
    const seg = currentPath.replace('/console/', '').split('/')[0]
    if (seg in NAV_PATHS) return seg as NavId
    return 'dashboard'
  }, [currentPath])

  const breadcrumbs = useMemo((): Breadcrumb[] => [
    { label: 'Lattice', icon: 'logo' },
    { label: NAV_LABELS[view] },
  ], [view])

  const commands = useMemo((): CommandItem[] => (Object.entries(NAV_LABELS) as [NavId, string][]).map(([id, label]) => ({
    id,
    label,
    icon: id === 'dashboard' ? 'dashboard' : id === 'agents' ? 'agents' : id === 'live' ? 'phone' : id === 'conversations' ? 'chat' : id === 'analytics' ? 'chart' : id === 'numbers' ? 'hash' : 'key',
    kind: 'Navigate',
    action: () => navigate({ to: NAV_PATHS[id] as never }),
  })), [navigate])

  const handleNavigate = (id: NavId) => {
    navigate({ to: NAV_PATHS[id] as never })
  }

  return (
    <ConsoleShell
      view={view}
      onNavigate={handleNavigate}
      breadcrumbs={breadcrumbs}
      commands={commands}
      user={user ? { name: user.name } : undefined}
    >
      <Outlet />
    </ConsoleShell>
  )
}
