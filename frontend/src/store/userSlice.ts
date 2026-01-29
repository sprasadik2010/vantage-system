import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { type User } from '../types'

interface UserState {
  users: User[]
  selectedUser: User | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    updateUserInList: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id)
      if (index !== -1) {
        state.users[index] = action.payload
      }
    },
  },
})

export const { setUsers, setSelectedUser, setLoading, setError, updateUserInList } = userSlice.actions
export default userSlice.reducer