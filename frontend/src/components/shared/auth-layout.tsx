import { ReactNode } from 'react'
import { Bot, MessageSquare, Mic, Sparkles } from 'lucide-react'
import { AuthHeader } from '@/components/shared/auth-header'
import { Eyebrow } from '@/components/landing/primitives'

interface AuthLayoutProps {
  mode: 'login' | 'register'
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
  aside: ReactNode
}

export function AuthLayout({ mode, title, description, children, footer, aside }: AuthLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-paper text-ink-2 antialiased">
      <AuthHeader mode={mode} />

      <div className="grid min-h-0 flex-1 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Left — spacious timeline */}
        <aside className="relative hidden overflow-hidden bg-paper-2 lg:block">
          <div className="pointer-events-none absolute inset-0">
            <div className="mk-grid absolute inset-0 opacity-30" />
            <div className="absolute -left-40 top-1/4 h-[420px] w-[420px] rounded-full bg-brand/[0.06] blur-[120px]" />
            <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-brand/[0.04] blur-[100px]" />
          </div>
          <div className="relative flex h-full flex-col px-12 py-14 xl:px-16 xl:py-16">
            {aside}
          </div>
        </aside>

        {/* Right — form */}
        <div className="flex items-center justify-center overflow-y-auto bg-paper px-8 py-10 lg:border-l lg:border-line lg:px-12 xl:px-16">
          <div className="w-full max-w-[420px]">
            <div className="mb-9">
              <h1 className="font-display text-[1.875rem] font-semibold tracking-tight text-ink">{title}</h1>
              <p className="mt-2.5 text-base leading-relaxed text-ink-2">{description}</p>
            </div>

            {children}

            {footer && <p className="mt-8 text-center text-sm text-ink-3">{footer}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

interface StepItem {
  icon: React.ElementType
  title: string
  description: string
}

function TimelineStep({
  step,
  item,
  isLast,
}: {
  step: number
  item: StepItem
  isLast: boolean
}) {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-line bg-paper shadow-mk-xs">
          <item.icon className="h-5 w-5 text-brand-ink" strokeWidth={1.75} />
        </span>
        {!isLast && (
          <div className="my-2 w-px flex-1 min-h-[1.5rem] bg-gradient-to-b from-line-2 to-line/40" aria-hidden />
        )}
      </div>

      <div className={`min-w-0 flex-1 ${isLast ? 'pb-0' : 'pb-2'}`}>
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink">
          Step {step}
        </span>
        <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug text-ink">
          {item.title}
        </h3>
        <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-ink-2">
          {item.description}
        </p>
      </div>
    </div>
  )
}

function SequenceDiagram({
  eyebrow,
  headline,
  lede,
  steps,
  footnote,
}: {
  eyebrow: string
  headline: string
  lede: string
  steps: StepItem[]
  footnote: string
}) {
  return (
    <>
      <div className="shrink-0">
        <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
        <h2 className="max-w-lg font-display text-[1.75rem] font-semibold leading-tight tracking-tight text-ink xl:text-[2rem]">
          {headline}
        </h2>
        <p className="mt-4 max-w-md text-base leading-relaxed text-ink-2">{lede}</p>
      </div>

      <div
        className="flex flex-1 flex-col justify-center py-10"
        role="list"
        aria-label="Workflow steps"
      >
        <div className="flex flex-col justify-between gap-2">
          {steps.map((item, i) => (
            <div key={item.title} role="listitem" className="flex-1 flex items-center">
              <TimelineStep step={i + 1} item={item} isLast={i === steps.length - 1} />
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t border-line pt-6">
        <p className="text-sm text-ink-3">{footnote}</p>
      </div>
    </>
  )
}

const signupSteps: StepItem[] = [
  {
    icon: Sparkles,
    title: 'Create your account',
    description: 'Set up your workspace in under a minute. No credit card required.',
  },
  {
    icon: Bot,
    title: 'Build your first agent',
    description: 'Choose a template, customize the voice, and define how it responds.',
  },
  {
    icon: Mic,
    title: 'Launch a live session',
    description: 'Talk to your agent in the browser with real-time voice.',
  },
  {
    icon: MessageSquare,
    title: 'Review conversations',
    description: 'Every call is transcribed and searchable from your dashboard.',
  },
]

const signinSteps: StepItem[] = [
  {
    icon: Sparkles,
    title: 'Open your dashboard',
    description: 'See agent activity, recent sessions, and key metrics at a glance.',
  },
  {
    icon: Bot,
    title: 'Manage your agents',
    description: 'Edit prompts, swap voices, and toggle agents on or off anytime.',
  },
  {
    icon: Mic,
    title: 'Run a voice session',
    description: 'Test changes in a live call before going to production.',
  },
  {
    icon: MessageSquare,
    title: 'Review conversations',
    description: 'Search transcripts and track performance over time.',
  },
]

export function AuthSignupAside() {
  return (
    <SequenceDiagram
      eyebrow="Getting started"
      headline="From signup to your first voice call."
      lede="A clear path from account creation to a working voice agent — no engineering required."
      footnote="Most teams ship their first agent in under 10 minutes."
      steps={signupSteps}
    />
  )
}

export function AuthSigninAside() {
  return (
    <SequenceDiagram
      eyebrow="Welcome back"
      headline="Pick up where you left off."
      lede="Sign in to manage agents, run live sessions, and review every conversation."
      footnote="Your agents and settings are saved and ready to go."
      steps={signinSteps}
    />
  )
}
