import { createFileRoute } from '@tanstack/react-router'
import { ApiKeysScreen } from '@/console/screens'

export const Route = createFileRoute('/console/keys')({
  component: ApiKeysScreen,
})
