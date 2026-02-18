import React, { useState, useEffect, useMemo } from 'react'
import { getUsers, toggle_user_active } from '../../services/users'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom' // Added import
import { CheckCircle, XCircle, Search, UserPlus, Mail, Phone, Globe, Calendar, Wallet, User as UserIcon, Eye } from 'lucide-react'

interface User {
  id: number
  username: string
  email: string
  full_name: string
  phone: string
  country: string
  is_superadmin: boolean
  is_admin: boolean
  is_active: boolean
  vantage_username: string | null
  vantage_password: string | null
  referral_code: string
  created_at: string
  wallet_balance: number
}

const UserActivationPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const limit = 100
  const navigate = useNavigate() // Added hook

  useEffect(() => {
    setTotalPages(1)
    fetchUsers()
  }, [currentPage, filterActive])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const users = await getUsers({
        skip: (currentPage - 1) * limit,
        limit: limit,
        is_active: filterActive === 'all' ? undefined : filterActive === 'active'
      })
      setUsers(users)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleActivation = async (userId: number, activate: boolean) => {
    try {
      await toggle_user_active(userId)
      toast.success(`User ${activate ? 'activated' : 'deactivated'} successfully`)
      fetchUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Operation failed')
    }
  }

  const handleViewDetails = (userId: number, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click from triggering
    navigate(`/super-admin/user-details/${userId}`)
  }

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users

    const searchLower = searchTerm.toLowerCase()
    return users.filter(user =>
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.full_name.toLowerCase().includes(searchLower) ||
      user.vantage_username?.toLowerCase().includes(searchLower) ||
      false
    )
  }, [users, searchTerm])

  // Format long names with word break
  // const formatName = (name: string, maxLength: number = 20) => {
  //   if (!name) return 'No Name'
  //   if (name.length <= maxLength) return name
    
  //   // Try to break at natural points
  //   const words = name.split(' ')
  //   let result = ''
  //   let line = ''
    
  //   for (const word of words) {
  //     if ((line + word).length > maxLength) {
  //       result += (result ? ' ' : '') + line
  //       line = word
  //     } else {
  //       line += (line ? ' ' : '') + word
  //     }
  //   }
    
  //   return result + (result ? ' ' : '') + line
  // }

  return (
    <div className="bg-white shadow-sm rounded-xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">User Management</h2>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users by name, email, or username..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <XCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
          
          <div className="w-full sm:w-48">
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {searchTerm && (
          <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-blue-700">
              Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} matching "{searchTerm}"
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl">
          <UserPlus className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500 max-w-sm">
            {searchTerm ? 'Try adjusting your search term' : 'Get started by inviting users to your platform'}
          </p>
        </div>
      ) : (
        <>
          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {filteredUsers.filter(user => !user.is_superadmin)
              .map((user) => (
              <div 
                key={user.id} 
                // className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5 cursor-pointer hover:border-primary-300 group"
                className={`border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5 cursor-pointer hover:border-primary-300 group ${
                  !user.is_active ? 'bg-red-200' : 'bg-green-200'
                }`}
                onClick={() => navigate(`/super-admin/user-details/${user.id}`)}
              >
                {/* User Avatar and Basic Info */}
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-primary-100 mr-4">
                    <span className="text-primary-600 font-semibold text-lg">
                      {user.full_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Name - Allows multiple lines */}
                    <h3 className="text-lg font-semibold text-gray-900 break-words mb-1 group-hover:text-primary-700 transition-colors">
                      {user.full_name || 'No Name'}
                    </h3>
                    
                    {/* Username */}
                    <p className="text-sm text-gray-500 truncate mb-2">
                      @{user.username}
                    </p>
                    
                    {/* Status on next line */}
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Information - Now with better wrapping */}
                <div className="space-y-3 mb-5">
                  <div className="flex items-start text-sm">
                    <Mail className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 break-all">{user.email}</span>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">{user.phone}</span>
                    </div>
                  )}
                  
                  {user.country && (
                    <div className="flex items-center text-sm">
                      <Globe className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">{user.country}</span>
                    </div>
                  )}
                  
                  <div className="flex items-start text-sm">
                    <UserIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">
                      {user.vantage_username ? (
                        <span className="break-all">{user.vantage_username}</span>
                      ) : (
                        <span className="text-gray-400 italic">Vantage username not set</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Wallet Balance */}
                <div className="mb-5 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Wallet className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Balance</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ${user.wallet_balance.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Total earned: ${(user.wallet_balance * 1.5).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer with Date and Actions */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    {/* Join Date */}
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {/* View Details Button */}
                      <button 
                        onClick={(e) => handleViewDetails(user.id, e)}
                        className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:text-primary-600 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        <span className="hidden xs:inline">View Details</span>
                        <span className="xs:hidden">Details</span>
                      </button>
                      
                      {user.is_active ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleActivation(user.id, false)
                          }}
                          className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          <span className="hidden xs:inline">Deactivate</span>
                          <span className="xs:hidden">Deact</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleActivation(user.id, true)
                          }}
                          className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span className="hidden xs:inline">Activate</span>
                          <span className="xs:hidden">Active</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-700">
                Page <span className="font-semibold">{currentPage}</span> of{' '}
                <span className="font-semibold">{totalPages}</span>
              </div>

              <div className="flex items-center justify-center space-x-2">
                <div className="flex sm:hidden space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>

                <nav className="hidden sm:flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 border text-sm font-medium rounded-lg ${
                            currentPage === pageNum
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <span key={pageNum} className="px-2 text-gray-500">...</span>
                    }
                    return null
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>

                <div className="sm:hidden">
                  <select
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-lg"
                  >
                    {[...Array(totalPages)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Page {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default UserActivationPage