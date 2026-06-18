import React from 'react'
import { cn } from '@/lib/utils'

interface SpotlightCardProps {
  children: React.ReactNode
  className?: string
  containerClassName?: string
}

export const SpotlightCard = ({
  children,
  className,
  containerClassName,
}: SpotlightCardProps) => {
  return (
    <div
      className={cn(
        "group relative flex size-full rounded-xl bg-white/[0.03] border border-white/[0.06] transition-colors hover:bg-white/[0.05] hover:border-white/[0.1]",
        containerClassName
      )}
    >
      <div
        className={cn(
          "relative flex size-full flex-col overflow-hidden rounded-xl p-6",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}
