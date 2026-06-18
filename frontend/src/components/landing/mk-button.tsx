import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/* ============================================================
   MkButton — marketing button system (distinct from app Button).
   Crisp 10px radius, token-driven colors, single accent.
   ============================================================ */
const mkButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mk-brand-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-ink-on hover:bg-brand-ink shadow-mk-xs',
        secondary: 'bg-paper text-ink border border-line hover:bg-paper-2 hover:border-line-2',
        ghost: 'text-ink-2 hover:bg-paper-2 hover:text-ink',
        'on-ink': 'bg-paper text-ink hover:bg-paper-2',
        'ghost-on-ink': 'text-ink-on/80 hover:bg-white/10 hover:text-ink-on',
      },
      size: {
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface MkButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof mkButtonVariants> {
  asChild?: boolean
}

export const MkButton = React.forwardRef<HTMLButtonElement, MkButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp ref={ref} className={cn(mkButtonVariants({ variant, size, className }))} {...props} />
  },
)
MkButton.displayName = 'MkButton'

export { mkButtonVariants }
