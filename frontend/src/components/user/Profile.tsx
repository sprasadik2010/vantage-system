import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { type RootState } from '../../store'
import { updateUser } from '../../services/users'
import { updateUser as updateAuthUser } from '../../store/authSlice'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Define validation schemas
const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  country: z.string().min(2, 'Country is required'),
  vantage_username: z.string().optional(),
})

const withdrawalSchema = z.object({
  withdrawal_address: z.string().min(10, 'Withdrawal address is required'),
  withdrawal_qr_code: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>
type WithdrawalFormData = z.infer<typeof withdrawalSchema>

const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'withdrawal' | 'security'>('profile')
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null)
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null)

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      country: user?.country || '',
      vantage_username: user?.vantage_username || '',
    },
  })

  const {
    register: registerWithdrawal,
    handleSubmit: handleSubmitWithdrawal,
    formState: { errors: withdrawalErrors },
    reset: resetWithdrawal,
  } = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      withdrawal_address: user?.withdrawal_address || '',
      withdrawal_qr_code: user?.withdrawal_qr_code || '',
    },
  })

  useEffect(() => {
    if (user) {
      resetProfile({
        full_name: user.full_name,
        phone: user.phone,
        country: user.country,
        vantage_username: user.vantage_username || '',
      })
      resetWithdrawal({
        withdrawal_address: user.withdrawal_address || '',
        withdrawal_qr_code: user.withdrawal_qr_code || '',
      })
    }
  }, [user, resetProfile, resetWithdrawal])

  const handleQrCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setQrCodeFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setQrCodePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return

    setLoading(true)
    try {
      const updatedUser = await updateUser(user.id, data)
      dispatch(updateAuthUser(updatedUser))
      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const onWithdrawalSubmit = async (data: WithdrawalFormData) => {
    if (!user) return

    setLoading(true)
    try {
      // If there's a new QR code file, upload it first
      let withdrawalData = { ...data }
      
      if (qrCodeFile) {
        // In a real app, you would upload the file to a server
        // For now, we'll use a placeholder
        withdrawalData.withdrawal_qr_code = `qr_${Date.now()}.png`
      }

      const updatedUser = await updateUser(user.id, withdrawalData)
      dispatch(updateAuthUser(updatedUser))
      
      if (qrCodeFile) {
        toast.success('Withdrawal details and QR code updated successfully')
      } else {
        toast.success('Withdrawal details updated successfully')
      }
      
      setQrCodeFile(null)
      setQrCodePreview(null)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update withdrawal details')
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = () => {
    if (user?.referral_code) {
      const referralLink = `${window.location.origin}/register/${user.referral_code}`
      navigator.clipboard.writeText(referralLink)
      toast.success('Referral link copied to clipboard!')
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('withdrawal')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'withdrawal'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Withdrawal Details
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Security
          </button>
        </nav>
      </div>

      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Personal Information</h2>
              
              <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      {...registerProfile('full_name')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {profileErrors.full_name && (
                      <p className="mt-1 text-sm text-red-600">{profileErrors.full_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={user.username}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">Auto-generated username</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      {...registerProfile('phone')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {profileErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{profileErrors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      {...registerProfile('country')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {profileErrors.country && (
                      <p className="mt-1 text-sm text-red-600">{profileErrors.country.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vantage Broker Username
                    </label>
                    <input
                      type="text"
                      {...registerProfile('vantage_username')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Your Vantage broker username"
                    />
                    {profileErrors.vantage_username && (
                      <p className="mt-1 text-sm text-red-600">{profileErrors.vantage_username.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Required to receive income shares
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            {/* Account Status Card */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.is_active ? 'Active' : 'Pending Activation'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Type:</span>
                  <span className="font-medium">
                    {user.is_superadmin ? 'Super Admin' : 
                     user.is_admin ? 'Admin' : 'Standard User'}
                  </span>
                </div>
              </div>
            </div>

            {/* Referral Card */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Referral Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Referral Code
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={user.referral_code}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50"
                    />
                    <button
                      onClick={copyReferralLink}
                      className="px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-white hover:bg-gray-50"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Share your referral link to earn more through the 5-level income system
                </p>
                <div className="mt-4">
                  <button
                    onClick={copyReferralLink}
                    className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Copy Referral Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Details Tab */}
      {activeTab === 'withdrawal' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Withdrawal Details</h2>
            
            <form onSubmit={handleSubmitWithdrawal(onWithdrawalSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withdrawal Address *
                </label>
                <textarea
                  {...registerWithdrawal('withdrawal_address')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your account details for withdrawals"
                />
                {withdrawalErrors.withdrawal_address && (
                  <p className="mt-1 text-sm text-red-600">{withdrawalErrors.withdrawal_address.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  This address will be used for all your withdrawal requests
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR Code (Optional)
                </label>
                <div className="space-y-4">
                  {(qrCodePreview || user.withdrawal_qr_code) && (
                    <div className="border border-gray-300 rounded-md p-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">QR Code Preview:</p>
                      <div className="flex items-center space-x-4">
                        {qrCodePreview ? (
                          <img 
                            src={qrCodePreview} 
                            alt="QR Code Preview" 
                            className="w-32 h-32 object-contain border border-gray-200"
                          />
                        ) : user.withdrawal_qr_code ? (
                          <div className="w-32 h-32 bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">QR Code Set</span>
                          </div>
                        ) : null}
                        <div className="text-sm text-gray-500">
                          <p>Upload a QR code image for quick scanning</p>
                          <p className="mt-1 text-xs">Recommended: 256x256 PNG or JPG</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <input
                      type="file"
                      id="qrCode"
                      accept="image/*"
                      onChange={handleQrCodeChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="qrCode"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload QR Code
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      Upload a QR code for your withdrawal address (optional)
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Important:</strong> You must set your withdrawal address before requesting withdrawals. 
                      Double-check the address for accuracy as transactions cannot be reversed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Withdrawal Details'}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            {/* Withdrawal Information Card */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Withdrawal Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum Withdrawal:</span>
                  <span className="font-medium">$10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Time:</span>
                  <span className="font-medium">24-48 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wallet Balance:</span>
                  <span className="font-medium">${user.wallet_balance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Withdrawn:</span>
                  <span className="font-medium">${user.total_withdrawn.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Security Tips Card */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Always double-check your withdrawal address
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Never share your withdrawal details with anyone
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Update your address immediately if you change wallets
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Contact support if you suspect any unauthorized activity
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h2>
          
          <div className="space-y-6">
            {/* Password Change Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">Change Password</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </div>

            {/* Two-Factor Authentication Section */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Enable 2FA
                </button>
              </div>
            </div>

            {/* Session Management Section */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Active Sessions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                  <div>
                    <p className="font-medium">Current Session</p>
                    <p className="text-sm text-gray-500">
                      {navigator.userAgent} • {new Date().toLocaleString()}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    Log Out All Other Sessions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile