import React from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
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
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      className={cn(
        "group relative flex size-full rounded-[var(--radius)] bg-white/[0.03] transition-colors hover:bg-white/[0.05]",
        containerClassName
      )}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[var(--radius)] opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(148, 163, 184, 0.15),
              transparent 80%
            )
          `,
          willChange: 'opacity',
          transform: 'translateZ(0)', // GPU acceleration
        }}
      />
      <div
        className={cn(
          "relative flex size-full flex-col overflow-hidden rounded-[var(--radius)] border border-white/[0.08] p-6",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}
