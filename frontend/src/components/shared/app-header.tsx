import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Menu, X, LogOut, LayoutDashboard, Bot, MessageSquare, Terminal } from 'lucide-react'
import { VoiceIcon } from '@/components/shared/voice-icon'
import { cn } from '@/lib/utils'
import { Container } from '@/components/landing/primitives'
import { MkButton } from '@/components/landing/mk-button'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { useAuthStore } from '@/stores/authStore'

const appNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/agents', label: 'Agents', icon: Bot },
  { to: '/conversations', label: 'Conversations', icon: MessageSquare },
] as const

export function AppHeader() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate({ to: '/' })
    setOpen(false)
  }

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
          : 'border-b border-transparent bg-paper/60 backdrop-blur-sm',
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5" aria-label="VoiceAI dashboard">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-ink-on">
            <VoiceIcon className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">VoiceAI</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="App">
          {appNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-2 rounded-[10px] px-3.5 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
              activeProps={{ className: 'bg-brand-tint text-brand-ink' }}
              inactiveProps={{ className: '' }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <MkButton asChild variant="ghost" size="md">
            <Link to="/console/dashboard">
              <Terminal className="h-3.5 w-3.5" />
              Console
            </Link>
          </MkButton>
          <div className="flex items-center gap-3 border-l border-line pl-3">
            <div className="text-right">
              <p className="text-sm font-medium text-ink leading-tight">{user?.name}</p>
              <p className="text-xs text-ink-3">{user?.email}</p>
            </div>
            <MkButton variant="ghost" size="md" onClick={handleLogout} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </MkButton>
          </div>
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

      {open && (
        <div className="border-t border-line bg-paper md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {appNavItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
                activeProps={{ className: 'bg-brand-tint text-brand-ink' }}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-line pt-4">
              <div className="px-1 pb-2">
                <ThemeToggle className="w-full justify-center" />
              </div>
              <MkButton asChild variant="secondary" size="lg" onClick={() => setOpen(false)}>
                <Link to="/console/dashboard">
                  <Terminal className="h-4 w-4" />
                  Console
                </Link>
              </MkButton>
              <div className="rounded-card border border-line bg-paper-2 px-4 py-3">
                <p className="text-sm font-medium text-ink">{user?.name}</p>
                <p className="text-xs text-ink-3">{user?.email}</p>
              </div>
              <MkButton variant="ghost" size="lg" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Sign out
              </MkButton>
            </div>
          </Container>
        </div>
      )}
    </header>
  )
}
