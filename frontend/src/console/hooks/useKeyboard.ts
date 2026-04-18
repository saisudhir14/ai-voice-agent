import { useEffect } from 'react'

type Handler = (event: KeyboardEvent) => void

export function useKeyboardShortcut(
  key: string,
  handler: Handler,
  opts: { meta?: boolean; ctrl?: boolean; shift?: boolean; preventDefault?: boolean } = {},
) {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const matchesKey = e.key.toLowerCase() === key.toLowerCase()
      const matchesMeta = opts.meta ? e.metaKey || e.ctrlKey : true
      const matchesShift = opts.shift ? e.shiftKey : true
      if (matchesKey && matchesMeta && matchesShift) {
        if (opts.preventDefault !== false) e.preventDefault()
        handler(e)
      }
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [key, handler, opts.meta, opts.shift, opts.preventDefault, opts.ctrl])
}

export function useEscape(handler: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handler()
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [enabled, handler])
}
