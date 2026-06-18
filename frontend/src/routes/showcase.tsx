import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Sparkles, ShoppingBag, Headphones } from 'lucide-react'
import { MkButton } from '@/components/landing/mk-button'
import { Card } from '@/components/landing/card'
import { MkBadge } from '@/components/landing/primitives'
import { Container, Section, Eyebrow, Display, Lede } from '@/components/landing/primitives'
import { OrbVisualizer, AnimatedSection } from '@/components/shared'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/showcase')({
  component: ShowcasePage,
})

const DEMO_AGENTS = [
  {
    id: 'support',
    name: 'Sarah',
    role: 'Customer Support',
    description: 'Empathetic and efficient support agent that handles returns and FAQs.',
    icon: Headphones,
    transcript: "I'd be happy to help you with that return. Could you please provide your order number?",
  },
  {
    id: 'sales',
    name: 'Marcus',
    role: 'Sales Representative',
    description: 'Persuasive and knowledgeable product expert focused on conversion.',
    icon: ShoppingBag,
    transcript: 'Based on your usage patterns, the Pro plan would save you 20% annually. Shall we switch?',
  },
  {
    id: 'creative',
    name: 'Luna',
    role: 'Creative Assistant',
    description: 'Imaginative partner for brainstorming and content generation.',
    icon: Sparkles,
    transcript: "That's a fascinating concept! What if we explored sustainability in that narrative?",
  },
]

function ShowcasePage() {
  const [activeAgent, setActiveAgent] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = (id: string) => {
    if (activeAgent === id && isPlaying) {
      setIsPlaying(false)
      setActiveAgent(null)
      return
    }
    setActiveAgent(id)
    setIsPlaying(true)
    setTimeout(() => setIsPlaying(false), 4000)
  }

  const current = DEMO_AGENTS.find((a) => a.id === activeAgent)

  return (
    <Section tone="paper" spacing="compact" className="pt-28 sm:pt-32">
      <Container>
        <div className="mb-12 text-center">
          <AnimatedSection>
            <Eyebrow className="mb-4">Showcase</Eyebrow>
            <Display as="h1" size="lg" className="mb-4">
              Hear our agents in action
            </Display>
            <Lede className="mx-auto max-w-2xl">
              Listen to specialized voice agents. No signup required.
            </Lede>
          </AnimatedSection>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Visualizer stage */}
          <AnimatedSection delay={0.1} className="order-2 lg:order-1">
            <Card
              tone="paper-2"
              elevated
              padding="lg"
              className="relative flex aspect-square flex-col items-center justify-center overflow-hidden"
            >
              <div className="pointer-events-none absolute inset-0 mk-grid opacity-30" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,color-mix(in_srgb,var(--orb-sky)_22%,transparent)_0%,color-mix(in_srgb,var(--orb-dawn)_12%,transparent)_40%,transparent_68%)]" />

              <div className="relative flex flex-1 items-center justify-center pb-16 pt-8">
                <OrbVisualizer size="lg" active={isPlaying} />
              </div>

              <AnimatePresence mode="wait">
                {current ? (
                  <motion.div
                    key={activeAgent}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="absolute bottom-8 left-6 right-6 text-center"
                  >
                    <MkBadge variant={isPlaying ? 'brand' : 'neutral'} className="mb-3">
                      {isPlaying ? 'Speaking' : 'Paused'}
                    </MkBadge>
                    <p className="font-display text-lg leading-relaxed text-ink sm:text-xl">
                      &ldquo;{current.transcript}&rdquo;
                    </p>
                  </motion.div>
                ) : (
                  <motion.p
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-10 text-sm text-ink-3"
                  >
                    Select an agent to hear them speak
                  </motion.p>
                )}
              </AnimatePresence>
            </Card>
          </AnimatedSection>

          {/* Agent list */}
          <div className="order-1 space-y-4 lg:order-2">
            {DEMO_AGENTS.map((agent, index) => {
              const selected = activeAgent === agent.id
              const playing = selected && isPlaying
              return (
                <AnimatedSection key={agent.id} delay={0.08 * (index + 1)}>
                  <Card
                    interactive
                    padding="md"
                    className={cn(
                      'cursor-pointer transition-colors',
                      selected && 'border-brand bg-brand-tint/30',
                    )}
                    onClick={() => handlePlay(agent.id)}
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-tint">
                        <agent.icon className="h-5 w-5 text-brand-ink" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <h3 className="font-display text-base font-semibold text-ink">{agent.name}</h3>
                          <MkBadge variant="neutral">{agent.role}</MkBadge>
                        </div>
                        <p className="mb-3 text-sm leading-relaxed text-ink-2">{agent.description}</p>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-brand-ink">
                          {playing ? (
                            <>
                              <Pause className="h-3 w-3" /> Pause demo
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3" /> Play demo
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </Card>
                </AnimatedSection>
              )
            })}

            <AnimatedSection delay={0.4}>
              <Card tone="paper-2" padding="md" className="mt-6 text-center">
                <p className="mb-4 text-sm text-ink-2">Want to build your own custom agent?</p>
                <MkButton asChild variant="primary" size="lg" className="w-full">
                  <Link to="/register">Sign up free</Link>
                </MkButton>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </Container>
    </Section>
  )
}
