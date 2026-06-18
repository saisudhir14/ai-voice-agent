import { ArrowLeft } from 'lucide-react'
import { MkButton } from '@/components/landing/mk-button'
import { Display, Lede } from '@/components/landing/primitives'

interface PageHeaderProps {
  title: string
  description?: string
  backHref?: string
  onBack?: () => void
  action?: React.ReactNode
}

export function PageHeader({ title, description, backHref, onBack, action }: PageHeaderProps) {
  return (
    <div className="mb-8 sm:mb-10">
      {(backHref || onBack) && (
        <MkButton variant="ghost" size="md" onClick={onBack} className="mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </MkButton>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Display as="h1" size="sm" className="mb-1">
            {title}
          </Display>
          {description && <Lede className="text-base">{description}</Lede>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  )
}
