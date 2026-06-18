import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Activity,
  PhoneCall,
  Hospital,
  Pill,
  Car,
  ClipboardList,
  Shield,
  Stethoscope,
  Calendar,
  HeartHandshake,
  Workflow,
} from 'lucide-react'
import { AnimatedSection } from '@/components/shared'
import {
  Section,
  SectionBlock,
  Container,
  Display,
  Lede,
  MkBadge,
  MkButton,
  Card,
  LiveDemoWidget,
  ComplianceShowcase,
  FAQAccordion,
} from '@/components/landing'

export const Route = createFileRoute('/solutions/kidney-care')({
  component: KidneyCarePage,
})

// const heroMetrics = [
//   { value: '156', label: 'treatments / patient / year' },
//   { value: '~10%', label: 'avg missed-treatment rate' },
//   { value: '$22–30K', label: 'cost per avoidable admit' },
//   { value: '30 days', label: 'highest readmit-risk window' },
// ]

const useCases = [
  {
    icon: Activity,
    name: 'Pre-treatment check-in',
    cadence: 'Daily / pre-shift',
    summary:
      'Calls patients before in-center treatment to screen for fluid overload, BP changes, missed medications, and symptoms. Flags clinical concerns to the on-call RN in real time.',
    bullets: ['Weight-change & swelling screen', 'BP, dizziness, shortness of breath', 'Med adherence (binders, BP, ESAs)', 'Auto-page nurse on any red flag'],
    impact: 'Catch clinical issues before the chair-side',
  },
  {
    icon: PhoneCall,
    name: 'Missed-treatment outreach',
    cadence: 'Within 30 min of no-show',
    summary:
      'Triggers automatically the moment a patient is late. Reaches them, understands why, books a same-day make-up, or routes to social work if it’s a transportation or psychosocial issue.',
    bullets: ['Triage reason for no-show', 'Same-day reschedule + transport', 'Escalation to social work / clinician', 'QIP-grade adherence reporting'],
    impact: 'Treatment adherence is a QIP metric',
  },
  {
    icon: Hospital,
    name: 'Post-discharge follow-up',
    cadence: '24h, 72h, 7d, 14d, 30d',
    summary:
      'CMS-incentivized for the ESRD population. Calls patients after every hospital stay to assess recovery, medication reconciliation, and warning signs of readmission.',
    bullets: ['Discharge med reconciliation', 'Symptom triage by acuity', 'Schedules outpatient appointments', 'Closes the loop with the care team'],
    impact: '30-day readmission reduction funds CKCC shared-savings',
  },
  {
    icon: Pill,
    name: 'Medication adherence',
    cadence: 'Weekly / refill-day',
    summary:
      'Outbound on refill day for phosphate binders, ESAs, and antihypertensives. Logs adherence, flags non-fills to pharmacy, and schedules vitamin-D or IV-iron infusions.',
    bullets: ['Refill confirmation & barrier triage', 'Mail-order pharmacy coordination', 'Lab-trigger workflows (phos, Hgb, ferritin)', 'Discrete logging for QIP & MIPS'],
    impact: 'Better labs → better QIP score → higher reimbursement',
  },
  {
    icon: Car,
    name: 'Transportation coordination',
    cadence: 'Day-before + day-of',
    summary:
      'Confirms NEMT pickup the day before treatment and re-confirms 90 minutes prior. Handles last-minute changes and books backups without involving the front desk.',
    bullets: ['Day-before NEMT confirmation', 'Real-time fallback ride booking', 'Front-desk hand-off when needed', 'Integrated with Medicaid broker APIs'],
    impact: 'Roughly 1 in 5 missed treatments are transport-related',
  },
  {
    icon: ClipboardList,
    name: 'PRO surveys (KDQOL-36)',
    cadence: 'Quarterly / annual',
    summary:
      'Captures patient-reported outcomes by voice — the way patients actually want to be reached. Replaces paper packets and manual call campaigns.',
    bullets: ['KDQOL-36 administered conversationally', 'ICH-CAHPS and custom surveys', 'Native bilingual EN/ES', 'Direct write-back to EHR'],
    impact: 'Near-100% capture vs ~40% with paper',
  },
]

const careTimeline = [
  { day: 'Day –1', title: 'Pre-treatment check-in', desc: 'Agent calls Mr. Chen. He mentions 4 lbs of fluid gain. Auto-escalates to RN.' },
  { day: 'Day 0', title: 'Transportation confirm', desc: '90 min before treatment, agent confirms NEMT pickup. Ride cancelled — agent books backup.' },
  { day: 'Day +1', title: 'Refill reminder', desc: 'Sevelamer refill due. Agent confirms pharmacy pickup, flags barrier to social work.' },
  { day: 'Day +14', title: 'Discharge follow-up', desc: 'After ER visit, agent calls 24h post-discharge. Walks through new meds, books nephrology visit.' },
  { day: 'Quarterly', title: 'KDQOL-36 survey', desc: 'Conversational survey. Patient finishes in 6 minutes. Results write-back to EHR.' },
]

const integrations = [
  { name: 'Epic', label: 'HL7 / FHIR R4' },
  { name: 'Cerner', label: 'HL7 / FHIR' },
  { name: 'Athenahealth', label: 'FHIR + API' },
  { name: 'Internal EMRs', label: 'Webhooks / SFTP' },
  { name: 'CareLogic', label: 'API' },
  { name: 'Twilio', label: 'Voice + SIP' },
  { name: 'NEMT brokers', label: 'API' },
  { name: 'SF Health Cloud', label: 'Native' },
]

const faqs = [
  {
    q: 'How do you handle PHI on the LLM path?',
    a: 'PHI is detected and redacted in real time before transcripts are persisted. Your audio is never used to train base models. We pin processing to a HIPAA-eligible US region (AWS or Azure), encrypt at rest with customer-managed keys on enterprise plans, and sign BAAs as a standard part of the contract.',
  },
  {
    q: 'Do you integrate with Epic or our internal EMR?',
    a: 'Yes — we support HL7 v2 and FHIR R4 out of the box, including SMART-on-FHIR for staff-facing surfaces. For proprietary internal EMRs, we work with your engineering team to define a thin integration layer (typically a few REST endpoints) within the first two weeks of the pilot.',
  },
  {
    q: 'How do you measure clinical safety?',
    a: 'Every agent ships with an evaluation suite specific to its workflow — for kidney care, that includes thousands of simulated calls covering symptom-triage edge cases, refusals, language switches, low-literacy phrasing, and escalation triggers. Failure modes route to a human, never to silence.',
  },
  {
    q: 'What does a kidney-care pilot look like?',
    a: 'A 90-day, fixed-price pilot in one region or division. Workstream 1 is missed-treatment outreach; Workstream 2 is post-discharge follow-up. Success metrics — adherence %, readmit %, RN minutes saved — are agreed upfront. Pilot pricing is structured to convert to per-patient-per-month at the end.',
  },
  {
    q: 'Is the agent multilingual?',
    a: 'Yes. Production deployments default to English and Spanish; we also support Mandarin, Vietnamese, and Tagalog for kidney-care populations. Language detection happens in the first turn, and the agent switches transparently within the call.',
  },
  {
    q: 'What about TCPA and patient consent?',
    a: 'Patient consent is captured at the EMR level and synced into our consent ledger; the agent will not place a call without an active consent record. Quiet hours, attempt caps, and verbal opt-outs are enforced platform-side.',
  },
]

// const pilotPhases = [
//   {
//     week: 'Weeks 1–2',
//     title: 'Scope & build',
//     bullets: ['Workstream selection (missed-treatment + post-discharge)', 'Prompt + policy authoring with your clinical team', 'EHR / telephony integration kickoff', 'IRB / privacy review'],
//   },
//   {
//     week: 'Weeks 3–4',
//     title: 'Eval & soft-launch',
//     bullets: ['5,000+ simulated calls against clinical eval set', 'Shadow mode on 100 real patients', 'On-call escalation routing wired up', 'Go / no-go review with CMO + CNO'],
//   },
//   {
//     week: 'Weeks 5–12',
//     title: 'Production pilot',
//     bullets: ['One region / 30–50 centers', 'Weekly metric review (adherence, readmits, RN hours)', 'Iteration on prompts, escalations, edge cases', 'Conversion conversation in week 11'],
//   },
// ]

function KidneyCarePage() {
  return (
    <>
      {/* ============ HERO ============ */}
      <Section tone="paper" spacing="compact" className="overflow-hidden pt-28 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="mk-grid absolute inset-x-0 top-0 h-[380px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div className="absolute left-1/2 top-[-10%] h-[440px] w-[760px] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />
        </div>
        <Container className="flex flex-col items-center text-center">
          <AnimatedSection delay={0.05}>
            <MkBadge variant="brand" icon={<HeartHandshake className="h-3.5 w-3.5" />}>
              Voice AI for kidney care
            </MkBadge>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <Display as="h1" size="xl" className="mt-7 max-w-4xl">
              Reach every patient between treatments — without adding headcount.
            </Display>
          </AnimatedSection>
          <AnimatedSection delay={0.15}>
            <Lede className="mt-6 max-w-3xl">
              A HIPAA-compliant voice agent that runs pre-treatment check-ins, missed-treatment outreach, post-discharge
              follow-up, refill reminders, transportation confirmations, and patient-reported outcome surveys — at the
              scale only voice AI can deliver.
            </Lede>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <MkButton size="lg" variant="primary">
                Book a clinical demo
                <ArrowRight className="h-4 w-4" />
              </MkButton>
              <MkButton size="lg" variant="secondary">
                Download the pilot blueprint
              </MkButton>
            </div>
          </AnimatedSection>
          {/* Hero metrics — hidden until we have validated customer data
          <AnimatedSection delay={0.25}>
            <dl className="mt-16 grid w-full max-w-4xl grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-10 sm:grid-cols-4">
              {heroMetrics.map((m) => (
                <div key={m.label} className="text-center">
                  <dt className="sr-only">{m.label}</dt>
                  <dd className="font-display text-display-sm text-ink">{m.value}</dd>
                  <p className="mt-1 text-xs text-ink-3">{m.label}</p>
                </div>
              ))}
            </dl>
          </AnimatedSection>
          */}
        </Container>
      </Section>

      {/* ============ THE PROBLEM ============ */}
      <SectionBlock
        tone="paper-2"
        divider
        eyebrow="The problem"
        title="Every patient touchpoint is a missed opportunity — and a clinical risk."
        lede="In-center dialysis patients need 156 treatments every year. Missed treatments lead to fluid overload, ER visits, and inpatient admissions. Most outreach today is manual, paper-based, or doesn’t happen at all."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Activity, title: 'Volume is unworkable manually', body: 'Pre-visit screen, missed-treatment outreach, refill reminders, transport confirms, post-discharge follow-up — multiply across thousands of patients. RNs and social workers can’t keep up.' },
            { icon: HeartHandshake, title: 'Clinical workforce shortage', body: 'Patient care techs, dialysis RNs, and social workers are scarce. Every minute spent on outbound phone work is a minute not spent at the chair-side or in care coordination.' },
            { icon: Workflow, title: 'Value-based care demands more contact', body: 'Under CKCC / KCC contracts, you’re paid for outcomes. More high-quality touchpoints = fewer admits = more shared savings. The math is obvious — the bandwidth isn’t.' },
          ].map((item, i) => (
            <AnimatedSection key={item.title} delay={0.05 * i}>
              <Card padding="lg" className="h-full">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-tint text-brand-ink">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{item.body}</p>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </SectionBlock>

      {/* ============ USE CASES ============ */}
      <SectionBlock
        tone="paper"
        divider
        eyebrow="Use cases"
        title="Six agents. One platform. One BAA."
        lede="Each agent is purpose-built for a kidney-care workflow, ships with a clinical eval suite, and writes back to your EHR."
      >
        <div className="grid gap-5 md:grid-cols-2">
          {useCases.map((u, i) => (
            <AnimatedSection key={u.name} delay={0.05 * i}>
              <Card as="article" interactive padding="lg" className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-tint text-brand-ink">
                    <u.icon className="h-5 w-5" />
                  </span>
                  <MkBadge variant="neutral">{u.cadence}</MkBadge>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-ink">{u.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{u.summary}</p>
                <ul className="mt-5 space-y-2">
                  {u.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-xs text-ink-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t border-line pt-4 text-xs font-medium text-brand-ink">{u.impact}</div>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </SectionBlock>

      {/* ============ TIMELINE ============ */}
      <SectionBlock
        tone="paper-2"
        divider
        eyebrow="One patient · One month"
        title="What it looks like in practice."
        lede="Follow a single in-center patient through a month of automated touchpoints. Every call has a purpose. Every escalation reaches a human."
      >
        <div className="relative mx-auto max-w-3xl">
          <div className="absolute bottom-2 left-[19px] top-2 w-px bg-line" aria-hidden />
          <ol className="space-y-5">
            {careTimeline.map((step, i) => (
              <AnimatedSection key={step.day + step.title} delay={0.05 * i}>
                <li className="relative flex gap-5">
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-brand-ink shadow-mk-xs">
                    <Stethoscope className="h-4 w-4" />
                  </span>
                  <Card padding="md" className="flex-1">
                    <div className="text-eyebrow uppercase text-brand-ink">{step.day}</div>
                    <h3 className="mt-1.5 text-base font-semibold text-ink">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-2">{step.desc}</p>
                  </Card>
                </li>
              </AnimatedSection>
            ))}
          </ol>
        </div>
      </SectionBlock>

      {/* ============ HEAR IT ============ */}
      <SectionBlock
        tone="paper"
        divider
        eyebrow="Hear it"
        title="Pick a workflow. Get a call."
        lede="The fastest way to evaluate a voice agent is to be the patient for 60 seconds."
        containerSize="narrow"
      >
        <AnimatedSection>
          <LiveDemoWidget />
        </AnimatedSection>
      </SectionBlock>

      {/* ============ ROI ============ */}
      {/*
      <SectionBlock
        tone="paper"
        divider
        eyebrow="The math"
        title="Conservative ROI for a 50-center deployment."
        lede="Round numbers. Defensible assumptions. The kind of slide your CFO will accept."
      >
        <div className="mx-auto max-w-4xl overflow-hidden rounded-card border border-line">
          <div className="grid divide-y divide-line md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="bg-paper p-8">
              <div className="text-eyebrow uppercase text-ink-3">Assumptions</div>
              <ul className="mt-5 space-y-3 text-sm">
                {[
                  ['Patients', '~5,000'],
                  ['Baseline missed-treatment rate', '10%'],
                  ['Adherence improvement (modeled)', '2 pts → 8%'],
                  ['Avg cost / avoidable admit', '$24,000'],
                  ['Admits avoided per missed treatment', '0.03'],
                ].map(([k, v], idx, arr) => (
                  <li
                    key={k}
                    className={`flex items-baseline justify-between ${idx < arr.length - 1 ? 'border-b border-line pb-2.5' : ''}`}
                  >
                    <span className="text-ink-2">{k}</span>
                    <span className="font-mono text-ink">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-paper-2 p-8">
              <div className="text-eyebrow uppercase text-brand-ink">Modeled annual impact</div>
              <div className="mt-5 space-y-5">
                {[
                  ['Treatments recaptured', '~15,600'],
                  ['Avoidable admits prevented', '~468'],
                  ['Cost avoidance (lower bound)', '~$11.2M'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-xs text-ink-3">{k}</div>
                    <div className="font-display text-display-sm text-ink">{v}</div>
                  </div>
                ))}
                <div className="rounded-[10px] border border-brand/20 bg-brand-tint p-3 text-xs leading-relaxed text-brand-ink">
                  Plus reclaimed RN/SW capacity, improved QIP scores, and CKCC shared-savings tailwind.
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionBlock>
      */}

      {/* ============ COMPLIANCE ============ */}
      <SectionBlock
        tone="paper-2"
        divider
        eyebrow="Compliance"
        title="HIPAA-first by design."
        lede="Healthcare buyers ask about security before they ask about features. We answer those questions before you ask."
      >
        <ComplianceShowcase />
      </SectionBlock>

      {/* ============ INTEGRATIONS ============ */}
      <SectionBlock
        tone="paper"
        divider
        eyebrow="Integrations"
        title="Lives in your EHR."
        lede="HL7 v2, FHIR R4, SMART-on-FHIR, and direct API connectors. We meet your data where it lives — not the other way around."
      >
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-3 md:grid-cols-4">
          {integrations.map((integration, i) => (
            <AnimatedSection key={integration.name} delay={0.02 * i}>
              <div className="group flex h-full flex-col justify-between bg-paper p-6 transition-colors hover:bg-paper-2">
                <div className="text-eyebrow uppercase text-ink-3">{integration.label}</div>
                <div className="mt-8 font-display text-lg font-semibold tracking-tight text-ink-2 group-hover:text-ink">
                  {integration.name}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </SectionBlock>

      {/* ============ PILOT ============ */}
      {/*
      <SectionBlock
        tone="paper-2"
        divider
        eyebrow="Pilot blueprint"
        title="A 90-day pilot, costed and de-risked."
        lede="We come to you with a tailored agent ready in two weeks. You pick the metrics. Outcomes-based pricing kicks in at conversion."
      >
        <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-3">
          {pilotPhases.map((p, i) => (
            <AnimatedSection key={p.week} delay={0.06 * i}>
              <Card padding="lg" className="flex h-full flex-col">
                <div className="text-eyebrow uppercase text-brand-ink">{p.week}</div>
                <h3 className="mt-2 font-display text-lg font-semibold text-ink">{p.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs leading-relaxed text-ink-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
                      {b}
                    </li>
                  ))}
                </ul>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </SectionBlock>
      */}

      {/* ============ FAQ ============ */}
      <SectionBlock tone="paper" divider eyebrow="FAQ" title="What clinical & procurement teams ask first.">
        <FAQAccordion items={faqs} />
      </SectionBlock>

      {/* ============ FINAL CTA ============ */}
      <Section tone="paper" spacing="default" divider>
        <Container size="narrow">
          <Card tone="ink" padding="lg" className="overflow-hidden text-center sm:!p-16">
            <div className="pointer-events-none absolute inset-0 opacity-60">
              <div className="absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-brand/30 blur-[120px]" />
            </div>
            <div className="relative">
              <AnimatedSection delay={0.05}>
                <MkBadge variant="outline" icon={<Shield className="h-3.5 w-3.5" />} className="border-white/20 text-ink-on/80">
                  HIPAA · SOC 2 · BAA-ready
                </MkBadge>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <Display as="h2" size="md" onDark className="mt-5">
                  Bring this to your next QI committee.
                </Display>
              </AnimatedSection>
              <AnimatedSection delay={0.15}>
                <Lede onDark className="mx-auto mt-5 max-w-xl">
                  Send your CMO, CNO, or VP of integrated care. We’ll come back with a tailored pilot plan and a working
                  demo in your name.
                </Lede>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <MkButton size="lg" variant="on-ink">
                    <Calendar className="h-4 w-4" />
                    Book a clinical demo
                  </MkButton>
                  <MkButton asChild size="lg" variant="ghost-on-ink">
                    <Link to="/solutions">Back to solutions</Link>
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
