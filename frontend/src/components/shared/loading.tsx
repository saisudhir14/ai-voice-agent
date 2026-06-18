import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/landing/card'
import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function Spinner({ size = 'default', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <Loader2 className={cn('animate-spin text-brand', sizeClasses[size], className)} />
  )
}

export function PageLoading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

export function CardSkeleton() {
  return (
    <Card padding="md">
      <div className="space-y-2 mb-4">
        <Skeleton className="h-5 w-1/3 bg-paper-3" />
        <Skeleton className="h-4 w-2/3 bg-paper-3" />
      </div>
      <Skeleton className="h-20 w-full bg-paper-3" />
    </Card>
  )
}

export function StatsSkeleton() {
  return (
    <Card padding="md">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 bg-paper-3" />
          <Skeleton className="h-7 w-12 bg-paper-3" />
        </div>
        <Skeleton className="h-11 w-11 rounded-xl bg-paper-3" />
      </div>
    </Card>
  )
}

export function AgentCardSkeleton() {
  return (
    <Card padding="none" elevated>
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-12 w-12 rounded-xl bg-paper-3" />
          <Skeleton className="h-6 w-16 rounded-pill bg-paper-3" />
        </div>
        <Skeleton className="h-5 w-1/2 mb-2 bg-paper-3" />
        <Skeleton className="h-4 w-1/3 mb-2 bg-paper-3" />
        <Skeleton className="h-4 w-full bg-paper-3" />
      </div>
      <div className="px-6 py-4 border-t border-line flex items-center justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-[10px] bg-paper-3" />
          <Skeleton className="h-9 w-9 rounded-[10px] bg-paper-3" />
        </div>
        <Skeleton className="h-9 w-9 rounded-[10px] bg-paper-3" />
      </div>
    </Card>
  )
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="h-10 w-10 rounded-xl bg-paper-3" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3 bg-paper-3" />
        <Skeleton className="h-3 w-1/2 bg-paper-3" />
      </div>
      <Skeleton className="h-6 w-16 rounded-pill bg-paper-3" />
    </div>
  )
}
