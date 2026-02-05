import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { type RootState } from '../../store'
import { getUserById } from '../../services/users'

interface ParentUser {
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

const LevelParents: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [loading, setLoading] = useState(true)
  const [parentUsers, setParentUsers] = useState<ParentUser[]>([])
  
  const MAX_PARENT_LEVELS = 5
  const levelColors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-green-100 text-green-800 border-green-200',
    'bg-yellow-100 text-yellow-800 border-yellow-200',
    'bg-red-100 text-red-800 border-red-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-pink-100 text-pink-800 border-pink-200'
  ]

  // Get a single parent user
  const getParentUser = async (id: number): Promise<ParentUser | null> => {
    try {
      return await getUserById(id)
    } catch (error) {
      console.error('Error fetching parent user:', error)
      return null
    }
  }

  // Get up to MAX_PARENT_LEVELS parents
  const getAllParents = async (parentId: number | null | undefined): Promise<ParentUser[]> => {
    const parents: ParentUser[] = []
    let currentId = parentId
    let level = 0
    
    while (currentId && level < MAX_PARENT_LEVELS) {
      const parent = await getParentUser(currentId)
      if (parent) {
        parents.push(parent)
        currentId = parent.parent_id
        level++
      } else {
        break
      }
    }
    
    return parents
  }

  useEffect(() => {
    const fetchParents = async () => {
      try {
        setLoading(true)
        if (user?.parent_id) {
          const parents = await getAllParents(user.parent_id)
          setParentUsers(parents)
        } else {
          setParentUsers([])
        }
      } catch (error) {
        console.error('Error fetching parents:', error)
        setParentUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchParents()
  }, [user?.parent_id])

  // Helper function to get level number
  const getLevelNumber = (index: number) => index + 1

  return (
    <div className="bg-blue-200 shadow rounded-lg">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Upline Sponsors
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Your referral upline hierarchy (Level 1 is your direct sponsor)
            </p>
          </div>
          {parentUsers.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500">
                {parentUsers.length} level{parentUsers.length !== 1 ? 's' : ''}
              </div>
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading upline sponsors...</p>
        </div>
      ) : parentUsers.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-1">No upline sponsors</h4>
          <p className="text-sm text-gray-500">
            You don't have any upline sponsors in your network
          </p>
        </div>
      ) : (
        <div className="p-4 sm:p-6">
          {/* Desktop: Timeline View */}
          <div className="hidden lg:block mb-8">
            <div className="relative">
              {/* Connection line */}
              <div className="absolute left-4 right-4 top-6 h-0.5 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500"></div>
              
              <div className="relative flex justify-between">
                {parentUsers.map((parent, index) => (
                  <div key={parent.id} className="relative flex flex-col items-center">
                    {/* Level indicator */}
                    <div className={`w-12 h-12 rounded-full border-2 ${levelColors[index]} flex items-center justify-center font-bold text-lg mb-2 z-10`}>
                      {getLevelNumber(index)}
                    </div>
                    
                    {/* Level label */}
                    <div className="text-xs font-medium text-gray-500 mb-2">
                      Level {getLevelNumber(index)}
                    </div>
                    
                    {/* User card */}
                    <div className="w-48 bg-white border border-gray-200 rounded-lg shadow-sm p-4 text-center">
                      <div className="font-medium text-gray-900 truncate">
                        {parent.full_name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        @{parent.username}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Since {parent.created_at ? new Date(parent.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile & Tablet: Cards Grid */}
          <div className="lg:hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parentUsers.map((parent, index) => (
                <div
                  key={parent.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  {/* Card Header with Level Badge */}
                  <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 rounded-full border ${levelColors[index]} flex items-center justify-center font-bold`}>
                          {getLevelNumber(index)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 truncate max-w-[120px]">
                            {parent.full_name || 'N/A'}
                          </h4>
                          <p className="text-xs text-gray-500">@{parent.username}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Level</div>
                        <div className="text-sm font-bold text-gray-900">{getLevelNumber(index)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <div className="space-y-3">
                      {/* Contact Info */}
                      <div className="flex items-start space-x-2">
                        <svg className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm text-gray-900 truncate">{parent.email || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-start space-x-2">
                        <svg className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm text-gray-900">{parent.phone || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Vantage Username */}
                      <div className="flex items-start space-x-2">
                        <svg className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-500">Vantage Username</p>
                          <p className={`text-sm ${parent.vantage_username ? 'text-gray-900' : 'text-gray-400'}`}>
                            {parent.vantage_username || 'Not set'}
                          </p>
                        </div>
                      </div>

                      {/* Status & Joined Date */}
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            parent.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {parent.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Joined</p>
                          <p className="text-sm font-medium text-gray-900">
                            {parent.created_at ? new Date(parent.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {parent.country || 'Country not specified'}
                      </span>
                      <div className="text-xs font-medium text-gray-900">
                        ${(parent.total_earned || 0).toFixed(2)} earned
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Table View (for medium screens) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parentUsers.map((parent, index) => (
                  <tr key={parent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`w-8 h-8 rounded-full ${levelColors[index]} flex items-center justify-center font-bold`}>
                        {getLevelNumber(index)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {parent.full_name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{parent.username || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{parent.email || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{parent.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        parent.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {parent.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parent.created_at ? new Date(parent.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
              <div>
                Showing <span className="font-medium">{parentUsers.length}</span> upline level{parentUsers.length !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-gray-400 mt-1 sm:mt-0">
                Level 1 is your direct sponsor
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LevelParents