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

// OPTION 1: Simple solution - use /auth/login-json
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/auth/login-json', credentials)
  return response.data
}

// OPTION 2: If you want to keep using /auth/login with separate /auth/me call
export const loginWithStandardOAuth = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const formData = new URLSearchParams()
  formData.append('username', credentials.username)
  formData.append('password', credentials.password)
  
  const response = await api.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  
  const { access_token, token_type } = response.data
  
  // Get user info from /auth/me
  const userResponse = await api.get('/auth/me', {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  })
  
  return {
    access_token,
    token_type,
    user: userResponse.data
  }
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