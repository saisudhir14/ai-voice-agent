import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, HeartPulse, Landmark, ShoppingBag, Hotel, Truck } from 'lucide-react'
import { AnimatedSection } from '@/components/shared'
import { Section, Container, Display, Lede, Eyebrow, Card, MkBadge } from '@/components/landing'

export const Route = createFileRoute('/solutions/')({
  component: SolutionsIndex,
})

type VerticalCard = {
  icon: React.ComponentType<{ className?: string }>
  industry: string
  title: string
  blurb: string
  metric: string
  metricLabel: string
  to?: string
  href?: string
  comingSoon?: boolean
}

const verticals: VerticalCard[] = [
  {
    icon: HeartPulse,
    industry: 'Healthcare',
    title: 'Kidney care',
    blurb:
      'Pre-treatment check-ins, missed-treatment outreach, post-discharge follow-up, refill reminders, transportation, KDQOL surveys.',
    metric: '38%',
    metricLabel: 'fewer missed treatments',
    to: '/solutions/kidney-care',
  },
  {
    icon: Landmark,
    industry: 'Financial services',
    title: 'Banks & credit unions',
    blurb:
      'Card activation, fraud verification, collections, balance inquiries, loan status — fully authenticated and audit-logged.',
    metric: '62%',
    metricLabel: 'call deflection',
    href: '#',
    comingSoon: true,
  },
  {
    icon: ShoppingBag,
    industry: 'Retail',
    title: 'E-commerce & DTC',
    blurb: 'Order status, returns, abandoned-cart recovery, loyalty enrollment, and personalized upsell.',
    metric: '4.2×',
    metricLabel: 'ROI on cart recovery',
    href: '#',
    comingSoon: true,
  },
  {
    icon: Hotel,
    industry: 'Hospitality',
    title: 'Hotels & travel',
    blurb: 'Reservations, modifications, multilingual concierge, late check-in, and post-stay surveys — 24/7.',
    metric: '24/7',
    metricLabel: 'multilingual coverage',
    href: '#',
    comingSoon: true,
  },
  {
    icon: Truck,
    industry: 'Logistics',
    title: 'Last-mile & dispatch',
    blurb: 'Pickup confirmation, ETA updates, exception handling, driver check-in, and B2B carrier tendering.',
    metric: '11 min',
    metricLabel: 'saved per route',
    href: '#',
    comingSoon: true,
  },
]

function SolutionsIndex() {
  return (
    <>
      <Section tone="paper" spacing="compact" className="pt-28 sm:pt-32">
        <Container size="narrow" className="flex flex-col items-center text-center">
          <AnimatedSection delay={0.05}>
            <Eyebrow>Solutions</Eyebrow>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <Display as="h1" size="xl" className="mt-5">
              One platform. Every industry.
            </Display>
          </AnimatedSection>
          <AnimatedSection delay={0.15}>
            <Lede className="mt-6 max-w-2xl">
              Pick an industry to see purpose-built workflows, customer outcomes, and pilot blueprints. Every solution
              shares the same platform — and the same compliance posture.
            </Lede>
          </AnimatedSection>
        </Container>
      </Section>

      <Section tone="paper" spacing="default" className="!pt-4">
        <Container>
          <div className="grid gap-5 md:grid-cols-2">
            {verticals.map((v, i) => {
              const inner = (
                <Card as="article" interactive padding="lg" className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-tint text-brand-ink">
                      <v.icon className="h-5 w-5" />
                    </span>
                    {v.comingSoon && <MkBadge variant="outline">Coming soon</MkBadge>}
                  </div>
                  <div className="mt-6 text-eyebrow uppercase text-ink-3">{v.industry}</div>
                  <h2 className="mt-2 font-display text-display-sm text-ink">{v.title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-2">{v.blurb}</p>
                  <div className="mt-6 flex items-end justify-between gap-4 border-t border-line pt-5">
                    <div>
                      <div className="font-display text-display-sm text-ink">{v.metric}</div>
                      <div className="text-xs text-ink-3">{v.metricLabel}</div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink">
                      Explore
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Card>
              )
              return (
                <AnimatedSection key={v.title} delay={0.05 * i}>
                  {v.to ? (
                    <Link to={v.to} className="block h-full">
                      {inner}
                    </Link>
                  ) : (
                    <a href={v.href ?? '#'} className="block h-full">
                      {inner}
                    </a>
                  )}
                </AnimatedSection>
              )
            })}
          </div>
        </Container>
      </Section>
    </>
  )
}
