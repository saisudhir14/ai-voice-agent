import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'
export type Accent = 'emerald' | 'blue' | 'violet' | 'orange'
export type Density = 'compact' | 'balanced' | 'comfortable'
export type SidebarMode = 'rail' | 'expanded'

export type Tweaks = { theme: Theme; accent: Accent; density: Density; sidebar: SidebarMode }

const DEFAULT_TWEAKS: Tweaks = { theme: 'light', accent: 'emerald', density: 'balanced', sidebar: 'expanded' }
const STORAGE_KEY = 'lattice.tweaks'

function readTweaks(): Tweaks {
  if (typeof window === 'undefined') return DEFAULT_TWEAKS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_TWEAKS
    return { ...DEFAULT_TWEAKS, ...(JSON.parse(raw) as Partial<Tweaks>) }
  } catch {
    return DEFAULT_TWEAKS
  }
}

export function useTweaks() {
  const [tweaks, setTweaks] = useState<Tweaks>(readTweaks)

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tweaks)) } catch { /* ignore */ }
  }, [tweaks])

  const update = useCallback(<K extends keyof Tweaks>(key: K, value: Tweaks[K]) => {
    setTweaks((t) => ({ ...t, [key]: value }))
  }, [])

  const toggleTheme = useCallback(() => {
    setTweaks((t) => ({ ...t, theme: t.theme === 'light' ? 'dark' : 'light' }))
  }, [])

  return { tweaks, update, toggleTheme, setTweaks }
}
