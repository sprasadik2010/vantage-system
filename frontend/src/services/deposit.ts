import api from './api'

export interface Deduction {
  id: number
  user_id: number
  amount: number
  deduction_type: string
  description: string
  related_deposit_id: number
  created_at: string
  admin_notes?: string
}

export interface DeductionSummary {
  total_deducted: number
  deduction_count: number
  recent_deductions: Deduction[]
}

export const depositService = {
  // Get user's deductions
  getMyDeductions: (limit: number = 100) =>
    api.get<Deduction[]>('/deposit/deductions/my-deductions', { params: { limit } }),

  // Get deduction summary
  getDeductionSummary: () =>
    api.get<DeductionSummary>('/deposit/deductions/deduction-summary'),

  // Admin: Get user's deductions
  getUserDeductions: (userId: number) =>
    api.get<Deduction[]>(`/deposit/admin/deductions/${userId}`),
}
