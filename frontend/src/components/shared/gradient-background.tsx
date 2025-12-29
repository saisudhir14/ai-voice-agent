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
    low: 'opacity-10',
    medium: 'opacity-20',
    high: 'opacity-40',
  }[intensity]

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Dynamic Animated Blobs - GPU accelerated */}
      <motion.div
        className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500 rounded-full blur-[120px] ${opacity}`}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ 
          willChange: 'transform',
          transform: 'translateZ(0)', // Force GPU acceleration
        }}
      />
      
      <motion.div
        className={`absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-orange-500 rounded-full blur-[120px] ${opacity}`}
        animate={{
          x: [0, -40, 0],
          y: [0, -20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ 
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />

      <motion.div
        className={`absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-amber-400 rounded-full blur-[100px] ${opacity}`}
        animate={{
          x: [0, 30, 0],
          y: [0, 60, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ 
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />

      {/* Grid Overlay for futuristic look */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} 
      />
      
      {/* Gradient Mask to fade out the grid */}
      <div className="absolute inset-0 bg-gradient-to-b from-nebula-deep via-transparent to-nebula-deep" />
    </div>
  )
}