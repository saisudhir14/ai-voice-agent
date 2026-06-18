import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQ {
  q: string
  a: string
}

interface FAQAccordionProps {
  items: FAQ[]
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0)
  const baseId = useId()

  return (
    <div className="mx-auto max-w-3xl">
      <div className="divide-y divide-line overflow-hidden rounded-card border border-line bg-paper">
        {items.map((item, i) => {
          const isOpen = openIdx === i
          const panelId = `${baseId}-panel-${i}`
          const buttonId = `${baseId}-button-${i}`
          return (
            <div key={item.q}>
              <h3>
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="flex w-full items-start justify-between gap-6 px-6 py-5 text-left transition-colors hover:bg-paper-2"
                >
                  <span className="text-base font-medium text-ink">{item.q}</span>
                  <Plus
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200',
                      isOpen && 'rotate-45',
                    )}
                  />
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-sm leading-relaxed text-ink-2">{item.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
