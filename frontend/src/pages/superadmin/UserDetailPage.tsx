import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getUserById, updateUser, updateUserPassword, toggle_user_active } from '../../services/users'
import { type User } from '../../types'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Lock,
  Mail,
  Phone,
  Globe,
  User as UserIcon,
  Wallet,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Shield,
  CreditCard,
  Users
} from 'lucide-react'

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<Partial<User>>({})
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (id) {
      fetchUser()
    }
  }, [id])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const userData = await getUserById(Number(id))
      setUser(userData)
      setFormData(userData)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      toast.error('Failed to load user details')
      navigate('/super-admin/user-management')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = (): boolean => {
    if (!formData.email?.trim()) {
      toast.error('Email is required')
      return false
    }

    if (!formData.username?.trim()) {
      toast.error('Username is required')
      return false
    }

    if (!formData.full_name?.trim()) {
      toast.error('Full name is required')
      return false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return false
    }

    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      const updatedUser = await updateUser(user!.id, formData)
      setUser(updatedUser)
      setFormData(updatedUser)
      setEditing(false)
      toast.success('User updated successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update user')
    }
  }

  const handlePasswordUpdate = async () => {
    if (!passwordData.newPassword) {
      toast.error('Please enter a new password')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    try {
      // Send only the password data, not the entire formData
      await updateUserPassword(user!.id, {
        new_password: passwordData.newPassword
      })
      setPasswordData({ newPassword: '', confirmPassword: '' })
      toast.success('Password updated successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update password')
    }
  }

  const handleActivation = async () => {
    if (!user) return

    try {
      await toggle_user_active(user.id)
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`)
      fetchUser() // Refresh user data
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Operation failed')
    }
  }

  const resetForm = () => {
    setFormData(user || {})
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Loading user details...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">User Not Found</h3>
          <p className="text-gray-500">The user you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/super-admin/user-management')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to User Management
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/super-admin/user-management')}
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to User Management
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
            <p className="text-gray-600 mt-1">Manage user information and permissions</p>
          </div>

          <div className="flex gap-3">
            <button hidden
              onClick={() => navigate(`/super-admin/users/${user.id}/referrals`)}
              className="hidden inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              <Users className="w-4 h-4 mr-2" />
              View Referrals
            </button>

            <button
              onClick={handleActivation}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white ${user.is_active
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
                }`}
            >
              {user.is_active ? (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Activate
                </>
              )}
            </button>

            {editing ? (
              <div className="flex gap-2">
                <button
                  onClick={resetForm}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            ) : (
              <button hidden
                onClick={() => setEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit User
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Profile Card */}
          <div className="bg-white shadow rounded-xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 flex items-center justify-center rounded-full bg-primary-100">
                  <span className="text-primary-600 text-2xl font-bold">
                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editing ? (
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    ) : (
                      user.full_name || 'No Name'
                    )}
                  </h2>
                  <div className="flex items-center mt-1 space-x-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {user.is_active ? '🟢 Active' : '🔴 Inactive'}
                    </span>
                    {user.is_admin && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </span>
                    )}
                    {user.is_superadmin && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Super Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">User ID</p>
                <p className="text-lg font-semibold text-gray-900">#{user.id}</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="username"
                      value={formData.username || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                      @{user.username}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {user.email}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {user.phone || 'Not provided'}
                    </div>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="country"
                      value={formData.country || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Globe className="w-4 h-4 mr-2 text-gray-400" />
                      {user.country || 'Not provided'}
                    </div>
                  )}
                </div>

                {/* Vantage Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vantage Username
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="vantage_username"
                      value={formData.vantage_username || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                      {user.vantage_username || 'Not set'}
                    </div>
                  )}
                </div>

                {/* Referral Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referral Code
                  </label>
                  <div className="flex items-center text-gray-900">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    {user.referral_code}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Information */}
          <div className="bg-white shadow rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Wallet Balance</p>
                    <p className="text-2xl font-bold text-gray-900">${user.wallet_balance.toFixed(2)}</p>
                  </div>
                  <Wallet className="w-8 h-8 text-gray-400" />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">Total Earned</p>
                    <p className="text-2xl font-bold text-blue-900">${user.total_earned.toFixed(2)}</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Total Withdrawn</p>
                    <p className="text-2xl font-bold text-green-900">${user.total_withdrawn.toFixed(2)}</p>
                  </div>
                  <Wallet className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </div>

            {/* Withdrawal Address */}
            {user.withdrawal_address && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Withdrawal Address</h4>
                <p className="text-sm text-yellow-700 break-all">{user.withdrawal_address}</p>
                {user.withdrawal_qr_code && (
                  <div className="mt-3">
                    <p className="text-sm text-yellow-800 mb-2">QR Code:</p>
                    <img
                      src={user.withdrawal_qr_code}
                      alt="Withdrawal QR Code"
                      className="h-32 w-32"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actions and Stats */}
        <div className="space-y-6">
          {/* Password Update Card */}
          <div className="bg-white shadow rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                onClick={handlePasswordUpdate}
                disabled={!passwordData.newPassword || !passwordData.confirmPassword}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock className="w-4 h-4 mr-2" />
                Update Password
              </button>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white shadow rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Account Created</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Login</span>
                <span className="text-sm font-medium text-gray-900">
                  {/* You'll need to add last_login field to your User type */}
                  Recently
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">IP Address</span>
                <span className="text-sm font-medium text-gray-900">
                  {/* Add IP tracking to your backend */}
                  Tracked
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-xl p-6 hidden">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/super-admin/users/${user.id}/income`)}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                View Income History
              </button>

              <button
                onClick={() => navigate(`/super-admin/users/${user.id}/withdrawals`)}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                <Wallet className="w-4 h-4 mr-2" />
                View Withdrawals
              </button>

              <button
                onClick={() => navigate(`/super-admin/users/${user.id}/transactions`)}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                <Calendar className="w-4 h-4 mr-2" />
                View All Transactions
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white shadow rounded-xl p-6 border border-red-200 hidden">
            <h3 className="text-lg font-semibold text-red-700 mb-4">Danger Zone</h3>
            <div className="space-y-3">
              <button
                onClick={handleActivation}
                className={`w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white ${user.is_active
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                  }`}
              >
                {user.is_active ? (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Deactivate Account
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Activate Account
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                    toast.error('User deletion not implemented yet')
                  }
                }}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Delete User Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDetailPage