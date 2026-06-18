import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { agentsApi, industriesApi } from '@/lib/api'
import { createAgentSchema, type CreateAgentInput } from '@/lib/schemas'
import { Bot, Loader2, Check, ArrowLeft, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { MkButton } from '@/components/landing/mk-button'
import { Card } from '@/components/landing/card'
import { Container } from '@/components/landing/primitives'
import { AnimatedSection, PageLoading, WizardSteps } from '@/components/shared'
import { InputField, TextareaField } from '@/components/shared/form-field'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

export const Route = createFileRoute('/agents/create')({
  component: CreateAgentPage,
})

interface Industry {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  default_system_prompt: string
  default_greeting: string
}

const industryIcons: Record<string, string> = {
  'customer-support': '🎧',
  sales: '📈',
  healthcare: '🏥',
  'real-estate': '🏠',
  restaurant: '🍽️',
  legal: '⚖️',
  education: '🎓',
  custom: '⚙️',
}

const WIZARD_STEPS = [
  { id: 1, label: 'Industry' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'Behavior' },
]

export function CreateAgentPage() {
  const navigate = useNavigate()
  const [industries, setIndustries] = useState<Industry[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<CreateAgentInput>({
    industry_id: '',
    name: '',
    description: '',
    system_prompt: '',
    greeting: '',
  })

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await industriesApi.list()
        setIndustries(response.data || [])
      } catch {
        toast.error('Failed to load industries')
      } finally {
        setLoading(false)
      }
    }
    fetchIndustries()
  }, [])

  const handleIndustrySelect = (industry: Industry) => {
    setSelectedIndustry(industry)
    setFormData((prev) => ({
      ...prev,
      industry_id: industry.id,
      system_prompt: industry.default_system_prompt,
      greeting: industry.default_greeting,
    }))
    setErrors((prev) => ({ ...prev, industry_id: '' }))
    setStep(2)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = createAgentSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message
        }
      })
      setErrors(fieldErrors)
      if (fieldErrors.industry_id) setStep(1)
      else if (fieldErrors.name) setStep(2)
      return
    }

    setSubmitting(true)
    try {
      const response = await agentsApi.create(formData)
      toast.success('Agent created successfully.')
      navigate({ to: '/agents/$agentId', params: { agentId: response.data.id } })
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
      toast.error(message || 'Failed to create agent')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoading />

  return (
    <Container className="py-10 sm:py-12">
      <AnimatedSection>
        <div className="mb-8 flex items-center gap-4">
          <MkButton
            variant="secondary"
            size="md"
            onClick={() => (step > 1 ? setStep(step - 1) : navigate({ to: '/agents' }))}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </MkButton>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Create agent</h1>
            <p className="mt-1 text-sm text-ink-2">
              Step {step} of 3 — {WIZARD_STEPS[step - 1].label}
            </p>
          </div>
        </div>
      </AnimatedSection>

      <WizardSteps steps={WIZARD_STEPS} current={step} />

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-8">
                <h2 className="font-display text-xl font-semibold text-ink">Choose an industry</h2>
                <p className="mt-2 text-sm text-ink-2">
                  Templates include pre-built prompts tailored to each use case.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {industries.map((industry) => {
                  const selected = selectedIndustry?.id === industry.id
                  return (
                    <button
                      key={industry.id}
                      type="button"
                      onClick={() => handleIndustrySelect(industry)}
                      className="text-left"
                    >
                      <Card
                        interactive
                        padding="md"
                        className={cn(
                          'relative h-full text-center transition-colors',
                          selected && 'border-brand bg-brand-tint/40',
                        )}
                      >
                        <div className="text-3xl mb-3">{industryIcons[industry.slug] || '🤖'}</div>
                        <p className={cn('text-sm font-semibold', selected ? 'text-brand-ink' : 'text-ink')}>
                          {industry.name}
                        </p>
                        {selected && (
                          <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-ink-on">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </Card>
                    </button>
                  )
                })}
              </div>
              {errors.industry_id && (
                <p className="mt-4 text-sm text-destructive">{errors.industry_id}</p>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <Card elevated padding="lg">
                <div className="mb-8 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-tint">
                    <Bot className="h-5 w-5 text-brand-ink" />
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-ink">Agent details</h2>
                    <p className="text-sm text-ink-2">Give your agent a name and short description.</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <InputField
                    label="Agent name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Support Assistant"
                    error={errors.name}
                    required
                    className="h-11 rounded-[10px] border-line"
                  />
                  <InputField
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="What does this agent help with?"
                    error={errors.description}
                    className="h-11 rounded-[10px] border-line"
                  />
                </div>

                <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
                  <MkButton type="button" variant="ghost" size="md" onClick={() => setStep(1)}>
                    Back
                  </MkButton>
                  <MkButton type="button" variant="primary" size="md" onClick={() => setStep(3)}>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </MkButton>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <Card elevated padding="lg">
                <div className="mb-8">
                  <h2 className="font-display text-lg font-semibold text-ink">Behavior & greeting</h2>
                  <p className="mt-1 text-sm text-ink-2">
                    Define how your agent thinks and what it says first.
                  </p>
                </div>

                <div className="space-y-5">
                  <TextareaField
                    label="System prompt"
                    name="system_prompt"
                    value={formData.system_prompt}
                    onChange={handleChange}
                    placeholder="Define behavior, constraints, and knowledge..."
                    error={errors.system_prompt}
                    className="min-h-[180px] rounded-[10px] border-line"
                  />
                  <InputField
                    label="Greeting"
                    name="greeting"
                    value={formData.greeting}
                    onChange={handleChange}
                    placeholder="The first words your agent speaks..."
                    error={errors.greeting}
                    className="h-11 rounded-[10px] border-line"
                  />
                </div>

                <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
                  <MkButton type="button" variant="ghost" size="md" onClick={() => setStep(2)}>
                    Back
                  </MkButton>
                  <MkButton type="submit" variant="primary" size="lg" disabled={submitting}>
                    {submitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Bot className="h-4 w-4" />
                        Create agent
                      </>
                    )}
                  </MkButton>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </Container>
  )
}
