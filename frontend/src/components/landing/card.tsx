import { HTMLAttributes, forwardRef, ElementType } from 'react'
import { cn } from '@/lib/utils'

/* ============================================================
   Card — light-mode surface. Hairline border + soft elevation.
   Minimal by default (Retell-style), with optional hover lift.
   ============================================================ */
interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  tone?: 'paper' | 'paper-2' | 'ink' | 'brand'
  bordered?: boolean
  elevated?: boolean
  interactive?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLElement, CardProps>(
  (
    {
      as: Tag = 'div',
      tone = 'paper',
      bordered = true,
      elevated = false,
      interactive = false,
      padding = 'md',
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <Tag
        ref={ref}
        className={cn(
          'relative rounded-card',
          tone === 'paper' && 'bg-paper',
          tone === 'paper-2' && 'bg-paper-2',
          tone === 'ink' && 'bg-ink-surface text-ink-on',
          tone === 'brand' && 'bg-brand text-ink-on',
          bordered && tone !== 'ink' && tone !== 'brand' && 'border border-line',
          bordered && (tone === 'ink' || tone === 'brand') && 'border border-white/10',
          elevated && 'shadow-mk-sm',
          padding === 'sm' && 'p-5',
          padding === 'md' && 'p-6 sm:p-7',
          padding === 'lg' && 'p-8 sm:p-10',
          interactive &&
            'transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-mk-md hover:border-line-2',
          className,
        )}
        {...props}
      >
        {children}
      </Tag>
    )
  },
)
Card.displayName = 'Card'
