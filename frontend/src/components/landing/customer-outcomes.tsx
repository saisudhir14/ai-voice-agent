import { AnimatedSection } from '@/components/shared'
import { Quote } from 'lucide-react'
import { Card } from './card'

type Outcome = {
  metric: string
  metricLabel: string
  story: string
  attribution: string
  industry: string
}

const defaultOutcomes: Outcome[] = [
  {
    metric: '38%',
    metricLabel: 'fewer no-shows',
    story:
      'A regional dialysis network deployed our pre-treatment check-in agent across 42 centers. Missed treatments fell 38% in the first quarter, and the on-call nurse line dropped by half.',
    attribution: 'Chief Medical Officer · Kidney care network',
    industry: 'Healthcare',
  },
  {
    metric: '62%',
    metricLabel: 'call deflection',
    story:
      'A top-10 credit union routed all card-activation, fraud-verification, and balance inquiries to our agent. 62% of inbound calls resolve without a human, with a 4.7/5 caller satisfaction score.',
    attribution: 'VP Contact Center · National credit union',
    industry: 'Financial Services',
  },
  {
    metric: '$2.1M',
    metricLabel: 'recovered ARR',
    story:
      'A DTC commerce brand turned on outbound cart-recovery calls during peak season. The agent recovered $2.1M in revenue in 90 days at a fully-loaded cost of $0.41 per attempted call.',
    attribution: 'Head of Growth · Apparel DTC',
    industry: 'Retail',
  },
]

interface CustomerOutcomesProps {
  outcomes?: Outcome[]
}

export function CustomerOutcomes({ outcomes = defaultOutcomes }: CustomerOutcomesProps) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {outcomes.map((o, i) => (
        <AnimatedSection key={o.attribution} delay={0.08 * i}>
          <Card as="article" padding="lg" interactive className="flex h-full flex-col">
            <div className="flex items-center justify-between">
              <span className="text-eyebrow uppercase text-ink-3">{o.industry}</span>
              <Quote className="h-5 w-5 text-line-2" />
            </div>
            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-display-md text-ink">{o.metric}</span>
              <span className="text-sm text-ink-2">{o.metricLabel}</span>
            </div>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-2">{o.story}</p>
            <div className="mt-6 border-t border-line pt-4 text-xs text-ink-3">{o.attribution}</div>
          </Card>
        </AnimatedSection>
      ))}
    </div>
  )
}
