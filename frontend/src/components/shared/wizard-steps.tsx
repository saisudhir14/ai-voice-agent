import { Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WizardStep {
  id: number
  label: string
}

interface WizardStepsProps {
  steps: WizardStep[]
  current: number
}

export function WizardSteps({ steps, current }: WizardStepsProps) {
  return (
    <nav aria-label="Progress" className="mb-10">
      <ol className="flex items-center gap-2">
        {steps.map((step, i) => {
          const done = current > step.id
          const active = current === step.id
          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                    done && 'bg-brand text-ink-on',
                    active && 'border-2 border-brand bg-brand-tint text-brand-ink',
                    !done && !active && 'border border-line bg-paper text-ink-3',
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : step.id}
                </span>
                <span
                  className={cn(
                    'hidden truncate text-sm font-medium sm:block',
                    active ? 'text-ink' : done ? 'text-ink-2' : 'text-ink-3',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-3" aria-hidden />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
