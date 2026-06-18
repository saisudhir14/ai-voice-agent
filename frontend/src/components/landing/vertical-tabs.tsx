import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HeartPulse, Landmark, ShoppingBag, Hotel, Truck, ArrowRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

type Vertical = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  eyebrow: string
  headline: string
  blurb: string
  bullets: string[]
  ctaLabel: string
  ctaTo?: string
  ctaHref?: string
  highlightMetric: { value: string; label: string }
  transcript: { role: 'agent' | 'caller'; text: string }[]
}

const verticals: Vertical[] = [
  {
    id: 'healthcare',
    label: 'Healthcare',
    icon: HeartPulse,
    eyebrow: 'Healthcare & life sciences',
    headline: 'Reach every patient between visits — without adding headcount.',
    blurb:
      'Pre-visit screening, post-discharge follow-up, medication adherence, and patient-reported outcomes — all over the phone, in natural conversation, with full HIPAA controls.',
    bullets: [
      'Pre-treatment symptom check-ins with clinical escalation',
      '24–72h post-discharge follow-up to reduce readmissions',
      'Medication adherence outreach and refill confirmation',
      'KDQOL / PROM survey capture at 100% coverage',
    ],
    ctaLabel: 'See kidney care use case',
    ctaTo: '/solutions/kidney-care',
    highlightMetric: { value: '38%', label: 'fewer missed appointments' },
    transcript: [
      { role: 'agent', text: 'Hi Mr. Chen, this is Maya from your care team — just a quick check-in before tomorrow’s treatment. How are you feeling today?' },
      { role: 'caller', text: 'A little short of breath actually.' },
      { role: 'agent', text: 'I’m sorry to hear that. Have you noticed any weight gain or swelling in the last 48 hours?' },
      { role: 'caller', text: 'Yeah, maybe four pounds.' },
      { role: 'agent', text: 'Got it — I’m flagging this for your nurse now. She’ll call you back within 15 minutes.' },
    ],
  },
  {
    id: 'financial-services',
    label: 'Financial Services',
    icon: Landmark,
    eyebrow: 'Banks, credit unions, fintech',
    headline: 'Handle 80% of inbound calls without a human on the line.',
    blurb:
      'Card activation, balance inquiries, fraud verification, payment reminders, and collections — fully authenticated and audit-logged.',
    bullets: [
      'Instant card activation and PIN reset',
      'Outbound fraud verification with step-up auth',
      'Compliant collections workflows with disposition logging',
      'Loan application status and document collection',
    ],
    ctaLabel: 'Explore financial services',
    ctaHref: '#',
    highlightMetric: { value: '62%', label: 'call deflection from live agents' },
    transcript: [
      { role: 'agent', text: 'Hi, this is Riley from First Federal. We flagged a charge for $487 in Miami — was that you?' },
      { role: 'caller', text: 'No, that was not me.' },
      { role: 'agent', text: 'Understood — I’m locking the card now. A replacement will arrive in two business days.' },
    ],
  },
  {
    id: 'retail',
    label: 'Retail & E-commerce',
    icon: ShoppingBag,
    eyebrow: 'Retail, DTC, marketplaces',
    headline: 'Convert browsers, recover carts, and resolve orders on a call.',
    blurb:
      'Order status, returns, abandoned-cart recovery, loyalty enrollment, and personalized upsell — all backed by your product catalog.',
    bullets: [
      'Order tracking and returns initiation',
      'Abandoned-cart outbound recovery',
      'Personalized product recommendations via RAG',
      'Loyalty enrollment and reward redemption',
    ],
    ctaLabel: 'Explore retail',
    ctaHref: '#',
    highlightMetric: { value: '4.2×', label: 'ROI on cart-recovery campaigns' },
    transcript: [
      { role: 'agent', text: 'Hi Anna! This is Casey — I noticed you left the linen-blend dress in your cart. Should I size it down and apply 15% off?' },
      { role: 'caller', text: 'Sure, do the small.' },
      { role: 'agent', text: 'Done — shipping to the address on file. You’ll have it Thursday.' },
    ],
  },
  {
    id: 'hospitality',
    label: 'Hospitality',
    icon: Hotel,
    eyebrow: 'Hotels, restaurants, travel',
    headline: 'A front desk that never sleeps.',
    blurb:
      'Reservations, modifications, concierge requests, late check-ins, and post-stay surveys — 24/7, in any language.',
    bullets: [
      'Reservation booking and modification',
      'Multilingual concierge and local recommendations',
      'Group block management and event inquiries',
      'Post-stay NPS and review capture',
    ],
    ctaLabel: 'Explore hospitality',
    ctaHref: '#',
    highlightMetric: { value: '24/7', label: 'multilingual coverage' },
    transcript: [
      { role: 'agent', text: 'Bonjour, this is Sam from Maison Lyon. Comment puis-je vous aider?' },
      { role: 'caller', text: 'Can you switch to English? I’d like to extend my stay through Sunday.' },
      { role: 'agent', text: 'Of course. Extending through Sunday — same room, $329/night. Confirming now.' },
    ],
  },
  {
    id: 'logistics',
    label: 'Logistics',
    icon: Truck,
    eyebrow: 'Last mile, dispatch, supply chain',
    headline: 'Dispatch and driver communication, automated.',
    blurb:
      'Pickup confirmations, ETA updates, delivery exceptions, and driver check-ins — without tying up dispatchers on the phone.',
    bullets: [
      'Outbound ETA updates and reschedule offers',
      'Driver check-in and route compliance calls',
      'Exception handling (failed delivery, address change)',
      'B2B carrier dispatch and tendering',
    ],
    ctaLabel: 'Explore logistics',
    ctaHref: '#',
    highlightMetric: { value: '11 min', label: 'avg dispatcher time saved per route' },
    transcript: [
      { role: 'agent', text: 'Hi, this is Jordan from FastLine. Your delivery is running 25 minutes late — want the 4–6 window instead?' },
      { role: 'caller', text: 'Yeah, that’s better.' },
      { role: 'agent', text: 'Done. The driver is notified. You’ll get a text when they’re 10 minutes out.' },
    ],
  },
]

export function VerticalTabs() {
  const [activeId, setActiveId] = useState(verticals[0].id)
  const active = verticals.find((v) => v.id === activeId) ?? verticals[0]

  return (
    <div>
      {/* Tab strip */}
      <div
        className="scrollbar-none -mx-5 mb-8 flex gap-1 overflow-x-auto px-5 sm:mx-0 sm:justify-center sm:px-0"
        role="tablist"
        aria-label="Industries"
      >
        {verticals.map((v) => {
          const Icon = v.icon
          const isActive = v.id === activeId
          return (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(v.id)}
              className={cn(
                'relative inline-flex shrink-0 items-center gap-2 rounded-pill px-4 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'text-ink' : 'text-ink-3 hover:text-ink-2',
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="vertical-tab-pill"
                  className="absolute inset-0 -z-10 rounded-pill bg-paper-3"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="h-4 w-4" />
              {v.label}
            </button>
          )
        })}
      </div>

      {/* Active panel */}
      <div className="overflow-hidden rounded-xl2 border border-line bg-paper p-6 shadow-mk-sm sm:p-8 md:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-12"
          >
            <div>
              <div className="text-eyebrow uppercase text-brand-ink">{active.eyebrow}</div>
              <h3 className="mt-3 font-display text-display-sm text-ink sm:text-display-md">{active.headline}</h3>
              <p className="mt-4 text-base leading-relaxed text-ink-2">{active.blurb}</p>

              <ul className="mt-6 space-y-3">
                {active.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-ink-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-6">
                {active.ctaTo ? (
                  <Link
                    to={active.ctaTo}
                    className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink hover:text-brand"
                  >
                    {active.ctaLabel}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : (
                  <a
                    href={active.ctaHref ?? '#'}
                    className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink hover:text-brand"
                  >
                    {active.ctaLabel}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-display-sm text-ink">{active.highlightMetric.value}</span>
                  <span className="text-xs text-ink-3">{active.highlightMetric.label}</span>
                </div>
              </div>
            </div>

            {/* Mock transcript */}
            <div className="rounded-card border border-line bg-paper-2 p-5">
              <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-line-2" />
                  <span className="h-2 w-2 rounded-full bg-line-2" />
                  <span className="h-2 w-2 rounded-full bg-line-2" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">Live transcript</span>
              </div>
              <div className="space-y-3">
                {active.transcript.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    className={cn(
                      'rounded-[10px] px-3.5 py-2.5 text-sm leading-relaxed',
                      line.role === 'agent' ? 'bg-brand-tint text-ink' : 'border border-line bg-paper text-ink-2',
                    )}
                  >
                    <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-3">
                      {line.role === 'agent' ? 'Agent' : 'Caller'}
                    </div>
                    {line.text}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
