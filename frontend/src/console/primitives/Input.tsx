import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react'
import type { IconComponent } from '../icons'

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  icon?: IconComponent
  suffix?: ReactNode
  wrapStyle?: CSSProperties
}

export function Input({ icon: IconEl, suffix, style, wrapStyle, ...rest }: InputProps) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', ...wrapStyle }}>
      {IconEl && (
        <IconEl size={14} style={{ position: 'absolute', left: 10, color: 'var(--lattice-text-3)', pointerEvents: 'none' }} />
      )}
      <input
        style={{
          width: '100%',
          height: 32,
          padding: IconEl ? '0 12px 0 30px' : '0 12px',
          background: 'var(--lattice-surface)',
          color: 'var(--lattice-text)',
          border: '1px solid var(--lattice-border)',
          borderRadius: 'var(--lattice-radius)',
          fontSize: 13,
          outline: 'none',
          transition: 'border-color 120ms',
          ...style,
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--lattice-accent)' }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--lattice-border)' }}
        {...rest}
      />
      {suffix && (
        <span style={{ position: 'absolute', right: 10, color: 'var(--lattice-text-3)', fontSize: 11 }}>{suffix}</span>
      )}
    </div>
  )
}
