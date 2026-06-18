import { Gauge, Waves, MessagesSquare } from 'lucide-react'
import { AnimatedSection } from '@/components/shared'
import { Card } from './card'

const highlights = [
  {
    icon: Gauge,
    stat: '~520ms',
    title: 'End-to-end latency',
    body: 'From silence-detection to first audio byte, our pipeline measures under 600ms median — the threshold where humans stop noticing a delay.',
  },
  {
    icon: Waves,
    stat: '50+ voices',
    title: 'Production-grade voice',
    body: 'Cartesia neural voices in 30+ languages, with prosody, pacing, and emotional shading that holds up over multi-minute conversations.',
  },
  {
    icon: MessagesSquare,
    stat: '94%',
    title: 'Turn-taking accuracy',
    body: 'A proprietary endpointing model knows when the caller has finished a thought, when to back-channel, and when to interrupt politely.',
  },
]

export function HighlightBlocks() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {highlights.map((h, i) => (
        <AnimatedSection key={h.title} delay={0.08 * i}>
          <Card padding="lg" interactive className="h-full">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-tint text-brand-ink">
              <h.icon className="h-5 w-5" />
            </span>
            <div className="mt-6 font-display text-display-sm text-ink">{h.stat}</div>
            <div className="mt-1 text-sm font-medium text-ink">{h.title}</div>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">{h.body}</p>
          </Card>
        </AnimatedSection>
      ))}
    </div>
  )
}
