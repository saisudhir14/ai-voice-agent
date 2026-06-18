import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Check, Stethoscope, CalendarClock, UserCheck, ClipboardList, HeartPulse, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MkButton } from './mk-button'

interface UseCase {
  id: string
  label: string
  agentName: string
  intro: string
  icon: React.ComponentType<{ className?: string }>
}

const useCases: UseCase[] = [
  {
    id: 'care-coordinator',
    label: 'Care Coordinator',
    agentName: 'Maya',
    intro: 'Hi, this is Maya calling from your care team. Just checking in before your next visit — got a minute?',
    icon: Stethoscope,
  },
  {
    id: 'appointment',
    label: 'Appointment Setter',
    agentName: 'Ava',
    intro: 'Hi, this is Ava. I’m calling to confirm your appointment for tomorrow at 10am — does that still work?',
    icon: CalendarClock,
  },
  {
    id: 'lead-qual',
    label: 'Lead Qualification',
    agentName: 'Riley',
    intro: 'Hi, this is Riley. You requested some info on our platform — would you have a minute to chat?',
    icon: UserCheck,
  },
  {
    id: 'survey',
    label: 'Patient Survey',
    agentName: 'Sam',
    intro: 'Hi, this is Sam — I’m calling to ask a few quick questions about your recent treatment, takes about 3 minutes.',
    icon: ClipboardList,
  },
  {
    id: 'triage',
    label: 'After-Hours Triage',
    agentName: 'Jordan',
    intro: 'Hi, this is Jordan from your nurse line. I’ll ask a couple of questions and route you appropriately.',
    icon: HeartPulse,
  },
  {
    id: 'retail',
    label: 'Retail Concierge',
    agentName: 'Casey',
    intro: 'Hi, this is Casey — happy to help you find what you’re looking for and get it shipped today.',
    icon: ShoppingBag,
  },
]

const inputClasses =
  'h-11 w-full rounded-[10px] border border-line bg-paper px-3.5 text-sm text-ink placeholder:text-ink-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mk-brand-ring)] focus-visible:border-brand'

export function LiveDemoWidget() {
  const [activeId, setActiveId] = useState(useCases[0].id)
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const active = useCases.find((u) => u.id === activeId) ?? useCases[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) return
    setSubmitted(true)
  }

  return (
    <div className="overflow-hidden rounded-xl2 border border-line bg-paper shadow-mk-md">
      <div className="grid lg:grid-cols-[1.05fr_1fr]">
        {/* Use-case picker */}
        <div className="border-b border-line p-7 sm:p-8 lg:border-b-0 lg:border-r">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-eyebrow uppercase text-emerald-600">Live demo</span>
          </div>
          <h3 className="font-display text-display-sm text-ink">Hear it. Then decide.</h3>
          <p className="mb-6 mt-2 text-sm leading-relaxed text-ink-2">
            Pick a use case and we’ll have an agent call you in seconds. No signup required.
          </p>

          <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Demo use cases">
            {useCases.map((uc) => {
              const Icon = uc.icon
              const isActive = uc.id === activeId
              return (
                <button
                  key={uc.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setActiveId(uc.id)
                    setSubmitted(false)
                  }}
                  className={cn(
                    'group flex items-start gap-2.5 rounded-[10px] border p-3 text-left transition-colors',
                    isActive
                      ? 'border-brand bg-brand-tint'
                      : 'border-line bg-paper hover:border-line-2 hover:bg-paper-2',
                  )}
                >
                  <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', isActive ? 'text-brand-ink' : 'text-ink-3')} />
                  <span className={cn('text-xs font-medium leading-tight', isActive ? 'text-brand-ink' : 'text-ink-2')}>
                    {uc.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Form / Confirmation */}
        <div className="relative flex flex-col justify-between p-7 sm:p-8">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
                className="flex h-full flex-col"
              >
                <div className="mb-5 rounded-[10px] border border-line bg-paper-2 p-4">
                  <div className="mb-1 text-eyebrow uppercase text-ink-3">Sample opener — {active.agentName}</div>
                  <p className="text-sm leading-relaxed text-ink">“{active.intro}”</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="demo-name" className="mb-1.5 block text-xs font-medium text-ink-2">
                      Your name
                    </label>
                    <input
                      id="demo-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="First name"
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label htmlFor="demo-phone" className="mb-1.5 block text-xs font-medium text-ink-2">
                      Phone number
                    </label>
                    <input
                      id="demo-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      type="tel"
                      required
                      className={inputClasses}
                    />
                  </div>
                </div>

                <MkButton type="submit" size="lg" className="mt-6 w-full">
                  <Phone className="h-4 w-4" />
                  Call me now
                </MkButton>
                <p className="mt-3 text-xs leading-relaxed text-ink-3">
                  By submitting, you agree to receive a one-time demo call. US/CA only.
                </p>
              </motion.form>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex h-full flex-col items-center justify-center text-center"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="font-display text-lg font-semibold text-ink">Calling {name || 'you'} now…</h4>
                <p className="mt-1 text-sm text-ink-2">{active.agentName} will be on the line in a few seconds.</p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-eyebrow uppercase text-ink-3 transition-colors hover:text-ink"
                >
                  Try another use case
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
