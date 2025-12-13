import { motion } from 'framer-motion'

interface GradientBackgroundProps {
  className?: string
  intensity?: 'low' | 'medium' | 'high'
}

export function GradientBackground({
  className = '',
  intensity = 'medium',
}: GradientBackgroundProps) {
  const opacity = {
    low: 'opacity-20',
    medium: 'opacity-30',
    high: 'opacity-50',
  }[intensity]

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Animated gradient orbs */}
      <motion.div
        className={`absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl ${opacity}`}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className={`absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl ${opacity}`}
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Base gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
    </div>
  )
}
