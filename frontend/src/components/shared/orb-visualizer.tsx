import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface OrbVisualizerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  /** When true, orb animates more intensely (e.g. while speaking) */
  active?: boolean
}

const SIZE_MAP = {
  sm: 'w-24 h-24',
  md: 'w-48 h-48',
  lg: 'w-52 h-52 sm:w-60 sm:h-60',
} as const

/** Smooth pebble morph — gentle, never jagged */
const IDLE_FORM = [
  '48% 52% 53% 47% / 53% 47% 49% 51%',
  '52% 48% 47% 53% / 47% 53% 51% 49%',
  '49% 51% 52% 48% / 51% 49% 48% 52%',
  '48% 52% 53% 47% / 53% 47% 49% 51%',
]

const ACTIVE_FORM = [
  '45% 55% 56% 44% / 55% 45% 47% 53%',
  '55% 45% 44% 56% / 45% 55% 53% 47%',
  '47% 53% 55% 45% / 52% 48% 45% 55%',
  '50% 50% 52% 48% / 48% 52% 55% 45%',
  '45% 55% 56% 44% / 55% 45% 47% 53%',
]

const RIPPLE_COUNT = 3

export const OrbVisualizer = ({ className, size = 'md', active = false }: OrbVisualizerProps) => {
  const form = active ? ACTIVE_FORM : IDLE_FORM
  const formDuration = active ? 3.2 : 7

  return (
    <div
      className={cn('relative flex items-center justify-center', SIZE_MAP[size], className)}
      role="img"
      aria-label={active ? 'Agent is speaking' : 'Agent is listening'}
    >
      {/* Calm ambient field — morning light through a care room window */}
      <motion.div
        className="orb-aura absolute inset-[-22%]"
        animate={
          active
            ? { scale: [1, 1.1, 1.03, 1.12, 1], opacity: [0.5, 0.75, 0.55, 0.8, 0.5] }
            : { scale: [1, 1.04, 1], opacity: [0.4, 0.55, 0.4] }
        }
        transition={
          active
            ? { duration: 3, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }
            : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
        }
      />

      {/* Gentle voice ripples — water, not radar */}
      {active &&
        Array.from({ length: RIPPLE_COUNT }).map((_, i) => (
          <motion.span
            key={i}
            className="orb-ripple absolute"
            style={{ inset: `${10 + i * 5}%` }}
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: [0.94, 1.22], opacity: [0.35, 0] }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: [0.22, 1, 0.36, 1],
              delay: i * 0.7,
            }}
          />
        ))}

      {/* Outer veil — clear water envelope */}
      <motion.div
        className="orb-veil absolute z-[1]"
        style={{ width: '78%', height: '78%' }}
        animate={{ borderRadius: form, scale: active ? [1, 1.04, 0.99, 1.03, 1] : [1, 1.02, 1] }}
        transition={{
          borderRadius: { duration: formDuration, repeat: Infinity, ease: 'easeInOut' },
          scale: {
            duration: active ? 2.2 : 5,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
      />

      {/* Mid layer — soft sky depth */}
      <motion.div
        className="orb-mid absolute z-[2]"
        style={{ width: '66%', height: '66%' }}
        animate={{
          borderRadius: form,
          scale: active ? [1, 1.05, 0.98, 1.04, 1] : [1, 1.018, 1],
          rotate: active ? [0, 2, -1, 1, 0] : [0, 1, 0],
        }}
        transition={{
          borderRadius: { duration: formDuration, repeat: Infinity, ease: 'easeInOut', delay: 0.15 },
          scale: { duration: active ? 1.9 : 4.8, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: active ? 4 : 10, repeat: Infinity, ease: 'easeInOut' },
        }}
      />

      {/* Luminous core — dawn light center, calm water edges */}
      <motion.div
        className="orb-core relative z-10"
        style={{ width: '54%', height: '54%' }}
        animate={{
          borderRadius: form,
          scale: active ? [1, 1.06, 0.97, 1.05, 1] : [1, 1.02, 1],
        }}
        transition={{
          borderRadius: { duration: formDuration, repeat: Infinity, ease: 'easeInOut', delay: 0.3 },
          scale: {
            duration: active ? 1.6 : 4.2,
            repeat: Infinity,
            ease: [0.45, 0, 0.55, 1],
          },
        }}
      >
        <motion.div
          className="orb-heart absolute inset-0"
          animate={{ opacity: active ? [0.55, 0.9, 0.6, 0.95, 0.55] : [0.4, 0.6, 0.4] }}
          transition={{ duration: active ? 1.4 : 3.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="orb-bloom absolute inset-0"
          animate={{ opacity: active ? [0.35, 0.7, 0.4, 0.75, 0.35] : [0.2, 0.35, 0.2] }}
          transition={{ duration: active ? 1.8 : 4.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="orb-highlight absolute" />
      </motion.div>

      {/* Speaking arcs — soft voice contour, not an equalizer */}
      {active && (
        <svg
          className="orb-voice-arcs absolute inset-0 z-20 overflow-visible"
          viewBox="0 0 100 100"
          aria-hidden
        >
          {[38, 44, 50].map((r, i) => (
            <motion.path
              key={r}
              d={`M ${50 - r * 0.55} 50 Q 50 ${50 - r * 0.35} ${50 + r * 0.55} 50`}
              fill="none"
              strokeWidth="1.2"
              className="orb-arc-stroke"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0.2, 1, 0.2],
                opacity: [0.15, 0.55, 0.15],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.35,
              }}
            />
          ))}
        </svg>
      )}
    </div>
  )
}
