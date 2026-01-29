import api from './api'
import { type WithdrawalRequest } from '../types'

export const createWithdrawalRequest = async (amount: number): Promise<WithdrawalRequest> => {
  const response = await api.post('/withdrawal/request', { amount })
  return response.data
}

export const getMyWithdrawals = async (params?: {
  skip?: number
  limit?: number
  status?: string
}): Promise<WithdrawalRequest[]> => {
  const response = await api.get('/withdrawal/my-requests', { params })
  return response.data
}

export const getAllWithdrawals = async (params?: {
  skip?: number
  limit?: number
  status?: string
}): Promise<WithdrawalRequest[]> => {
  const response = await api.get('/withdrawal/all', { params })
  return response.data
}

export const processWithdrawal = async (
  requestId: number, 
  data: { status: string; admin_notes?: string }
): Promise<WithdrawalRequest> => {
  const response = await api.put(`/withdrawal/${requestId}/process`, data)
  return response.data
}