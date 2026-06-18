import { Shield, FileLock, Lock, KeyRound, ServerCog, Eye } from 'lucide-react'
import { AnimatedSection } from '@/components/shared'

const items = [
  {
    icon: Shield,
    title: 'HIPAA & BAA',
    body: 'PHI redaction on transcripts, encrypted-at-rest storage with configurable retention, signed BAAs out of the box.',
  },
  {
    icon: FileLock,
    title: 'SOC 2 Type II',
    body: 'Annual independent audit covering security, availability, confidentiality, and processing integrity.',
  },
  {
    icon: ServerCog,
    title: 'Regional data residency',
    body: 'Pin processing to US, EU, or APAC. No customer audio or transcripts are used to train base models — ever.',
  },
  {
    icon: KeyRound,
    title: 'SSO + RBAC',
    body: 'SAML SSO via Okta, Azure AD, Google Workspace. Module-level role-based access for every operator surface.',
  },
  {
    icon: Eye,
    title: 'PII redaction',
    body: 'Real-time entity detection for names, account numbers, SSNs, dates of birth — redacted before transcript storage.',
  },
  {
    icon: Lock,
    title: 'GDPR & TCPA aligned',
    body: 'Consent capture, right-to-erasure tooling, and TCPA-safe outbound calling controls with quiet-hours enforcement.',
  },
]

export function ComplianceShowcase() {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <AnimatedSection key={item.title} delay={0.04 * i}>
          <div className="group flex h-full flex-col bg-paper p-7 transition-colors hover:bg-paper-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-tint text-brand-ink">
              <item.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-5 text-base font-semibold text-ink">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{item.body}</p>
          </div>
        </AnimatedSection>
      ))}
    </div>
  )
}
