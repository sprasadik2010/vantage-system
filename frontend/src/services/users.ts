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

export const updateUser = async (id: number, userData: Partial<User>): Promise<User> => {
  const response = await api.put(`/users/${id}`, userData)
  return response.data
}

export const activateUser = async (id: number): Promise<User> => {
  const response = await api.put(`/users/${id}/activate`)
  return response.data
}