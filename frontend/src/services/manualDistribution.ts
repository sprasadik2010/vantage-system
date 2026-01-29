// services/manualDistribution.ts
import api from './api'

export const manualDistributionService = {
  distribute: (data: {
    vantage_username: string
    amount: number
    income_type: string
    notes?: string
    distribution_type?: string
  }) => api.post('/manual-distribution/distribute', data),
  
  getHistory: (skip: number = 0, limit: number = 50) => 
    api.get('/manual-distribution/history', { params: { skip, limit } }),
  
  searchUsers: (query: string) => 
    api.get('/users/search', { params: { q: query } }),
}