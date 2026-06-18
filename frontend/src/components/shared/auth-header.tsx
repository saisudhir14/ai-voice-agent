import { Link } from '@tanstack/react-router'
import { VoiceIcon } from '@/components/shared/voice-icon'
import { MkButton } from '@/components/landing/mk-button'
import { ThemeToggle } from '@/components/shared/theme-toggle'

type AuthMode = 'login' | 'register'

export function AuthHeader({ mode }: { mode: AuthMode }) {
  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-line bg-paper px-6 sm:px-10 lg:px-14">
      <Link to="/" className="flex items-center gap-2.5" aria-label="VoiceAI home">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-ink-on">
          <VoiceIcon className="h-4 w-4" />
        </span>
        <span className="font-display text-lg font-semibold tracking-tight text-ink">VoiceAI</span>
      </Link>

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
