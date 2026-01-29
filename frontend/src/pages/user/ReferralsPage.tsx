import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { type RootState } from '../../store'
import { getUserReferrals } from '../../services/users'  // Updated import
import toast from 'react-hot-toast'
import LevelParents from '../../components/user/level_parents'

interface ReferralUser {
  id: number
  username: string
  email: string
  full_name: string
  country: string
  phone: string
  is_active: boolean
  created_at: string
  vantage_username: string |null
  wallet_balance: number
  total_earned: number
}

const ReferralsPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [referrals, setReferrals] = useState<ReferralUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLevel, setActiveLevel] = useState(1)

  useEffect(() => {
    if (user?.id) {
      fetchReferrals()
    }
  }, [activeLevel, user?.id])

  const fetchReferrals = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const data = await getUserReferrals(user.id)  // Fixed: no level parameter
      setReferrals(data || [])  // Fixed: direct assignment, not [data]
    } catch (error) {
      console.error('Failed to fetch referrals:', error)
      setReferrals([])  // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const levelColors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-orange-500',
    'bg-red-500'
  ]

  const levelPercentages = [2, 2, 2, 2, 2]

  // Calculate total earned
  const totalEarned = referrals.reduce((sum, ref) => sum + (ref.total_earned || 0), 0)
  
  // Count active referrals
  const activeReferrals = referrals.filter(r => r.is_active).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Referral Network</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your referral network and track earnings</p>
      </div>

      {/* Referral Link */}
      {user?.referral_code && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-medium mb-2">Your Referral Link</h3>
              <div className="flex items-center space-x-2">
                <code className="bg-black/20 px-4 py-2 rounded text-sm font-mono break-all">
                  {window.location.origin}/register/{user.referral_code}
                </code>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/register/${user.referral_code}`
                    navigator.clipboard.writeText(url)
                    // alert('Referral link copied to clipboard!')
                    toast.success('Referral link copied to clipboard!')
                  }}
                  className="inline-flex items-center px-3 py-2 border border-white/30 rounded-md text-sm font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Copy
                </button>
              </div>
              <p className="mt-2 text-sm text-indigo-100">
                Share this link to invite others and earn referral bonuses
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">Direct Referrals</div>
              <div className="text-3xl font-bold mt-1">
                {referrals.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Level Selector */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Referral Levels</h3>
          <p className="mt-1 text-sm text-gray-500">Income distribution across 5 levels</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => setActiveLevel(level)}
                className={`relative rounded-lg p-4 text-center transition-all ${
                  activeLevel === level
                    ? 'ring-2 ring-offset-2 ring-indigo-500 transform scale-105'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-full ${levelColors[level - 1]} mx-auto flex items-center justify-center text-white font-bold text-lg`}>
                  {level}
                </div>
                <div className="mt-3">
                  <div className="text-sm font-medium text-gray-900">Level {level}</div>
                  <div className="text-2xl font-bold text-gray-900">{levelPercentages[level - 1]}%</div>
                  <div className="text-xs text-gray-500">Commission</div>
                </div>
                {activeLevel === level && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-indigo-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      ✓
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-2">Level {activeLevel} Income Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-500">Total Members</div>
                  <div className="text-2xl font-bold text-gray-900">{referrals.length}</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-500">Total Earned</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${totalEarned.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-500">Active Members</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {activeReferrals}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

            <LevelParents/>
      {/* Referral Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Direct Referrals
            </h3>
            <span className="text-sm text-gray-500">
              Showing {referrals.length} users
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-sm text-gray-500">Loading referrals...</p>
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">No referrals found at this level</p>
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
                {referrals.map((referral) => (
                  <tr key={referral.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full ${levelColors[activeLevel - 1]} flex items-center justify-center text-white font-bold`}>
                            {referral.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {referral.full_name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{referral.username || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{referral.email || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{referral.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        referral.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {referral.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {referral.vantage_username || '-'}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${(referral.wallet_balance || 0).toFixed(2)}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {referral.created_at ? new Date(referral.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReferralsPage