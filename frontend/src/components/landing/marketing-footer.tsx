import { Link } from '@tanstack/react-router'
import { VoiceIcon } from '@/components/shared/voice-icon'
import { Container } from './primitives'

type FooterLink = { label: string; to?: string; href?: string }
type FooterColumn = { heading: string; links: FooterLink[] }

const columns: FooterColumn[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Platform', href: '/#platform' },
      { label: 'Pricing', href: '#' },
      { label: 'Security', href: '/#compliance' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    heading: 'Solutions',
    links: [
      { label: 'Kidney care', to: '/solutions/kidney-care' },
      { label: 'Financial services', href: '#' },
      { label: 'Retail', href: '#' },
      { label: 'Hospitality', href: '#' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Customers', href: '/#customers' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Trust center', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Status', href: '#' },
    ],
  },
]

function FooterAnchor({ link }: { link: FooterLink }) {
  const classes = 'text-sm text-ink-2 transition-colors hover:text-ink'
  if (link.to) {
    return (
      <Link to={link.to} className={classes}>
        {link.label}
      </Link>
    )
  }
  return (
    <a href={link.href} className={classes}>
      {link.label}
    </a>
  )
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <Container className="py-14 lg:py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Link to="/" className="flex items-center gap-2.5" aria-label="VoiceAI home">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-ink-on">
                <VoiceIcon className="h-4 w-4" />
              </span>
              <span className="font-display text-lg font-semibold tracking-tight text-ink">VoiceAI</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-ink-2">
              LLM-native voice agents for the businesses that depend on every call going right.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-eyebrow uppercase text-ink-3">{col.heading}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterAnchor link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="text-sm text-ink-3">&copy; {new Date().getFullYear()} VoiceAI. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-ink-3 transition-colors hover:text-ink">Privacy</a>
            <a href="#" className="text-sm text-ink-3 transition-colors hover:text-ink">Terms</a>
            <a href="#" className="text-sm text-ink-3 transition-colors hover:text-ink">DPA</a>
          </div>
        </div>
      </Container>
    </footer>
  )
}
