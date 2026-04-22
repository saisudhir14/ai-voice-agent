import type { CSSProperties, ChangeEvent } from 'react'

export type SelectOption = { value: string; label: string }

type SelectProps = {
  value: string
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
  options: Array<SelectOption | string>
  style?: CSSProperties
}

export function Select({ value, onChange, options, style }: SelectProps) {
  const arrow = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/></svg>")`
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        height: 32,
        padding: '0 28px 0 10px',
        background: 'var(--lattice-surface)',
        border: '1px solid var(--lattice-border)',
        borderRadius: 'var(--lattice-radius)',
        fontSize: 13,
        color: 'var(--lattice-text)',
        cursor: 'pointer',
        outline: 'none',
        appearance: 'none',
        backgroundImage: arrow,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
        ...style,
      }}
    >
      {options.map((o) => {
        const val = typeof o === 'string' ? o : o.value
        const label = typeof o === 'string' ? o : o.label
        return <option key={val} value={val}>{label}</option>
      })}
    </select>
  )
}
