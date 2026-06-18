import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface OrbVisualizerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const OrbVisualizer = ({ className, size = 'md' }: OrbVisualizerProps) => {
  const sizes = {
    sm: 'w-24 h-24',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  }

  return (
    <div className={cn("relative flex items-center justify-center", sizes[size], className)}>
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-blue-500/10 blur-2xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
      />

      {/* Concentric rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 border border-blue-400/10 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 20 + i * 10, repeat: Infinity, ease: "linear" }}
          style={{
            inset: `${-8 - i * 12}px`,
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        />
      ))}

      {/* Core sphere */}
      <motion.div
        className="relative w-3/4 h-3/4 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 rounded-full shadow-[0_0_40px_rgba(59,130,246,0.15)] overflow-hidden"
        animate={{
          borderRadius: [
            "42% 58% 70% 30% / 45% 45% 55% 55%",
            "60% 40% 50% 50% / 40% 55% 45% 60%",
            "42% 58% 70% 30% / 45% 45% 55% 55%",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ willChange: 'border-radius', transform: 'translateZ(0)' }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.div>
    </div>
  )
}
