import { Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Simple spinner
interface SpinnerProps {
  size?: "sm" | "default" | "lg"
  className?: string
}

export function Spinner({ size = "default", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
  }
  
  return (
    <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />
  )
}

// Full page loading
export function PageLoading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

// Card skeleton
export function CardSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  )
}

// Stats card skeleton
export function StatsSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-12" />
        </div>
      </div>
    </Card>
  )
}

// Agent card skeleton
export function AgentCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-5 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-4 w-full" />
      </CardContent>
      <div className="px-6 py-4 border-t flex items-center justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-9" />
        </div>
        <Skeleton className="h-9 w-9" />
      </div>
    </Card>
  )
}

// List item skeleton
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-card">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  )
}
