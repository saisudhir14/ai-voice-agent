import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/lib/api'
import { registerSchema, type RegisterInput } from '@/lib/schemas'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { MkButton } from '@/components/landing/mk-button'
import { AuthLayout, AuthSignupAside } from '@/components/shared/auth-layout'
import { InputField, PasswordField } from '@/components/shared/form-field'

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
      const response = await authApi.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        company: formData.company || undefined,
      })
      const { user, access_token, refresh_token } = response.data
      setAuth(user, access_token, refresh_token)
      toast.success('Account created. Welcome to VoiceAI.')
      navigate({ to: '/dashboard' })
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
      toast.error(message || 'Sign up failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      mode="register"
      title="Sign up"
      description="Create your account to start building voice agents."
      aside={<AuthSignupAside />}
      footer={null}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField
          label="Name"
          name="name"
          type="text"
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your name"
          error={errors.name}
          required
          className="h-11 rounded-[10px] border-line"
        />

        <InputField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@company.com"
          error={errors.email}
          required
          className="h-11 rounded-[10px] border-line"
        />

        <PasswordField
          label="Create password"
          name="password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.password}
          required
          className="h-11 rounded-[10px] border-line"
        />

        <PasswordField
          label="Confirm password"
          name="confirmPassword"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.confirmPassword}
          required
          className="h-11 rounded-[10px] border-line"
        />

        <p className="text-xs leading-relaxed text-ink-3">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>

        <MkButton type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign up'}
        </MkButton>
      </form>
    </AuthLayout>
  )
}
