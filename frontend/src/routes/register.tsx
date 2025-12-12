import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/lib/api'
import { registerSchema, type RegisterInput } from '@/lib/schemas'
import { Mic, Mail, Lock, User, Building, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { InputField } from '@/components/shared/form-field'

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
    company: '',
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
        name: formData.name,
        email: formData.email,
        password: formData.password,
        company: formData.company || undefined,
      })
      const { user, access_token, refresh_token } = response.data
      setAuth(user, access_token, refresh_token)
      toast.success('Account created successfully!')
      navigate({ to: '/dashboard' })
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } }
      toast.error(err.response?.data?.error || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
            <Mic className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-2">Start building voice agents today</p>
        </div>

        {/* Form */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Full Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                error={errors.name}
                icon={<User className="h-4 w-4" />}
                required
              />

              <InputField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                error={errors.email}
                icon={<Mail className="h-4 w-4" />}
                required
              />

              <InputField
                label="Company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                placeholder="Acme Inc."
                hint="Optional"
                icon={<Building className="h-4 w-4" />}
              />

              <InputField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.password}
                icon={<Lock className="h-4 w-4" />}
                required
              />

              <InputField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.confirmPassword}
                icon={<Lock className="h-4 w-4" />}
                required
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Login link */}
        <p className="text-center text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
