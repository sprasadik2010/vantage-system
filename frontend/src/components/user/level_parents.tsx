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
  
  const MAX_PARENT_LEVELS = 5 // Define maximum levels to fetch
  const levelColors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500']

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

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Level Parents
          </h3>
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading parents...</p>
          </div>
        ) : parentUsers.length === 0 ? ( // Changed from referrals to parentUsers
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">No parent users found</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  Vantage Username
                </th>
                {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wallet Balance
                </th> */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {parentUsers.map((parentUser, index) => ( // Changed from referrals to parentUsers
                <tr key={parentUser.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className={`h-10 w-10 rounded-full ${levelColors[index] || 'bg-gray-500'} flex items-center justify-center text-white font-bold`}>
                          {parentUser.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {parentUser.full_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{parentUser.username || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{parentUser.email || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{parentUser.phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      parentUser.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {parentUser.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {parentUser.vantage_username || '-'}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${(parentUser.wallet_balance || 0).toFixed(2)}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {parentUser.created_at ? new Date(parentUser.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default LevelParents