import { useEffect, useState } from 'react'
import { createFileRoute, Link, useParams, useNavigate } from '@tanstack/react-router'
import { agentsApi } from '@/lib/api'
import { updateAgentSchema, type UpdateAgentInput } from '@/lib/schemas'
import { Mic, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/shared/page-header'
import { InputField, TextareaField } from '@/components/shared/form-field'
import { PageLoading } from '@/components/shared/loading'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/agents/$agentId')({
  component: AgentDetailPage,
})

interface Agent {
  id: string
  name: string
  description: string
  system_prompt: string
  greeting: string
  voice_id: string
  llm_model: string
  temperature: number
  is_active: boolean
  industry: {
    id: string
    name: string
    slug: string
  }
}

const llmModels = [
  { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Fast)' },
  { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet (Balanced)' },
  { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Powerful)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast)' },
  { value: 'gpt-4o', label: 'GPT-4o (Powerful)' },
]

const voices = [
  { value: 'a0e99841-438c-4a64-b679-ae501e7d6091', label: 'Barbershop Man' },
  { value: '79a125e8-cd45-4c13-8a67-188112f4dd22', label: 'British Lady' },
  { value: '638efaaa-4d0c-442e-b701-3fae16aad012', label: 'Southern Woman' },
  { value: 'b7d50908-b17c-442d-ad8d-810c63997ed9', label: 'Confident Woman' },
]

export function AgentDetailPage() {
  const { agentId } = useParams({ from: '/agents/$agentId' })
  const navigate = useNavigate()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<UpdateAgentInput>({
    name: '',
    description: '',
    system_prompt: '',
    greeting: '',
    voice_id: '',
    llm_model: '',
    temperature: 0.7,
    is_active: true,
  })

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await agentsApi.get(agentId)
        const data = response.data
        setAgent(data)
        setFormData({
          name: data.name,
          description: data.description || '',
          system_prompt: data.system_prompt,
          greeting: data.greeting || '',
          voice_id: data.voice_id,
          llm_model: data.llm_model,
          temperature: data.temperature,
          is_active: data.is_active,
        })
      } catch (error) {
        toast.error('Agent not found')
        navigate({ to: '/agents' })
      } finally {
        setLoading(false)
      }
    }
    fetchAgent()
  }, [agentId, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = updateAgentSchema.safeParse(formData)
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

    setSaving(true)
    try {
      await agentsApi.update(agentId, formData)
      toast.success('Agent updated successfully!')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } }
      toast.error(err.response?.data?.error || 'Failed to update agent')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <PageLoading />
  }

  if (!agent) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader
        title={agent.name}
        description={agent.industry?.name || 'Custom'}
        onBack={() => navigate({ to: '/agents' })}
        action={
          <Button asChild>
            <Link to="/voice/$agentId" params={{ agentId: agent.id }}>
              <Mic className="h-4 w-4" />
              Test Agent
            </Link>
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />
              <InputField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label className="mb-3 block">Status</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant={formData.is_active ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData((prev) => ({ ...prev, is_active: true }))}
                  className={cn(formData.is_active && "bg-green-600 hover:bg-green-500")}
                >
                  Active
                </Button>
                <Button
                  type="button"
                  variant={!formData.is_active ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setFormData((prev) => ({ ...prev, is_active: false }))}
                >
                  Inactive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>AI Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextareaField
              label="System Prompt"
              name="system_prompt"
              value={formData.system_prompt}
              onChange={handleChange}
              error={errors.system_prompt}
              className="h-40"
              required
            />

            <InputField
              label="Greeting"
              name="greeting"
              value={formData.greeting}
              onChange={handleChange}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>LLM Model</Label>
                <Select value={formData.llm_model} onValueChange={(v) => handleSelectChange('llm_model', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {llmModels.map((model) => (
                      <SelectItem key={model.value} value={model.value}>{model.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Temperature: {formData.temperature}</Label>
                <Slider
                  value={[formData.temperature ?? 0.7]}
                  onValueChange={([value]) => setFormData((prev) => ({ ...prev, temperature: value }))}
                  min={0}
                  max={2}
                  step={0.1}
                  className="mt-3"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Voice Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Voice</Label>
              <Select value={formData.voice_id} onValueChange={(v) => handleSelectChange('voice_id', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.value} value={voice.value}>{voice.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
