import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { type RootState } from '../../store'
import { getMyWithdrawals } from '../../services/withdrawal'
import { updateUser } from '../../services/users'
import toast from 'react-hot-toast'

interface WithdrawalRecord {
  id: number
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  admin_notes: string | null
  requested_at: string
  processed_at: string | null
}

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    country: user?.country || '',
    vantage_username: user?.vantage_username || '',
    withdrawal_address: user?.withdrawal_address || '',
  })
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateUser(user?.id || 0,formData)
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update profile')
    }
  }

  useEffect(() => {
        console.log(loading)
        fetchWithdrawals()
      }, [])
    
      const fetchWithdrawals = async () => {
        try {
          setLoading(true)
          const data = await getMyWithdrawals()
          setWithdrawals(data)
        } catch (error) {
          console.error('Failed to fetch withdrawals:', error)
        } finally {
          setLoading(false)
        }
      }

  const totalApproved = withdrawals
    .filter(w => w.status === 'APPROVED' || w.status === 'COMPLETED')
    .reduce((sum, w) => sum + w.amount, 0)


  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-8 sm:p-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <p className="mt-1 text-sm text-gray-500">Manage your personal information and withdrawal details</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  id="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={user?.username}
                  disabled
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={user?.email}
                  disabled
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  id="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50"
                />
              </div>

              <div>
                <label htmlFor="vantage_username" className="block text-sm font-medium text-gray-700">
                  Vantage Broker Username
                </label>
                <input
                  type="text"
                  name="vantage_username"
                  id="vantage_username"
                  value={formData.vantage_username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Required to receive income distribution
                </p>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="withdrawal_address" className="block text-sm font-medium text-gray-700">
                  Withdrawal Address
                </label>
                <textarea
                  name="withdrawal_address"
                  id="withdrawal_address"
                  rows={3}
                  value={formData.withdrawal_address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50"
                  placeholder="Enter your account details for withdrawals"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimum withdrawal: $10. Set this address to enable withdrawal requests.
                </p>
              </div>

              {isEditing && (
                <div className="sm:col-span-2 pt-4">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-blue-900">Wallet Balance</h3>
                  <p className="text-2xl font-bold text-blue-700">${user?.wallet_balance?.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-green-900">Total Earned</h3>
                  <p className="text-2xl font-bold text-green-700">${user?.total_earned?.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-purple-900">Total Withdrawn</h3>
                  <p className="text-2xl font-bold text-purple-700">${totalApproved.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {user?.referral_code && (
            <div className="mt-8 p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-2">Your Referral Code</h3>
              <div className="flex items-center justify-between">
                <code className="text-xl font-mono font-bold text-white bg-black/20 px-4 py-2 rounded">
                  {user.referral_code}
                </code>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/register/${user.referral_code}`
                    navigator.clipboard.writeText(url)
                    toast.success('Referral link copied!')
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                >
                  Copy Referral Link
                </button>
              </div>
              <p className="mt-2 text-sm text-indigo-100">
                Share this link to refer new users and earn referral bonuses
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage