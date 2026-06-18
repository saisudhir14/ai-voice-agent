import { Monitor, Moon, Sun } from 'lucide-react'
import { MkButton } from '@/components/landing/mk-button'
import { ThemeMode, useThemeStore } from '@/stores/themeStore'
import { cn } from '@/lib/utils'

const options: { value: ThemeMode; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  return (
    <div
      className={cn('inline-flex items-center rounded-[10px] border border-line bg-paper p-0.5', className)}
      role="group"
      aria-label="Theme"
    >
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors',
            theme === value
              ? 'bg-brand-tint text-brand-ink'
              : 'text-ink-3 hover:bg-paper-2 hover:text-ink',
          )}
          aria-label={`${label} theme`}
          aria-pressed={theme === value}
          title={label}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  )
}

export function ThemeToggleCompact() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  const cycle = () => {
    const order: ThemeMode[] = ['system', 'light', 'dark']
    const next = order[(order.indexOf(theme) + 1) % order.length]
    setTheme(next)
  }

  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <MkButton variant="ghost" size="md" onClick={cycle} aria-label="Toggle theme" title="Toggle theme">
      <Icon className="h-4 w-4" />
    </MkButton>
  )
}
