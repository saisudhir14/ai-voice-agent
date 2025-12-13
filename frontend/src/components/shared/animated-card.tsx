import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AnimatedCardProps {
  children: ReactNode
  title?: string
  className?: string
  delay?: number
  hover?: boolean
}

export function AnimatedCard({
  children,
  title,
  className,
  delay = 0,
  hover = true,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={cn('group transition-smooth', className)}
    >
      <Card className="h-full hover:border-primary/50 transition-colors">
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className={!title ? 'p-6' : undefined}>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )
}
