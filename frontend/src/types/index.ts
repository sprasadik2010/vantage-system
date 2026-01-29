export interface User {
  id: number
  username: string
  email: string
  phone: string
  country: string
  full_name: string
  vantage_username: string | null
  is_active: boolean
  is_admin: boolean
  is_superadmin: boolean
  wallet_balance: number
  total_earned: number
  total_withdrawn: number
  referral_code: string
  parent_id: number | null
  withdrawal_address: string | null
  withdrawal_qr_code: string | null
  created_at: string
}

export interface Income {
  id: number
  user_id: number
  amount: number
  percentage: number
  level: number
  income_type: 'WEEKLY'
  description: string | null
  source_vantage_username: string
  source_income_amount: number
  created_at: string
}

export interface WithdrawalRequest {
  id: number
  user_id: number
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  admin_notes: string | null
  requested_at: string
  processed_at: string | null
  processed_by: number | null
  user: {
    full_name: string
    email: string
    withdrawal_address: string | null
  }
}

export interface ExcelUpload {
  id: number
  filename: string
  uploaded_by: number
  file_path: string
  is_processed: boolean
  total_rows: number
  processed_rows: number
  error_rows: number
  total_distributed: number
  uploaded_at: string
  processed_at: string | null
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pages: number
}