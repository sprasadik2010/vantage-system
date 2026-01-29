// pages/admin/manual-distribution.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { manualDistributionService } from '../../services/manualDistribution'
import toast from 'react-hot-toast'

// Define types
interface User {
  id: number
  full_name: string
  vantage_username: string
  username: string
  email: string
}

interface ManualDistributionForm {
  vantage_username: string
  amount: string
  income_type: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  notes?: string
}

interface CommissionBreakdown {
  [key: string]: number
}

interface DistributionResultData {
  distributed_amount: number
  users_affected: number
  commission_breakdown: CommissionBreakdown
  transaction_id: string
  timestamp: string
}

interface DistributionResult {
  success: boolean
  message: string
  data: DistributionResultData
}

const ManualDistributionPage: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<ManualDistributionForm>({
    vantage_username: '',
    amount: '',
    income_type: 'WEEKLY',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<DistributionResult | null>(null)
  
  // Autocomplete states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Search users when query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const response = await manualDistributionService.searchUsers(searchQuery)
        setSearchResults(response.data || [])
        setShowDropdown(true)
      } catch (err) {
        console.error('Error searching users:', err)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const delayDebounce = setTimeout(() => {
      searchUsers()
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowDropdown(value.length >= 2)
    if (error) setError(null)
  }

  const handleUserSelect = (user: User) => {
    setFormData(prev => ({
      ...prev,
      vantage_username: user.vantage_username
    }))
    setSelectedUser(user)
    setSearchQuery(user.full_name) // Show full name in search box
    setShowDropdown(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'vantage_username') {
      // If user manually types in vantage username, clear the selected user
      setSelectedUser(null)
      setSearchQuery('') // Clear search query if manually typing
      setFormData(prev => ({
        ...prev,
        vantage_username: value
      }))
      return
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError(null)
  }

  const validateForm = (): boolean => {
    if (!formData.vantage_username.trim()) {
      setError('Vantage username is required')
      return false
    }
    
    if (!formData.amount.trim()) {
      setError('Amount is required')
      return false
    }
    
    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be a positive number')
      return false
    }
    
    if (!formData.income_type) {
      setError('Income type is required')
      return false
    }
    
    if (!['DAILY', 'WEEKLY', 'MONTHLY'].includes(formData.income_type)) {
      setError('Income type must be DAILY, WEEKLY, or MONTHLY')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the form errors')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Use the manual distribution service
      const response = await manualDistributionService.distribute({
        vantage_username: formData.vantage_username.trim(),
        amount: parseFloat(formData.amount),
        income_type: formData.income_type,
        notes: formData.notes?.trim(),
        distribution_type: 'MANUAL'
      })
      
      const data: DistributionResult = response.data
      setSuccess(data)
      toast.success(data.message || 'Income distributed successfully!')
      // Reset form after successful distribution
      handleDistributeAndAddAnother()
      
    } catch (err: any) {
      // Handle axios error
      let errorMessage = 'An error occurred while distributing income'
      if (err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else if (err.message) {
        setError(err.message)
      } else {
        setError('An error occurred while distributing income')
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDistributeAndAddAnother = () => {
    setSuccess(null)
    setFormData({
      vantage_username: '',
      amount: '',
      income_type: 'DAILY',
      notes: ''
    })
    setSearchQuery('')
    setSelectedUser(null)
    setSearchResults([])
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manual Income Distribution</h1>
              <p className="mt-1 text-sm text-gray-600">
                Distribute income to individual users without Excel
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <button
                onClick={() => navigate('/admin/excelupload')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Upload Excel
              </button>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-6 shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">Distribution Successful!</h3>
                      <p className="mt-1 text-green-700">{success.message}</p>
                    </div>
                    <button
                      onClick={() => setSuccess(null)}
                      className="text-green-500 hover:text-green-700 transition-colors"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Distribution Details */}
                  <div className="mt-4 bg-white rounded-lg p-4 border border-green-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">
                          {formatCurrency(success.data.distributed_amount)}
                        </div>
                        <div className="text-sm text-green-600 mt-1">Total Distributed</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">
                          {success.data.users_affected}
                        </div>
                        <div className="text-sm text-blue-600 mt-1">Users Affected</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-xs font-mono text-purple-600 truncate">
                          {success.data.transaction_id}
                        </div>
                        <div className="text-sm text-purple-600 mt-1">Transaction ID</div>
                      </div>
                    </div>
                    
                    {/* Commission Breakdown */}
                    {success.data.commission_breakdown && Object.keys(success.data.commission_breakdown).length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Commission Breakdown:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {Object.entries(success.data.commission_breakdown).map(([level, amount]) => (
                            <div key={level} className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="text-sm font-semibold text-gray-900">
                                {formatCurrency(amount)}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">Level {level}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Distributed at:</span> {formatDate(success.data.timestamp)}
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={handleDistributeAndAddAnother}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Distribute Another
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Search User Field - ADDED THIS SECTION */}
                    <div className="relative" ref={dropdownRef}>
                      <label htmlFor="user_search" className="block text-sm font-medium text-gray-700 mb-1">
                        Search User by Full Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="user_search"
                          id="user_search"
                          value={searchQuery}
                          onChange={handleSearchChange}
                          onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          placeholder="Type user's full name to search..."
                          disabled={loading}
                          autoFocus
                        />
                        {isSearching && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Autocomplete Dropdown */}
                      {showDropdown && searchResults.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm max-h-60">
                          {searchResults.map((user) => (
                            <div
                              key={user.id}
                              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-primary-50 ${
                                selectedUser?.id === user.id ? 'bg-primary-50 text-primary-900' : 'text-gray-900'
                              }`}
                              onClick={() => handleUserSelect(user)}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium truncate">{user.full_name}</span>
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>Vantage: {user.vantage_username}</span>
                                  <span>Email: {user.email}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {showDropdown && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-2 px-3 text-sm text-gray-500">
                          No users found matching "{searchQuery}"
                        </div>
                      )}
                      
                      <p className="mt-1 text-xs text-gray-500">
                        Type at least 2 characters to search users by full name. Select a user to auto-fill vantage username.
                      </p>
                    </div>

                    {/* Vantage Username Field (auto-filled from selection) */}
                    <div>
                      <label htmlFor="vantage_username" className="block text-sm font-medium text-gray-700 mb-1">
                        Vantage Username *
                      </label>
                      <input
                        type="text"
                        name="vantage_username"
                        id="vantage_username"
                        value={formData.vantage_username}
                        onChange={handleInputChange}
                        className={`block w-full rounded-md border px-3 py-2 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                          selectedUser ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-white'
                        }`}
                        placeholder={selectedUser ? selectedUser.vantage_username : "Will auto-fill when you select a user above"}
                        disabled={loading || !!selectedUser}
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {selectedUser 
                          ? `Auto-filled from selected user: ${selectedUser.full_name}`
                          : "This field will auto-fill when you select a user above. You can also type manually."
                        }
                      </p>
                      
                      {selectedUser && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-sm text-green-700">
                            ✅ Selected User: <span className="font-semibold">{selectedUser.full_name}</span>
                            <br />
                            📧 Email: <span className="font-medium">{selectedUser.email}</span>
                            <br />
                            👤 Username: <span className="font-medium">{selectedUser.username}</span>
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(null)
                              setSearchQuery('')
                              setFormData(prev => ({...prev, vantage_username: ''}))
                            }}
                            className="mt-1 text-xs text-red-600 hover:text-red-800"
                          >
                            Clear selection
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                          Amount *
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            name="amount"
                            id="amount"
                            value={formData.amount}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0.01"
                            className="block w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="0.00"
                            disabled={loading}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="income_type" className="block text-sm font-medium text-gray-700 mb-1">
                          Income Type *
                        </label>
                        <select
                          name="income_type"
                          id="income_type"
                          value={formData.income_type}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          disabled={loading}
                          required
                        >
                          <option value="DAILY">DAILY</option>
                          <option value="WEEKLY">WEEKLY</option>
                          <option value="MONTHLY">MONTHLY</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        name="notes"
                        id="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="Add any notes about this distribution..."
                        disabled={loading}
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !formData.vantage_username.trim()}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Distributing...
                          </>
                        ) : (
                          'Distribute Income'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Distribution Rules Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-primary-900 mb-4">Distribution Rules</h3>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Income will be distributed to:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li className="flex items-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs font-bold mr-2">
                          1
                        </span>
                        Direct referral (Level 1)
                      </li>
                      <li className="flex items-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mr-2">
                          2
                        </span>
                        Level 2 (if 2+ referrals)
                      </li>
                      <li className="flex items-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mr-2">
                          3
                        </span>
                        Level 3 (if 3+ referrals)
                      </li>
                      <li className="flex items-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold mr-2">
                          4
                        </span>
                        Level 4 (if 4+ referrals)
                      </li>
                      <li className="flex items-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-800 text-xs font-bold mr-2">
                          5
                        </span>
                        Level 5 (if 5+ referrals)
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Commission Rates:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li className="flex justify-between">
                        <span>Each level:</span>
                        <span className="font-medium">02% of amount</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Direct referral:</span>
                        <span className="font-medium">30% + referral bonus</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Bonus based on:</span>
                        <span className="font-medium">Referrals count</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Example Calculation:</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      For $1000 distributed:
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Level 1 (02%):</span>
                        <span className="font-mono">$20.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Level 2 (02%):</span>
                        <span className="font-mono">$20.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Level 3 (02%):</span>
                        <span className="font-mono">$20.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Level 4 (02%):</span>
                        <span className="font-mono">$20.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Level 5 (02%):</span>
                        <span className="font-mono">$20.00</span>
                      </div>
                      <div className="border-t pt-1 mt-1">
                        <div className="flex justify-between font-medium">
                          <span>Total distributed:</span>
                          <span className="font-mono">$100.00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary-100 rounded-lg border border-primary-200">
                  <h4 className="font-medium text-primary-900 mb-2">Need to distribute in bulk?</h4>
                  <p className="text-sm text-primary-700 mb-3">
                    Use Excel upload for bulk distribution to multiple users at once.
                  </p>
                  <button
                    onClick={() => navigate('/admin/excelupload')}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Go to Excel Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManualDistributionPage