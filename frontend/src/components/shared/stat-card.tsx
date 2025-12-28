import { LucideIcon } from 'lucide-react'
import { SpotlightCard } from './spotlight-card'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
}

export function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
  return (
    <SpotlightCard>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
          {trend && (
            <p className="text-xs text-cyan-400 mt-1 flex items-center gap-1">
              <span>↑</span> {trend}
            </p>
          )}
        </div>
        <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
          <Icon className="h-6 w-6 text-cyan-400" />
        </div>
      </div>
    </SpotlightCard>
  )
}