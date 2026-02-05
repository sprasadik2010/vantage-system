import React, { useState, useEffect, useMemo } from 'react'
import { getUsers, toggle_user_active } from '../../services/users'
import { type User } from '../../types'
import toast from 'react-hot-toast'

const UserActivation: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('inactive')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [filter])

  const fetchUsers = async () => {
    try {
      const allUsers = await getUsers()
      let filteredUsers = allUsers
      
      if (filter === 'active') {
        filteredUsers = allUsers.filter(u => u.is_active)
      } else if (filter === 'inactive') {
        filteredUsers = allUsers.filter(u => !u.is_active)
      }
      
      setUsers(filteredUsers)
    } catch (error) {
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleActivateDeactivate = async (userId: number) => {
    try {
      await toggle_user_active(userId)
      toast.success('User activated successfully')
      fetchUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to activate user')
    }
  }

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users

    const term = searchTerm.toLowerCase()
    return users.filter(user =>
      user.full_name?.toLowerCase().includes(term) ||
      user.username?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.phone?.toLowerCase().includes(term) ||
      user.country?.toLowerCase().includes(term) ||
      user.vantage_username?.toLowerCase().includes(term)
    )
  }, [users, searchTerm])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">User Management</h2>
        
        {/* Filters and Search Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box - Full width on mobile, flexible on desktop */}
          <div className="w-full sm:flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search users by name, email, username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Filter Dropdown - Full width on mobile, auto width on desktop */}
          <div className="w-full sm:w-auto">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full sm:w-48 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {searchTerm && (
        <div className="mb-4 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-700">
            Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} matching "{searchTerm}"
          </p>
        </div>
      )}

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <p className="mt-4 text-lg font-medium">No users found</p>
          <p className="mt-1 text-sm">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <div 
              key={user.id} 
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4"
            >
              {/* User Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 truncate">{user.full_name || 'No Name'}</h3>
                  <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                  {user.vantage_username && (
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      Vantage: {user.vantage_username}
                    </p>
                  )}
                </div>
                <div className="ml-3 flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mb-4 space-y-2">
                <div className="flex items-start text-sm">
                  <svg className="flex-shrink-0 w-4 h-4 mr-2 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600 truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center text-sm">
                    <svg className="flex-shrink-0 w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-600">{user.phone}</span>
                  </div>
                )}
                {user.country && (
                  <div className="flex items-center text-sm">
                    <svg className="flex-shrink-0 w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-600">{user.country}</span>
                  </div>
                )}
              </div>

              {/* Earnings Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Total Earned:</span>
                  <span className="font-semibold text-gray-900">${user.total_earned.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Wallet Balance:</span>
                  <span className="font-semibold text-gray-900">${user.wallet_balance.toFixed(2)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 border-t border-gray-100 gap-3">
                <div className="text-xs text-gray-500">
                  Joined: {new Date(user.created_at).toLocaleDateString()}
                </div>
                <div className="flex flex-wrap gap-2">
                  {!user.is_active && (
                    <button
                      onClick={() => handleActivateDeactivate(user.id)}
                      className="flex-1 sm:flex-none text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
                    >
                      Activate
                    </button>
                  )}
                  <button className="flex-1 sm:flex-none text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 transition-colors duration-150">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserActivation