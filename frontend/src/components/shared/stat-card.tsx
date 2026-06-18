import { LucideIcon } from 'lucide-react'
import { Card } from '@/components/landing/card'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
}

export function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
  return (
    <Card elevated padding="md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink-3 mb-1">{label}</p>
          <h3 className="text-2xl font-display font-semibold text-ink tracking-tight tab-nums">{value}</h3>
          {trend && (
            <p className="text-xs text-ink-3 mt-1 flex items-center gap-1">
              <span className="text-brand">↑</span> {trend}
            </p>
          )}
        </div>
        <div className="h-11 w-11 rounded-xl bg-brand-tint flex items-center justify-center">
          <Icon className="h-5 w-5 text-brand-ink" />
        </div>
      </div>
    </Card>
  )
}
