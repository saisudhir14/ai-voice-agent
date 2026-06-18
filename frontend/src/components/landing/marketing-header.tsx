import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { BrandLogo } from '@/components/shared/brand-logo'
import { cn } from '@/lib/utils'
import { Container } from './primitives'
import { MkButton } from './mk-button'
import { ThemeToggle } from '@/components/shared/theme-toggle'

type NavLink = { label: string; to?: string; href?: string }

const navLinks: NavLink[] = [
  { label: 'Platform', href: '/#platform' },
  { label: 'Solutions', to: '/solutions' },
  { label: 'Use cases', href: '/#use-cases' },
]

function NavItem({ link, onClick, className }: { link: NavLink; onClick?: () => void; className?: string }) {
  const classes = cn('text-sm font-medium text-ink-2 transition-colors hover:text-ink', className)
  if (link.to) {
    return (
      <Link to={link.to} onClick={onClick} className={classes}>
        {link.label}
      </Link>
    )
  }
  return (
    <a href={link.href} onClick={onClick} className={classes}>
      {link.label}
    </a>
  )
}

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-200',
        scrolled || open
          ? 'border-b border-line bg-paper/85 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        <BrandLogo />

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <NavItem key={link.label} link={link} />
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <MkButton asChild variant="ghost" size="md">
            <Link to="/login">Sign in</Link>
          </MkButton>
          <MkButton asChild variant="primary" size="md">
            <Link to="/register">Sign up</Link>
          </MkButton>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      {/* Mobile panel */}
      {open && (
        <div className="border-t border-line bg-paper md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <NavItem
                key={link.label}
                link={link}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base hover:bg-paper-2"
              />
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-line pt-4">
              <div className="px-1 pb-2">
                <ThemeToggle className="w-full justify-center" />
              </div>
              <MkButton asChild variant="secondary" size="lg" onClick={() => setOpen(false)}>
                <Link to="/login">Sign in</Link>
              </MkButton>
              <MkButton asChild variant="primary" size="lg" onClick={() => setOpen(false)}>
                <Link to="/register">Sign up</Link>
              </MkButton>
            </div>
          </Container>
        </div>
      )}
    </header>
  )
}
