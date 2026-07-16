import type { CSSProperties, ReactNode } from 'react'
import { TONE_FG, type Tone } from '../utils'

type StatusDotProps = { tone?: Tone; pulse?: boolean; size?: number }
export function StatusDot({ tone = 'success', pulse, size = 8 }: StatusDotProps) {
  const color = TONE_FG[tone]
  return (
    <span style={{ position: 'relative', width: size, height: size, display: 'inline-block', flexShrink: 0 }} aria-hidden="true">
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color }} />
      {pulse && <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, animation: 'lattice-pulse-ring 1.8s infinite' }} />}
    </span>
  )
}

export function KBD({ children }: { children: ReactNode }) {
  return (
    <kbd style={{ fontFamily: 'var(--lattice-mono)', fontSize: 10.5, padding: '1px 5px', background: 'var(--lattice-surface-2)', border: '1px solid var(--lattice-border)', borderBottomWidth: 2, borderRadius: 4, color: 'var(--lattice-text-2)' }}>
      {children}
    </kbd>
  )
}

type ProgressProps = { value: number; tone?: 'accent' | 'danger' | 'warn' }
export function Progress({ value, tone = 'accent' }: ProgressProps) {
  const colors = { accent: 'var(--lattice-accent)', danger: 'var(--lattice-danger)', warn: 'var(--lattice-warn)' }
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100} style={{ width: '100%', height: 4, background: 'var(--lattice-surface-2)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ width: `${clamped}%`, height: '100%', background: colors[tone], transition: 'width 300ms' }} />
    </div>
  )
}

const AVATAR_PALETTE = ['oklch(0.88 0.05 160)', 'oklch(0.9 0.05 250)', 'oklch(0.9 0.05 295)', 'oklch(0.9 0.06 55)', 'oklch(0.9 0.05 200)']
type AvatarProps = { name?: string; size?: number; tone?: string }
export function Avatar({ name = 'U', size = 28, tone }: AvatarProps) {
  const hash = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % AVATAR_PALETTE.length
  const bg = tone || AVATAR_PALETTE[hash]
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 600, color: '#1a1a1a', flexShrink: 0 }} aria-label={name}>
      {initials}
    </div>
  )
}

type SegmentedOption<T extends string> = { v: T; l: string }
type SegControlProps<T extends string> = { value: T; onChange: (v: T) => void; options: SegmentedOption<T>[] }
export function SegControl<T extends string>({ value, onChange, options }: SegControlProps<T>) {
  return (
    <div style={{ display: 'flex', background: 'var(--lattice-surface-2)', border: '1px solid var(--lattice-border)', borderRadius: 6, padding: 2 }}>
      {options.map((o) => {
        const active = value === o.v
        return (
          <button key={o.v} onClick={() => onChange(o.v)} style={{ flex: 1, height: 26, fontSize: 12, border: 'none', background: active ? 'var(--lattice-surface)' : 'transparent', boxShadow: active ? 'var(--lattice-shadow-sm)' : 'none', color: active ? 'var(--lattice-text)' : 'var(--lattice-text-2)', borderRadius: 4, cursor: 'pointer', fontWeight: active ? 500 : 400 }}>
            {o.l}
          </button>
        )
      })}
    </div>
  )
}

type ConfigRowProps = { k: ReactNode; v: ReactNode; style?: CSSProperties }
export function ConfigRow({ k, v, style }: ConfigRowProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', fontSize: 12.5, ...style }}>
      <span style={{ color: 'var(--lattice-text-3)' }}>{k}</span>
      <span>{v}</span>
    </div>
  )
}

type EmptyStateProps = { title: string; description?: string; icon?: ReactNode; action?: ReactNode }
export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div style={{ padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'var(--lattice-text-3)' }}>
      {icon}
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--lattice-text)' }}>{title}</div>
      {description && <div style={{ fontSize: 12.5, maxWidth: 360 }}>{description}</div>}
      {action}
    </div>
  )
}

type SkeletonProps = { height?: number | string; width?: number | string; style?: CSSProperties }
export function Skeleton({ height = 16, width = '100%', style }: SkeletonProps) {
  return (
    <div style={{ height, width, background: 'var(--lattice-surface-2)', borderRadius: 4, position: 'relative', overflow: 'hidden', ...style }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, var(--lattice-surface-3) 50%, transparent)', animation: 'lattice-shimmer-bar 1.6s infinite linear' }} />
    </div>
  )
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', color: 'var(--lattice-text-3)' }}>
      <Skeleton width={200} height={12} />
      <Skeleton width={260} height={12} />
      <Skeleton width={180} height={12} />
      <div style={{ fontSize: 12, marginTop: 8 }}>{label}</div>
    </div>
  )
}

type ErrorStateProps = { title?: string; message?: string; retry?: () => void }
export function ErrorState({ title = 'Something went wrong', message = 'Please try again in a moment.', retry }: ErrorStateProps) {
  return (
    <div style={{ padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--lattice-danger)' }}>{title}</div>
      <div style={{ fontSize: 12.5, color: 'var(--lattice-text-3)' }}>{message}</div>
      {retry && <button onClick={retry} style={{ marginTop: 4, padding: '6px 10px', background: 'transparent', border: '1px solid var(--lattice-border)', borderRadius: 6, color: 'var(--lattice-text)', fontSize: 12, cursor: 'pointer' }}>Retry</button>}
    </div>
  )
}
