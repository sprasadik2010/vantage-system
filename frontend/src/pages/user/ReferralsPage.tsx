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
  vantage_username: string | null
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
                className={`relative rounded-lg p-4 text-center transition-all ${activeLevel === level
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

      <LevelParents />
      {/* Referral Cards Section */}
      <div className="bg-green-200 shadow rounded-lg">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Direct Referrals
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {referrals.length} user{referrals.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {activeReferrals} active
              </span>
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading referrals...</p>
          </div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-8.804a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-1">No referrals yet</h4>
            <p className="text-sm text-gray-500 mb-4">
              Start sharing your referral link to invite others
            </p>
            {user?.referral_code && (
              <button
                onClick={() => {
                  const url = `${window.location.origin}/register/${user.referral_code}`
                  navigator.clipboard.writeText(url)
                  toast.success('Link copied! Share it with friends')
                }}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Referral Link
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            {/* Optional: View Toggle */}
            <div className="flex justify-end mb-4">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  className="px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 focus:z-10"
                >
                  Grid
                </button>
                <button
                  type="button"
                  className="px-3 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-r border-gray-200 rounded-r-lg hover:bg-gray-100 focus:z-10"
                >
                  List
                </button>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 rounded-full ${levelColors[activeLevel - 1]} flex items-center justify-center text-white font-bold`}>
                          {referral.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 truncate max-w-[120px]">
                            {referral.full_name || 'N/A'}
                          </h4>
                          <p className="text-xs text-gray-500">@{referral.username}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${referral.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {referral.is_active ? 'Active' : 'Inactive'}
                      </span>
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
                          <p className="text-sm text-gray-900 truncate">{referral.email || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-start space-x-2">
                        <svg className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm text-gray-900">{referral.phone || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Vantage Username */}
                      <div className="flex items-start space-x-2">
                        <svg className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-500">Vantage Username</p>
                          <p className={`text-sm ${referral.vantage_username ? 'text-gray-900' : 'text-gray-400'}`}>
                            {referral.vantage_username || 'Not set'}
                          </p>
                        </div>
                      </div>

                      {/* Joined Date & Earnings */}
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500">Joined</p>
                          <p className="text-sm font-medium text-gray-900">
                            {referral.created_at ? new Date(referral.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Earned</p>
                          <p className="text-sm font-medium text-green-600">
                            ${(referral.total_earned || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {referral.country || 'Country not specified'}
                      </span>
                      <button
                        onClick={() => {
                          // Add view details action
                          toast.success(`Viewing ${referral.username}'s details`)
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination/Stats Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
                <div className="mb-2 sm:mb-0">
                  Showing <span className="font-medium">{referrals.length}</span> of <span className="font-medium">{referrals.length}</span> referrals
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <span>{activeReferrals} active</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-gray-400 mr-2"></div>
                    <span>{referrals.length - activeReferrals} inactive</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReferralsPage