import { createFileRoute } from '@tanstack/react-router'
import { NumbersScreen } from '@/console/screens'

export const Route = createFileRoute('/console/numbers')({
  component: NumbersScreen,
})
