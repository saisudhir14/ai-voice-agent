import { LucideIcon } from 'lucide-react'
import { Card } from '@/components/landing/card'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card tone="paper-2" elevated className="text-center">
      <div className="flex flex-col items-center justify-center py-10">
        <div className="rounded-xl bg-brand-tint p-4 mb-4">
          <Icon className="h-8 w-8 text-brand-ink" />
        </div>
        <h3 className="font-display text-lg font-semibold text-ink mb-1">{title}</h3>
        {description && (
          <p className="text-ink-3 text-sm mb-4 max-w-sm">{description}</p>
        )}
        {action}
      </div>
    </Card>
  )
}
