import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/lib/api'
import { registerSchema, type RegisterInput } from '@/lib/schemas'
import { Mic, Mail, Lock, User, Loader2, ArrowRight, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { 
  GradientBackground, 
  SpotlightCard, 
  AnimatedSection 
} from '@/components/shared'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<RegisterInput>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = registerSchema.safeParse(formData)
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

    setIsLoading(true)
    try {
      // Only send required fields to API (exclude confirmPassword)
      const response = await authApi.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        company: formData.company || undefined,
      })
      const { user, access_token, refresh_token } = response.data
      setAuth(user, access_token, refresh_token)
      toast.success('Registration complete. Welcome to VoiceAI.')
      navigate({ to: '/dashboard' })
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-nebula-deep flex items-center justify-center p-6">
      <GradientBackground intensity="medium" />
      
      <div className="relative z-10 w-full max-w-md mt-12">
        <AnimatedSection>
          <div className="text-center mb-10">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center mb-6 shadow-xl shadow-slate-500/20">
              <Mic className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tighter">Join the Collective</h1>
            <p className="text-slate-500 mt-2">Initialize your creator account</p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <SpotlightCard className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Identity</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-slate-400 transition-colors" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/5 rounded-xl focus:border-slate-500/50 focus:ring-slate-500/20 text-white outline-none transition-all"
                    placeholder="Commander Shepard"
                  />
                </div>
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Digital Mail</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-slate-400 transition-colors" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/5 rounded-xl focus:border-slate-500/50 focus:ring-slate-500/20 text-white outline-none transition-all"
                    placeholder="you@domain.com"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Secure Access Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-slate-400 transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/5 rounded-xl focus:border-slate-500/50 focus:ring-slate-500/20 text-white outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Confirm Access Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-slate-400 transition-colors" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/5 rounded-xl focus:border-slate-500/50 focus:ring-slate-500/20 text-white outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <div className="flex items-center gap-3 py-2">
                <div className="h-10 w-10 rounded-lg bg-slate-500/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-500 leading-tight uppercase tracking-tighter">By joining, you agree to our Protocol Terms and Data Encryption standards.</p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 mt-2 bg-white text-black hover:bg-slate-200 rounded-xl font-bold text-lg shadow-xl shadow-white/5 transition-all" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Initialize Account <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>
          </SpotlightCard>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <p className="text-center text-slate-500 mt-8 text-sm">
            Already registered?{' '}
            <Link to="/login" className="text-slate-400 hover:text-slate-300 font-bold transition-colors">
              Decrypt Login
            </Link>
          </p>
        </AnimatedSection>
      </div>
    </div>
  )
}