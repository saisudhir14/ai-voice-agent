import { Check, X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatedSection } from '@/components/shared'

type State = 'no' | 'limited' | 'yes'
type ColumnKey = 'ivr' | 'iva' | 'ours'

type Row = {
  trait: string
  ivr: State
  iva: State
  ours: State
}

const rows: Row[] = [
  { trait: 'Natural, multi-turn conversation', ivr: 'no', iva: 'limited', ours: 'yes' },
  { trait: 'Handles unexpected questions gracefully', ivr: 'no', iva: 'no', ours: 'yes' },
  { trait: 'Sub-second response latency', ivr: 'yes', iva: 'limited', ours: 'yes' },
  { trait: 'Setup measured in days, not months', ivr: 'no', iva: 'no', ours: 'yes' },
  { trait: 'Real-time actions (book, look up, transfer)', ivr: 'no', iva: 'limited', ours: 'yes' },
  { trait: 'Sounds genuinely human', ivr: 'no', iva: 'no', ours: 'yes' },
]

const stateLabel: Record<State, string> = { no: 'No', limited: 'Limited', yes: 'Yes' }

const Cell = ({ state, onDark }: { state: State; onDark?: boolean }) => {
  const label = stateLabel[state]
  if (state === 'yes') {
    return (
      <span
        className={cn(
          'inline-flex h-6 w-6 items-center justify-center rounded-full',
          onDark ? 'bg-white/15 text-ink-on' : 'bg-brand-tint text-brand-ink',
        )}
      >
        <Check className="h-3.5 w-3.5" />
        <span className="sr-only">{label}</span>
      </span>
    )
  }
  if (state === 'limited') {
    return (
      <span
        className={cn(
          'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
          onDark ? 'bg-white/10 text-ink-on/70' : 'bg-paper-3 text-ink-3',
        )}
      >
        ~<span className="sr-only">{label}</span>
      </span>
    )
  }
  return (
    <span
      className={cn(
        'inline-flex h-6 w-6 items-center justify-center rounded-full',
        onDark ? 'bg-white/5 text-ink-on/40' : 'bg-paper-2 text-ink-3/60',
      )}
    >
      <X className="h-3.5 w-3.5" />
      <span className="sr-only">{label}</span>
    </span>
  )
}

interface ColumnProps {
  generation: string
  title: string
  subtitle: string
  highlighted?: boolean
  rowKey: ColumnKey
  index: number
}

const Column = ({ generation, title, subtitle, highlighted, rowKey, index }: ColumnProps) => (
  <AnimatedSection delay={0.05 * index}>
    <div
      className={cn(
        'relative flex h-full flex-col rounded-card p-6 sm:p-8',
        highlighted ? 'bg-ink-surface text-ink-on shadow-mk-lg' : 'border border-line bg-paper',
      )}
    >
      {highlighted && (
        <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-pill bg-brand px-3 py-1 text-xs font-semibold text-ink-on">
          <Sparkles className="h-3 w-3" />
          Our approach
        </div>
      )}
      <div className="mb-6">
        <div className={cn('text-eyebrow uppercase', highlighted ? 'text-brand-tint' : 'text-brand-ink')}>
          {generation}
        </div>
        <h3 className={cn('mt-2 font-display text-display-sm', highlighted ? 'text-ink-on' : 'text-ink')}>{title}</h3>
        <p className={cn('mt-2 text-sm leading-relaxed', highlighted ? 'text-ink-on/70' : 'text-ink-2')}>
          {subtitle}
        </p>
      </div>
      <ul className={cn('mt-auto space-y-3 border-t pt-5', highlighted ? 'border-white/10' : 'border-line')}>
        {rows.map((row) => (
          <li key={row.trait} className="flex items-center justify-between gap-3">
            <span className={cn('text-sm leading-snug', highlighted ? 'text-ink-on/85' : 'text-ink-2')}>
              {row.trait}
            </span>
            <Cell state={row[rowKey]} onDark={highlighted} />
          </li>
        ))}
      </ul>
    </div>
  </AnimatedSection>
)

export function ComparisonGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Column
        generation="Gen 1"
        title="Touch-tone IVR"
        subtitle="Press 1 for billing. Press 2 for support. Press 0 to give up."
        rowKey="ivr"
        index={0}
      />
      <Column
        generation="Gen 2"
        title="NLP voice bot (IVA)"
        subtitle="Better than IVR, but rigid intent trees and silent failures on edge cases."
        rowKey="iva"
        index={1}
      />
      <Column
        generation="Gen 3"
        title="LLM-native voice agent"
        subtitle="A real conversation. Reasons in context, takes action, escalates intelligently."
        highlighted
        rowKey="ours"
        index={2}
      />
    </div>
  )
}
