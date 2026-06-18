import { ReactNode, ElementType, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { AnimatedSection } from '@/components/shared'

/* ============================================================
   Container — single max-width + responsive gutters.
   Every page section composes this. No ad-hoc max-w/px.
   ============================================================ */
interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType
  size?: 'default' | 'narrow' | 'prose'
}

export function Container({ as: Tag = 'div', size = 'default', className, ...props }: ContainerProps) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full px-5 sm:px-6 lg:px-8',
        size === 'default' && 'max-w-container',
        size === 'narrow' && 'max-w-4xl',
        size === 'prose' && 'max-w-3xl',
        className,
      )}
      {...props}
    />
  )
}

/* ============================================================
   Section — consistent vertical rhythm + optional surface.
   tone controls background; spacing follows an 8pt scale.
   ============================================================ */
interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: 'paper' | 'paper-2' | 'ink'
  spacing?: 'default' | 'compact' | 'loose'
  divider?: boolean
}

export function Section({
  tone = 'paper',
  spacing = 'default',
  divider = false,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        'relative',
        spacing === 'compact' && 'py-14 sm:py-16',
        spacing === 'default' && 'py-20 sm:py-24 lg:py-32',
        spacing === 'loose' && 'py-24 sm:py-32 lg:py-40',
        tone === 'paper' && 'bg-paper',
        tone === 'paper-2' && 'bg-paper-2',
        tone === 'ink' && 'bg-ink-surface text-ink-on',
        divider && 'border-t border-line',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  )
}

/* ============================================================
   Eyebrow — overline label above a heading.
   ============================================================ */
interface EyebrowProps {
  children: ReactNode
  className?: string
  onDark?: boolean
}

export function Eyebrow({ children, className, onDark = false }: EyebrowProps) {
  return (
    <p
      className={cn(
        'text-eyebrow uppercase',
        onDark ? 'text-brand-tint' : 'text-brand-ink',
        className,
      )}
    >
      {children}
    </p>
  )
}

/* ============================================================
   Typography — Display (hero), SectionTitle, Lede, Text.
   All sizes/tracking come from the type-scale tokens.
   ============================================================ */
type DisplaySize = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface DisplayProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: ElementType
  size?: DisplaySize
  onDark?: boolean
  balance?: boolean
}

const displaySizeClass: Record<DisplaySize, string> = {
  sm: 'text-display-sm',
  md: 'text-display-md',
  lg: 'text-display-lg',
  xl: 'text-2xl sm:text-display-lg lg:text-display-xl',
  '2xl': 'text-display-lg sm:text-display-xl lg:text-display-2xl',
}

export function Display({
  as: Tag = 'h1',
  size = 'xl',
  onDark = false,
  balance = true,
  className,
  children,
  ...props
}: DisplayProps) {
  return (
    <Tag
      className={cn(
        'font-display',
        displaySizeClass[size],
        onDark ? 'text-ink-on' : 'text-ink',
        balance && '[text-wrap:balance]',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

interface SectionTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: ElementType
  onDark?: boolean
}

export function SectionTitle({ as: Tag = 'h2', onDark = false, className, children, ...props }: SectionTitleProps) {
  return (
    <Tag
      className={cn(
        'font-display text-display-sm sm:text-display-md [text-wrap:balance]',
        onDark ? 'text-ink-on' : 'text-ink',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

interface LedeProps extends HTMLAttributes<HTMLParagraphElement> {
  onDark?: boolean
}

export function Lede({ onDark = false, className, children, ...props }: LedeProps) {
  return (
    <p
      className={cn(
        'text-lg leading-relaxed [text-wrap:pretty]',
        onDark ? 'text-ink-on/70' : 'text-ink-2',
        className,
      )}
      {...props}
    >
      {children}
    </p>
  )
}

/* ============================================================
   SectionHeader — eyebrow + title + lede, centered or left.
   ============================================================ */
interface SectionHeaderProps {
  eyebrow?: string
  title: ReactNode
  lede?: ReactNode
  align?: 'center' | 'left'
  onDark?: boolean
  className?: string
}

export function SectionHeader({
  eyebrow,
  title,
  lede,
  align = 'center',
  onDark = false,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'mx-auto max-w-2xl text-center items-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow && (
        <AnimatedSection delay={0.05}>
          <Eyebrow onDark={onDark}>{eyebrow}</Eyebrow>
        </AnimatedSection>
      )}
      <AnimatedSection delay={0.1}>
        <SectionTitle onDark={onDark}>{title}</SectionTitle>
      </AnimatedSection>
      {lede && (
        <AnimatedSection delay={0.15}>
          <Lede onDark={onDark}>{lede}</Lede>
        </AnimatedSection>
      )}
    </div>
  )
}

/* ============================================================
   SectionBlock — Section + Container + optional header.
   The standard wrapper for a marketing section.
   ============================================================ */
interface SectionBlockProps {
  id?: string
  eyebrow?: string
  title?: ReactNode
  lede?: ReactNode
  tone?: 'paper' | 'paper-2' | 'ink'
  spacing?: 'default' | 'compact' | 'loose'
  divider?: boolean
  align?: 'center' | 'left'
  containerSize?: 'default' | 'narrow' | 'prose'
  className?: string
  headerClassName?: string
  children: ReactNode
}

export function SectionBlock({
  id,
  eyebrow,
  title,
  lede,
  tone = 'paper',
  spacing = 'default',
  divider = false,
  align = 'center',
  containerSize = 'default',
  className,
  headerClassName,
  children,
}: SectionBlockProps) {
  const onDark = tone === 'ink'
  return (
    <Section id={id} tone={tone} spacing={spacing} divider={divider} className={className}>
      <Container size={containerSize}>
        {(eyebrow || title) && (
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            lede={lede}
            align={align}
            onDark={onDark}
            className={cn('mb-12 sm:mb-16', headerClassName)}
          />
        )}
        {children}
      </Container>
    </Section>
  )
}

/* ============================================================
   Badge — small pill (status / category).
   ============================================================ */
interface BadgeProps {
  children: ReactNode
  className?: string
  variant?: 'brand' | 'neutral' | 'outline'
  icon?: ReactNode
}

export function MkBadge({ children, className, variant = 'neutral', icon }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-medium',
        variant === 'brand' && 'bg-brand-tint text-brand-ink',
        variant === 'neutral' && 'bg-paper-3 text-ink-2',
        variant === 'outline' && 'border border-line text-ink-2',
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}
