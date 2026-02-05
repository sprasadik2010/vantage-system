import React, { useState, useEffect } from 'react'
import { getAllWithdrawals, processWithdrawal } from '../../services/withdrawal'
import { type WithdrawalRequest } from '../../types'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const WithdrawalApproval: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'PENDING' | 'all'>('PENDING')
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    fetchWithdrawals()
  }, [filter])

  const fetchWithdrawals = async () => {
    try {
      const params = filter === 'PENDING' ? { withdrawal_status: 'PENDING' } : {}
      const data = await getAllWithdrawals(params)
      setWithdrawals(data)
    } catch (error) {
      toast.error('Failed to fetch withdrawal requests')
    } finally {
      setLoading(false)
    }
  }

  const handleProcess = async (withdrawalId: number, status: 'APPROVED' | 'REJECTED') => {
    setProcessingId(withdrawalId)
    try {
      await processWithdrawal(withdrawalId, {
        status,
        admin_notes: adminNotes || undefined
      })
      toast.success(`Withdrawal ${status} successfully`)
      setAdminNotes('')
      fetchWithdrawals()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to ${status} withdrawal`)
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Withdrawal Approval</h2>

        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="PENDING">Pending Only</option>
            <option value="all">All Requests</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Admin Notes (for all actions)
        </label>
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter notes for withdrawal processing..."
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User & Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requested
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No withdrawal requests found
                </td>
              </tr>
            ) : (
              withdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">User ID: {withdrawal.user_id}</div>
                      <div className="text-sm text-gray-500">
                        Request ID: {withdrawal.id}
                      </div>
                      {withdrawal.admin_notes && (
                        <div className="text-xs text-gray-400 mt-1">
                          Notes: {withdrawal.admin_notes}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-semibold text-gray-900">
                      ${withdrawal.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${withdrawal.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        withdrawal.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          withdrawal.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                      }`}>
                      {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                    </span>
                    {withdrawal.processed_at && (
                      <div className="text-xs text-gray-500 mt-1">
                        Processed: {format(new Date(withdrawal.processed_at), 'MMM dd, yyyy')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(withdrawal.requested_at), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {withdrawal.status === 'PENDING' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleProcess(withdrawal.id, 'APPROVED')}
                          disabled={processingId === withdrawal.id}
                          className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                          {processingId === withdrawal.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleProcess(withdrawal.id, 'REJECTED')}
                          disabled={processingId === withdrawal.id}
                          className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                        >
                          {processingId === withdrawal.id ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    )}
                    {withdrawal.status === 'APPROVED' && (
                      <button
                        onClick={() => handleProcess(withdrawal.id, 'APPROVED')}
                        disabled={processingId === withdrawal.id}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        {processingId === withdrawal.id ? 'Processing...' : 'Mark Complete'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default WithdrawalApproval