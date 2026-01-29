import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { type RootState } from '../../store'
import { createWithdrawalRequest, getMyWithdrawals } from '../../services/withdrawal'
import { type WithdrawalRequest } from '../../types'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const WithdrawalRequests: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [refresh, setRefresh] = useState(false)

  useEffect(() => {
    fetchWithdrawals()
  }, [refresh])

  const fetchWithdrawals = async () => {
    try {
      const data = await getMyWithdrawals()
      setWithdrawals(data)
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.withdrawal_address) {
      toast.error('Please set your withdrawal address in profile first')
      return
    }

    const withdrawalAmount = parseFloat(amount)
    
    if (withdrawalAmount < 10) {
      toast.error('Minimum withdrawal amount is $10')
      return
    }

    if (withdrawalAmount > (user?.wallet_balance || 0)) {
      toast.error('Insufficient balance')
      return
    }

    setLoading(true)
    try {
      await createWithdrawalRequest(withdrawalAmount)
      toast.success('Withdrawal request submitted successfully')
      setAmount('')
      setRefresh(!refresh)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to submit withdrawal request')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Request Withdrawal</h2>
          
          {!user?.withdrawal_address ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    You need to set your withdrawal address in your profile before requesting withdrawals.
                  </p>
                  <div className="mt-2">
                    <a
                      href="/profile"
                      className="text-sm font-medium text-yellow-700 hover:text-yellow-600"
                    >
                      Go to Profile →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>Withdrawal Address:</strong> {user.withdrawal_address}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (Minimum: $10)
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="10"
                  max={user?.wallet_balance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={!user?.withdrawal_address || loading}
                  className="block w-full pl-7 pr-12 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">USD</span>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Available balance: ${user?.wallet_balance.toFixed(2)}
              </p>
            </div>

            <button
              type="submit"
              disabled={!user?.withdrawal_address || loading || !amount}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Submit Withdrawal Request'}
            </button>
          </form>
        </div>

        {/* Withdrawal History */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Withdrawal History</h2>
          
          <div className="space-y-4">
            {withdrawals.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No withdrawal requests yet</p>
            ) : (
              withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg font-medium text-gray-900">
                          ${withdrawal.amount.toFixed(2)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                          {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Requested: {format(new Date(withdrawal.requested_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                      {withdrawal.admin_notes && (
                        <p className="text-sm text-gray-500 mt-1">
                          <strong>Note:</strong> {withdrawal.admin_notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {withdrawal.processed_at && (
                        <p className="text-xs text-gray-400">
                          Processed: {format(new Date(withdrawal.processed_at), 'MMM dd')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Withdrawal Information</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Minimum withdrawal amount: $10</li>
                <li>Withdrawal requests are processed within 24-48 hours</li>
                <li>You must have a withdrawal address set in your profile</li>
                <li>Funds will be sent to your withdrawal address once approved</li>
                <li>Contact support if you have any issues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WithdrawalRequests