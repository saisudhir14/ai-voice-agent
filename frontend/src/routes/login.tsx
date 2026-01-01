import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/lib/api'
import { loginSchema, type LoginInput } from '@/lib/schemas'
import { Mic, Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { 
  GradientBackground, 
  SpotlightCard, 
  AnimatedSection 
} from '@/components/shared'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = loginSchema.safeParse(formData)
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
      const response = await authApi.login(formData)
      const { user, access_token, refresh_token } = response.data
      setAuth(user, access_token, refresh_token)
      toast.success('Access granted. Welcome back.')
      navigate({ to: '/dashboard' })
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Authentication failed')
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
            <h1 className="text-3xl font-bold text-white tracking-tighter">Secure Login</h1>
            <p className="text-slate-500 mt-2">Access your voice intelligence hub</p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <SpotlightCard className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
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
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  <a href="#" className="text-[10px] text-slate-500 hover:text-slate-400 uppercase tracking-tighter transition-colors">Forgot Keys?</a>
                </div>
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

              <Button 
                type="submit" 
                className="w-full h-14 mt-4 bg-white text-black hover:bg-slate-200 rounded-xl font-bold text-lg shadow-xl shadow-white/5 transition-all" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Enter System <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>
          </SpotlightCard>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <p className="text-center text-slate-500 mt-8 text-sm">
            New to the platform?{' '}
            <Link to="/register" className="text-slate-400 hover:text-slate-300 font-bold transition-colors">
              Request Access
            </Link>
          </p>
        </AnimatedSection>
      </div>
    </div>
  )
}