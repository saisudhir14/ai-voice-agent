import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  company: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Agent schemas
export const createAgentSchema = z.object({
  industry_id: z.string().uuid('Please select an industry'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  system_prompt: z.string().optional(),
  greeting: z.string().optional(),
  voice_id: z.string().optional(),
  llm_model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
})

export const updateAgentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  system_prompt: z.string().min(10, 'System prompt must be at least 10 characters'),
  greeting: z.string().optional(),
  voice_id: z.string().optional(),
  llm_model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  is_active: z.boolean().optional(),
})

// Types
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CreateAgentInput = z.infer<typeof createAgentSchema>
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>

