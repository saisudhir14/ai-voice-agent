import React from 'react'
import { cn } from '@/lib/utils'
import { Card as MkCard } from '@/components/landing/card'

interface SpotlightCardProps {
  children: React.ReactNode
  className?: string
  containerClassName?: string
  elevated?: boolean
  interactive?: boolean
}

export const SpotlightCard = ({
  children,
  className,
  containerClassName,
  elevated = true,
  interactive = false,
}: SpotlightCardProps) => {
  return (
    <MkCard
      elevated={elevated}
      interactive={interactive}
      padding="none"
      className={cn('flex size-full flex-col', containerClassName)}
    >
      <div className={cn('flex size-full flex-col p-6 sm:p-7', className)}>
        {children}
      </div>
    </MkCard>
  )
}
