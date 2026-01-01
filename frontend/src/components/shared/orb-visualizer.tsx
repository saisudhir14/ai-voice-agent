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
      {/* Outer Glow - GPU accelerated */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/20 blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ 
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
        }}
      />
      
      {/* Dynamic Rings - GPU accelerated */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 border border-primary/30 rounded-full"
          animate={{
            rotate: 360,
            scale: [1, 1.05 + i * 0.05, 1],
          }}
          transition={{
            rotate: {
              duration: 10 + i * 5,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }
          }}
          style={{ 
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        />
      ))}

      {/* Core Orb - GPU accelerated */}
      <motion.div
        className="relative w-3/4 h-3/4 bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600 rounded-full shadow-[0_0_50px_rgba(100,116,139,0.5)] overflow-hidden"
        animate={{
          borderRadius: [
            "42% 58% 70% 30% / 45% 45% 55% 55%",
            "70% 30% 46% 54% / 30% 29% 71% 70%",
            "100% 60% 60% 100% / 100% 100% 60% 60%",
            "42% 58% 70% 30% / 45% 45% 55% 55%",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          willChange: 'border-radius',
          transform: 'translateZ(0)',
        }}
      >
        {/* Inner Shimmer */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </div>
  )
}
