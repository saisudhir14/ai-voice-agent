import { Link } from '@tanstack/react-router'
import { VoiceIcon } from '@/components/shared/voice-icon'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  to?: string
  className?: string
  iconClassName?: string
  showWordmark?: boolean
  'aria-label'?: string
}

export function BrandLogo({
  to = '/',
  className,
  iconClassName,
  showWordmark = true,
  'aria-label': ariaLabel = 'VoiceAI home',
}: BrandLogoProps) {
  return (
    <Link to={to} className={cn('group flex items-center gap-2', className)} aria-label={ariaLabel}>
      <VoiceIcon
        className={cn(
          'h-6 w-6 text-brand transition-transform duration-300 group-hover:scale-105',
          iconClassName,
        )}
      />
      {showWordmark && (
        <span className="font-display text-lg font-semibold tracking-tight text-ink">VoiceAI</span>
      )}
    </Link>
  )
}
