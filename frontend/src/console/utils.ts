import type { CSSProperties } from 'react'

export type Tone = 'neutral' | 'accent' | 'success' | 'danger' | 'warn' | 'info'
export type Size = 'sm' | 'md' | 'lg'

export const TONE_VARS: Record<Tone, { bg: string; fg: string; bd: string }> = {
  neutral: { bg: 'var(--lattice-surface-2)', fg: 'var(--lattice-text-2)', bd: 'var(--lattice-border)' },
  accent: { bg: 'var(--lattice-accent-soft)', fg: 'var(--lattice-accent)', bd: 'transparent' },
  success: { bg: 'var(--lattice-accent-soft)', fg: 'var(--lattice-accent)', bd: 'transparent' },
  danger: { bg: 'var(--lattice-danger-soft)', fg: 'var(--lattice-danger)', bd: 'transparent' },
  warn: { bg: 'var(--lattice-warn-soft)', fg: 'var(--lattice-warn)', bd: 'transparent' },
  info: { bg: 'var(--lattice-info-soft)', fg: 'var(--lattice-info)', bd: 'transparent' },
}

export const TONE_FG: Record<Tone, string> = {
  neutral: 'var(--lattice-text-3)',
  accent: 'var(--lattice-accent)',
  success: 'var(--lattice-accent)',
  danger: 'var(--lattice-danger)',
  warn: 'var(--lattice-warn)',
  info: 'var(--lattice-info)',
}

export function formatDuration(seconds: number): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

export function mergeStyle(...styles: Array<CSSProperties | undefined>): CSSProperties {
  return styles.reduce<CSSProperties>((acc, s) => (s ? { ...acc, ...s } : acc), {})
}
