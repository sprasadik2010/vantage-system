import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface User {
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

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      const { user, accessToken } = action.payload
      state.user = user
      state.accessToken = accessToken
      state.isAuthenticated = true
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('access_token', accessToken)
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      localStorage.removeItem('user')
      localStorage.removeItem('access_token')
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        localStorage.setItem('user', JSON.stringify(state.user))
      }
    },
  },
})

export const { setCredentials, logout, updateUser } = authSlice.actions
export default authSlice.reducer