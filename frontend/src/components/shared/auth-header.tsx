import { Link } from '@tanstack/react-router'
import { BrandLogo } from '@/components/shared/brand-logo'
import { MkButton } from '@/components/landing/mk-button'
import { ThemeToggle } from '@/components/shared/theme-toggle'

type AuthMode = 'login' | 'register'

export function AuthHeader({ mode }: { mode: AuthMode }) {
  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-line bg-paper px-6 sm:px-10 lg:px-14">
      <BrandLogo />

      {mode === 'register' ? (
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MkButton asChild variant="ghost" size="md">
            <Link to="/login">Sign in</Link>
          </MkButton>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MkButton asChild variant="ghost" size="md">
            <Link to="/register">Sign up</Link>
          </MkButton>
        </div>
      )}
    </header>
  )
}
