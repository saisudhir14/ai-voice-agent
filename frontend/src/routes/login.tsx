import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/lib/api'
import { loginSchema, type LoginInput } from '@/lib/schemas'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { MkButton } from '@/components/landing/mk-button'
import { AuthLayout, AuthSigninAside } from '@/components/shared/auth-layout'
import { InputField, PasswordField } from '@/components/shared/form-field'

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
      toast.success('Welcome back.')
      navigate({ to: '/dashboard' })
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
      toast.error(message || 'Sign in failed. Check your email and password.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      mode="login"
      title="Sign in"
      description="Welcome back. Sign in to manage your voice agents."
      aside={<AuthSigninAside />}
      footer={null}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
          label="Password"
          name="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.password}
          required
          className="h-11 rounded-[10px] border-line"
          labelAction={
            <a href="#" className="text-sm text-ink-3 transition-colors hover:text-brand-ink">
              Forgot password?
            </a>
          }
        />

        <MkButton type="submit" variant="primary" size="lg" className="mt-2 w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign in'}
        </MkButton>
      </form>
    </AuthLayout>
  )
}
