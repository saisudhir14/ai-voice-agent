import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import type { IconComponent } from '../icons'

export type ButtonVariant = 'default' | 'secondary' | 'ghost' | 'outline' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: IconComponent
  iconRight?: IconComponent
  children?: ReactNode
}

const VARIANT_STYLES: Record<ButtonVariant, CSSProperties> = {
  default: {
    background: 'var(--lattice-accent)',
    color: 'var(--lattice-accent-fg)',
    boxShadow: 'var(--lattice-shadow-sm)',
  },
  secondary: {
    background: 'var(--lattice-surface)',
    color: 'var(--lattice-text)',
    border: '1px solid var(--lattice-border)',
    boxShadow: 'var(--lattice-shadow-sm)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--lattice-text-2)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--lattice-text)',
    border: '1px solid var(--lattice-border)',
  },
  danger: {
    background: 'var(--lattice-danger)',
    color: '#fff',
  },
}

export function Button({
  variant = 'default',
  size = 'md',
  icon: IconEl,
  iconRight: IconRight,
  children,
  style,
  ...rest
}: ButtonProps) {
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontWeight: 500,
    fontSize: size === 'sm' ? 12.5 : 13,
    letterSpacing: '-0.005em',
    borderRadius: 'var(--lattice-radius)',
    cursor: rest.disabled ? 'not-allowed' : 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 120ms ease',
    border: '1px solid transparent',
    padding: size === 'sm' ? '0 10px' : '0 12px',
    height: size === 'sm' ? 28 : size === 'lg' ? 38 : 32,
    opacity: rest.disabled ? 0.6 : 1,
  }

  return (
    <button style={{ ...base, ...VARIANT_STYLES[variant], ...style }} {...rest}>
      {IconEl && <IconEl size={14} />}
      {children}
      {IconRight && <IconRight size={14} />}
    </button>
  )
}
