import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const API_URL = import.meta.env.VITE_API_URL || ''

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = useAuthStore.getState().refreshToken
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          })
          const { access_token, refresh_token, user } = response.data
          useAuthStore.getState().setAuth(user, access_token, refresh_token)
          
          // Retry original request
          error.config.headers.Authorization = `Bearer ${access_token}`
          return api.request(error.config)
        } catch {
          // Refresh failed, logout
          useAuthStore.getState().logout()
        }
      } else {
        useAuthStore.getState().logout()
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; name: string; company?: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refresh_token: refreshToken }),
}

// Industries API
export const industriesApi = {
  list: () => api.get('/industries'),
}

// Agents API
export const agentsApi = {
  list: () => api.get('/agents'),
  
  get: (id: string) => api.get(`/agents/${id}`),
  
  create: (data: {
    industry_id: string
    name: string
    description?: string
    system_prompt?: string
    greeting?: string
    voice_id?: string
    llm_model?: string
    temperature?: number
  }) => api.post('/agents', data),
  
  update: (id: string, data: {
    name?: string
    description?: string
    system_prompt?: string
    greeting?: string
    voice_id?: string
    llm_model?: string
    temperature?: number
    is_active?: boolean
  }) => api.put(`/agents/${id}`, data),
  
  delete: (id: string) => api.delete(`/agents/${id}`),
}

// Conversations API
export const conversationsApi = {
  list: () => api.get('/conversations'),
  
  get: (id: string) => api.get(`/conversations/${id}`),
  
  delete: (id: string) => api.delete(`/conversations/${id}`),
}

// User API
export const userApi = {
  getMe: () => api.get('/users/me'),
  
  updateMe: (data: { name?: string; company?: string }) =>
    api.put('/users/me', data),
}

