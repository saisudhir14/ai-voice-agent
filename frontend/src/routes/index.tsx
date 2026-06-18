import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Sparkles,
  Workflow,
  Database,
  TerminalSquare,
  FlaskConical,
  Phone,
  MessageSquare,
  Globe2,
  Network,
} from 'lucide-react'
import { AnimatedSection } from '@/components/shared'
import {
  Container,
  Section,
  SectionBlock,
  Display,
  Lede,
  Eyebrow,
  MkBadge,
  MkButton,
  Card,
  LiveDemoWidget,
  ComparisonGrid,
  VerticalTabs,
  HighlightBlocks,
  ComplianceShowcase,
  IntegrationsGrid,
  FAQAccordion,
} from '@/components/landing'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const metrics = [
  { value: '~520ms', label: 'Median voice latency' },
  { value: '99.97%', label: 'Pipeline uptime' },
  { value: '30+', label: 'Languages' },
  { value: '10M+', label: 'Calls processed' },
]

const configFeatures = [
  {
    icon: Workflow,
    title: 'Visual agent studio',
    description:
      'Compose multi-turn agents with branching, guardrails, and human handoff in a drag-and-drop builder. Or just write a prompt.',
  },
  {
    icon: Database,
    title: 'Streaming RAG',
    description:
      'Plug in your knowledge base, EHR, CRM, or product catalog. Answers stay grounded — no hallucinated policies, no fabricated SKUs.',
  },
  {
    icon: TerminalSquare,
    title: 'Function calling',
    description:
      'Look up an account, book an appointment, escalate to a human, kick off a Slack alert — all from inside the call, in real time.',
  },
  {
    icon: FlaskConical,
    title: 'Eval & simulation',
    description:
      'Run thousands of synthetic conversations against your agent before launch. Catch regressions on every prompt change.',
  },
]

const channels = [
  { icon: Phone, title: 'Phone & SIP', body: 'Bring your numbers via SIP trunking or rent ours. Branded caller ID and TCPA-safe outbound included.' },
  { icon: MessageSquare, title: 'SMS & chat', body: 'The same agent across SMS, web chat, in-app. One brain, every channel.' },
  { icon: Globe2, title: 'Web widget', body: 'Drop-in voice widget for your site or app. Works on mobile, low-bandwidth, and accessibility tools.' },
  { icon: Network, title: 'REST + WebSocket API', body: 'Wire the agent into your own product. Streaming transcripts, function-call hooks, and webhooks.' },
]

const faqs = [
  {
    q: 'How is this different from a Twilio Flex IVR or a Dialogflow bot?',
    a: 'Both of those are intent-based — they map a finite set of caller phrases to scripted flows, and fall apart on anything unexpected. We use a real LLM in the loop, so the agent reasons about what the caller actually wants, asks clarifying questions, and improvises within guardrails. The trade-off is that you spend much less time authoring flows and much more time defining policy.',
  },
  {
    q: 'How fast can we launch a production agent?',
    a: 'Most teams ship a first pilot in 2–3 weeks: one week on use-case scoping and prompting, one on integrations (CRM, EHR, telephony), and one on eval, simulation, and a soft launch behind a single phone number. Heavily regulated rollouts (healthcare, financial services) typically add a security-review week.',
  },
  {
    q: 'Is it HIPAA-compliant? Will you sign a BAA?',
    a: 'Yes. We sign Business Associate Agreements. PHI is encrypted at rest with configurable retention, real-time PII redaction is applied before transcripts are stored, and your audio is never used to train base models. Healthcare customers can pin processing to a specific US region.',
  },
  {
    q: 'What about TCPA / outbound calling regulations?',
    a: 'Outbound is gated behind a consent-management module. You can import a do-not-call list, enforce quiet-hours per timezone, cap attempts per contact, and capture verbal opt-outs that propagate across channels in seconds.',
  },
  {
    q: 'Can the agent transfer to a human?',
    a: 'Yes — warm transfer, cold transfer, or asynchronous escalation (Slack/email/ticket). The agent can summarize the call, paste the transcript, and brief the human on context before connecting.',
  },
  {
    q: 'How do you handle voice quality and latency?',
    a: 'Our voice stack is built on Cartesia\'s neural TTS, with a proprietary turn-taking model and streaming STT. Median end-to-end latency runs under 600ms — below the threshold where callers start to notice. We also support voice cloning from 30 seconds of brand audio.',
  },
]

function HomePage() {
  return (
    <>
      {/* ============ HERO ============ */}
      <Section tone="paper" spacing="compact" className="overflow-hidden pt-28 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="mk-grid absolute inset-x-0 top-0 h-[420px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div className="absolute left-1/2 top-[-10%] h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />
        </div>
        <Container className="flex flex-col items-center text-center">
          <AnimatedSection delay={0.05}>
            <MkBadge variant="brand" icon={<Sparkles className="h-3.5 w-3.5" />}>
              In production at healthcare, finance &amp; retail leaders
            </MkBadge>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <Display as="h1" size="2xl" className="mt-7 max-w-4xl">
              The voice AI platform every customer call deserves.
            </Display>
          </AnimatedSection>
          <AnimatedSection delay={0.15}>
            <Lede className="mt-6 max-w-2xl">
              Deploy LLM-native voice agents that sound human, take action, and scale across every industry — from
              patient outreach to card activation to cart recovery. One platform. Any channel. Production-grade from day
              one.
            </Lede>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <MkButton asChild size="lg" variant="primary">
                <Link to="/register">
                  Get a live demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </MkButton>
              <MkButton asChild size="lg" variant="secondary">
                <Link to="/solutions/kidney-care">See it for kidney care</Link>
              </MkButton>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.25}>
            <dl className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-10 sm:grid-cols-4">
              {metrics.map((m) => (
                <div key={m.label} className="text-center">
                  <dt className="sr-only">{m.label}</dt>
                  <dd className="font-display text-display-sm text-ink">{m.value}</dd>
                  <p className="mt-1 text-xs text-ink-3">{m.label}</p>
                </div>
              ))}
            </dl>
          </AnimatedSection>
        </Container>
      </Section>

      {/* ============ LIVE DEMO ============ */}
      <Section tone="paper-2" spacing="default" divider>
        <Container size="narrow">
          <div className="mb-12 flex flex-col items-center gap-4 text-center">
            <AnimatedSection delay={0.05}>
              <Eyebrow>Try it now</Eyebrow>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <Display as="h2" size="md">
                Don’t read about it. Have it call you.
              </Display>
            </AnimatedSection>
            <AnimatedSection delay={0.15}>
              <Lede className="max-w-xl">Pick a use case. Drop your number. An agent dials you in seconds.</Lede>
            </AnimatedSection>
          </div>
          <AnimatedSection delay={0.2}>
            <LiveDemoWidget />
          </AnimatedSection>
        </Container>
      </Section>

      {/* ============ COMPARISON ============ */}
      <SectionBlock
        tone="paper"
        divider
        eyebrow="Overview"
        title="The third generation of voice interfaces."
        lede="IVRs route. NLP bots match intents. LLM-native agents have actual conversations — and that changes what voice automation can do."
      >
        <ComparisonGrid />
      </SectionBlock>

      {/* ============ HIGHLIGHTS ============ */}
      <SectionBlock
        tone="paper-2"
        divider
        eyebrow="Highlights"
        title="Built so callers forget they’re talking to AI."
        lede="Three things separate a usable voice agent from a memorable one: response time, voice quality, and turn-taking. We obsess over all three."
      >
        <HighlightBlocks />
      </SectionBlock>

      {/* ============ VERTICALS ============ */}
      <SectionBlock
        id="use-cases"
        tone="paper"
        divider
        eyebrow="Solutions"
        title="One platform. Every industry."
        lede="Healthcare, financial services, retail, hospitality, logistics — the platform stays the same. The agents, the data, and the integrations adapt."
      >
        <VerticalTabs />
      </SectionBlock>

      {/* ============ CONFIGURABILITY ============ */}
      <SectionBlock
        id="platform"
        tone="paper"
        divider
        eyebrow="The platform"
        title="Configure deeply — without code, until you want code."
        lede="Start with a prompt, ship a pilot in two weeks, then go deep with custom tools, evals, and your own data."
      >
        <div className="grid gap-5 md:grid-cols-2">
          {configFeatures.map((f, i) => (
            <AnimatedSection key={f.title} delay={0.05 * i}>
              <Card interactive padding="lg" className="flex h-full gap-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand-ink">
                  <f.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-ink">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{f.description}</p>
                </div>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </SectionBlock>

      {/* ============ CHANNELS ============ */}
      <SectionBlock
        tone="paper-2"
        divider
        eyebrow="Channels"
        title="Voice first. Every channel after."
        lede="One agent definition powers your phone line, your web widget, your SMS funnel, and your API integrations."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((c, i) => (
            <AnimatedSection key={c.title} delay={0.04 * i}>
              <Card padding="md" className="h-full">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-tint text-brand-ink">
                  <c.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-ink">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{c.body}</p>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </SectionBlock>

      {/* ============ COMPLIANCE ============ */}
      <SectionBlock
        id="compliance"
        tone="paper"
        divider
        eyebrow="Trust & compliance"
        title="Built for the calls regulators ask about."
        lede="Compliance isn’t a checkbox at the end of procurement — it’s a first-class feature of the platform."
      >
        <ComplianceShowcase />
      </SectionBlock>

      {/* ============ INTEGRATIONS ============ */}
      <SectionBlock
        tone="paper-2"
        divider
        eyebrow="Integrations"
        title="Drop into the stack you already run."
        lede="Telephony, EHRs, CRMs, support, data — connectors that ship the day you sign."
      >
        <IntegrationsGrid />
      </SectionBlock>

      {/* ============ FAQ ============ */}
      <SectionBlock
        tone="paper"
        divider
        eyebrow="FAQ"
        title="The questions we get on every first call."
      >
        <FAQAccordion items={faqs} />
      </SectionBlock>

      {/* ============ FINAL CTA ============ */}
      <Section tone="paper" spacing="default" divider>
        <Container size="narrow">
          <Card tone="ink" padding="lg" className="overflow-hidden text-center sm:!p-16">
            <div className="pointer-events-none absolute inset-0 -z-0 opacity-60">
              <div className="absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-brand/30 blur-[120px]" />
            </div>
            <div className="relative">
              <AnimatedSection delay={0.05}>
                <Eyebrow onDark>Let’s build</Eyebrow>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <Display as="h2" size="md" onDark className="mt-4">
                  Your next call could be your best one.
                </Display>
              </AnimatedSection>
              <AnimatedSection delay={0.15}>
                <Lede onDark className="mx-auto mt-5 max-w-xl">
                  90-day pilots, fixed price, measurable outcomes. We’ll come to your team with a tailored agent — built
                  from your data — within two weeks of kickoff.
                </Lede>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <MkButton asChild size="lg" variant="on-ink">
                    <Link to="/register">
                      Book a pilot conversation
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </MkButton>
                  <MkButton asChild size="lg" variant="ghost-on-ink">
                    <Link to="/showcase">Or watch a demo</Link>
                  </MkButton>
                </div>
              </AnimatedSection>
            </div>
          </Card>
        </Container>
      </Section>
    </>
  )
}
