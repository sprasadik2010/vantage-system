import api from './api'
import { type User } from '../types'

export const getUsers = async (params?: {
  skip?: number
  limit?: number
  is_active?: boolean
}): Promise<User[]> => {
  const response = await api.get('/users', { params })
  return response.data
}

export const getUserById = async (id: number): Promise<User> => {
  const response = await api.get(`/users/${id}`)
  return response.data
}

// Change this function - it should fetch referrals, not a single user
export const getUserReferrals = async (userId: number): Promise<User[]> => {
  const response = await api.get(`/users/${userId}/referrals`)
  return response.data
}

// Remove or fix the misleading getUserByReferrals function
// If you need it, rename it properly:
export const getReferralsByLevel = async (userId: number, level: number): Promise<User[]> => {
  const response = await api.get(`/users/${userId}/referrals/level/${level}`)
  return response.data
}

export const updateUser = async (id: number, userData: Partial<User>): Promise<User> => {
  const response = await api.put(`/users/${id}`, userData)
  return response.data
}

export const toggle_user_active = async (id: number): Promise<User> => {
  const response = await api.put(`/users/${id}/toggle_user_active`)
  return response.data
}

export const updateUserPassword = async (id: number, passwordData: {
  new_password: string
}): Promise<void> => {
  await api.put(`/users/${id}/password`, passwordData)
}