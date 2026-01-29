import api from './api'
import { type Income } from '../types'

export const getMyIncome = async (params?: {
  skip?: number
  limit?: number
  start_date?: string
  end_date?: string
  income_type?: string
}): Promise<Income[]> => {
  const response = await api.get('/income/my-income', { params })
  return response.data
}

export const getIncomeSummary = async (period: string = 'WEEKLY'): Promise<any> => {
  const response = await api.get('/income/summary', { params: { period } })
  return response.data
}