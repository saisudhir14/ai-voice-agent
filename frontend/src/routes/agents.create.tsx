import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { agentsApi, industriesApi } from '@/lib/api'
import { createAgentSchema, type CreateAgentInput } from '@/lib/schemas'
import { Bot, Loader2, Check, ArrowLeft, ArrowRight, Sparkles, BrainCircuit } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  PageLoading, 
  GradientBackground, 
  AnimatedSection, 
  SpotlightCard 
} from '@/components/shared'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

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
    setStep(2) // Auto-advance to next step
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
      
      // Navigate to step with errors
      if (fieldErrors.industry_id) setStep(1)
      else if (fieldErrors.name) setStep(2)
      return
    }

    setSubmitting(true)
    try {
      const response = await agentsApi.create(formData)
      toast.success('Agent initialized successfully!')
      navigate({ to: '/agents/$agentId', params: { agentId: response.data.id } })
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to initialize agent')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoading />

  return (
    <div className="min-h-screen relative overflow-hidden bg-nebula-deep">
      <GradientBackground intensity="low" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 mt-20">
        <AnimatedSection>
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => step > 1 ? setStep(step - 1) : navigate({ to: '/agents' })}
              className="rounded-full bg-white/5 text-slate-400"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Initialize Persona</h1>
              <p className="text-slate-500 text-sm">Step {step} of 3: {step === 1 ? 'Industry Selection' : step === 2 ? 'Identity' : 'Cognitive Config'}</p>
            </div>
          </div>
        </AnimatedSection>

        {/* Step Progress Bar */}
        <div className="flex gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-500",
                step >= s ? "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" : "bg-white/5"
              )}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Choose an Industry Template</h2>
                  <p className="text-slate-400">Templates come with pre-optimized system prompts for specific use cases.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {industries.map((industry) => (
                    <button
                      key={industry.id}
                      type="button"
                      onClick={() => handleIndustrySelect(industry)}
                      className={cn(
                        "group relative p-6 rounded-2xl border transition-all duration-300 text-center",
                        selectedIndustry?.id === industry.id
                          ? "bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                          : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
                      )}
                    >
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{industryIcons[industry.slug] || '🤖'}</div>
                      <div className={cn("font-bold text-sm tracking-tight", selectedIndustry?.id === industry.id ? "text-cyan-400" : "text-slate-300")}>
                        {industry.name}
                      </div>
                      {selectedIndustry?.id === industry.id && (
                        <div className="absolute top-2 right-2 h-5 w-5 bg-cyan-500 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-black font-bold" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {errors.industry_id && (
                  <p className="text-red-400 text-sm mt-4 font-medium flex items-center gap-2">
                    <span className="h-1 w-1 bg-red-400 rounded-full" /> {errors.industry_id}
                  </p>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <SpotlightCard className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <Bot className="h-6 w-6 text-orange-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Identity & Role</h3>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Agent Designation</label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Nova Support Unit"
                        className="h-14 bg-white/5 border-white/5 rounded-xl focus:border-orange-500/50 focus:ring-orange-500/20 text-lg"
                      />
                      {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Core Directive</label>
                      <Input
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Brief summary of the agent's primary goal"
                        className="h-14 bg-white/5 border-white/5 rounded-xl focus:border-orange-500/50 focus:ring-orange-500/20"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between mt-12">
                    <Button type="button" variant="ghost" onClick={() => setStep(1)} className="text-slate-400">Back</Button>
                    <Button type="button" onClick={() => setStep(3)} className="bg-white text-black hover:bg-slate-200 rounded-full px-8">
                      Configure AI <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </SpotlightCard>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <SpotlightCard className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <BrainCircuit className="h-6 w-6 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Cognitive Programming</h3>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">System Protocol</label>
                        <Badge variant="outline" className="text-[10px] text-cyan-400 border-cyan-500/30">AI Directive</Badge>
                      </div>
                      <Textarea
                        name="system_prompt"
                        value={formData.system_prompt}
                        onChange={handleChange}
                        placeholder="Define the behavior, constraints, and knowledge base..."
                        className="min-h-[200px] bg-white/5 border-white/5 rounded-xl focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-300 leading-relaxed"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Initial Greeting</label>
                        <Sparkles className="h-4 w-4 text-cyan-400" />
                      </div>
                      <Input
                        name="greeting"
                        value={formData.greeting}
                        onChange={handleChange}
                        placeholder="The first words the agent speaks..."
                        className="h-14 bg-white/5 border-white/5 rounded-xl focus:border-cyan-500/50 focus:ring-cyan-500/20"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between mt-12 pt-8 border-t border-white/5">
                    <Button type="button" variant="ghost" onClick={() => setStep(2)} className="text-slate-400">Back</Button>
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="bg-cyan-500 hover:bg-cyan-400 text-white rounded-full px-10 h-14 font-bold shadow-xl shadow-cyan-500/20"
                    >
                      {submitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Bot className="h-5 w-5 mr-2" />
                          Initialize Agent
                        </>
                      )}
                    </Button>
                  </div>
                </SpotlightCard>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  )
}

// Re-using local components for better styling
const Input = ({ className, ...props }: any) => (
  <input
    className={cn(
      "flex w-full px-4 py-2 transition-smooth outline-none",
      className
    )}
    {...props}
  />
)