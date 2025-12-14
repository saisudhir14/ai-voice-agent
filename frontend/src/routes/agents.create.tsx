import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { agentsApi, industriesApi } from '@/lib/api'
import { createAgentSchema, type CreateAgentInput } from '@/lib/schemas'
import { Bot, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { InputField, TextareaField } from '@/components/shared/form-field'
import { PageLoading } from '@/components/shared/loading'
import { cn } from '@/lib/utils'

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
  'sales': '📈',
  'healthcare': '🏥',
  'real-estate': '🏠',
  'restaurant': '🍽️',
  'legal': '⚖️',
  'education': '🎓',
  'custom': '⚙️',
}

export function CreateAgentPage() {
  const navigate = useNavigate()
  const [industries, setIndustries] = useState<Industry[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null)
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
      } catch (error) {
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
      return
    }

    setSubmitting(true)
    try {
      const response = await agentsApi.create(formData)
      toast.success('Agent created successfully!')
      navigate({ to: '/agents/$agentId', params: { agentId: response.data.id } })
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } }
      toast.error(err.response?.data?.error || 'Failed to create agent')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <PageLoading />
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader
        title="Create Voice Agent"
        description="Set up a new AI voice assistant for your business"
        onBack={() => navigate({ to: '/agents' })}
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Select Industry */}
        <Card>
          <CardHeader>
            <CardTitle>1. Select Industry</CardTitle>
            <CardDescription>Choose an industry to get pre-configured prompts and behavior</CardDescription>
          </CardHeader>
          <CardContent>
            {errors.industry_id && (
              <p className="text-destructive text-sm mb-4">{errors.industry_id}</p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {industries.map((industry) => (
                <button
                  key={industry.id}
                  type="button"
                  onClick={() => handleIndustrySelect(industry)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-center transition-all",
                    selectedIndustry?.id === industry.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <div className="text-3xl mb-2">{industryIcons[industry.slug] || '🤖'}</div>
                  <div className="font-medium text-sm">{industry.name}</div>
                  {selectedIndustry?.id === industry.id && (
                    <Check className="h-4 w-4 text-primary mx-auto mt-2" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Agent Details */}
        <Card>
          <CardHeader>
            <CardTitle>2. Agent Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InputField
              label="Agent Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Customer Support Assistant"
              error={errors.name}
              required
            />

            <InputField
              label="Description"
              name="description"
              type="text"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of this agent's purpose"
            />
          </CardContent>
        </Card>

        {/* Step 3: AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>3. AI Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextareaField
              label="System Prompt"
              name="system_prompt"
              value={formData.system_prompt}
              onChange={handleChange}
              placeholder="You are a helpful assistant..."
              hint="Instructions that define how your agent should behave"
              className="h-40"
            />

            <InputField
              label="Greeting Message"
              name="greeting"
              type="text"
              value={formData.greeting}
              onChange={handleChange}
              placeholder="Hello! How can I help you today?"
              hint="The first message your agent will say"
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="secondary" onClick={() => navigate({ to: '/agents' })}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Bot className="h-4 w-4" />
                Create Agent
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
