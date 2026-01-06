import api from './api'
import { type User } from '../types'

interface LoginCredentials {
  username: string
  password: string
}

interface RegisterData {
  email: string
  phone: string
  country: string
  full_name: string
  password: string
  referral_code?: string
}

interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const formData = new FormData()
  formData.append('username', credentials.username)
  formData.append('password', credentials.password)
  
  const response = await api.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', userData)
  return response.data
}

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/auth/me')
  return response.data
}

export const logout = (): void => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('user')
}