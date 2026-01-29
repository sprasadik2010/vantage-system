import React, { useState, useEffect } from 'react'
import { getAllWithdrawals, processWithdrawal } from '../../services/withdrawal'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Eye, Download, Filter } from 'lucide-react'
import { format } from 'date-fns'

interface WithdrawalRequest {
  id: number
  user_id: number
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  admin_notes: string | null
  requested_at: string
  processed_at: string | null
  processed_by: number | null
  user: {
    full_name: string
    email: string
    withdrawal_address: string | null
  }
}

const ApprovWithdrawals: React.FC = () => {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('PENDING')
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null)
  const [processing, setProcessing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  useEffect(() => {
    fetchRequests()
  }, [currentPage, filterStatus])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await getAllWithdrawals({
        skip: (currentPage - 1) * limit,
        limit: limit,
        status: filterStatus === 'all' ? undefined : filterStatus
      })
      setRequests(response)
      setTotalPages(Math.ceil(response.length / limit))
    } catch (error) {
      console.error('Failed to fetch withdrawal requests:', error)
      toast.error('Failed to load withdrawal requests')
    } finally {
      setLoading(false)
    }
  }

  const handleProcess = async (requestId: number, status: 'APPROVED' | 'REJECTED', notes?: string) => {
    try {
      setProcessing(true)
      await processWithdrawal(requestId, { status, admin_notes: notes })
      toast.success(`Withdrawal ${status} successfully`)
      fetchRequests() // Refresh the list
      setSelectedRequest(null)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Operation failed')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'PENDING'
      case 'APPROVED': return 'APPROVED'
      case 'COMPLETED': return 'COMPLETED'
      case 'REJECTED': return 'REJECTED'
      default: return status
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Withdrawal Requests</h2>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading withdrawal requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-8">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Download className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No withdrawal requests</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filterStatus !== 'all' ? `No ${filterStatus} requests found` : 'No withdrawal requests yet'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.user && request.user.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.user && request.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-semibold text-gray-900">
                        ${request.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(request.requested_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      {request.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleProcess(request.id, 'APPROVED')}
                            disabled={processing}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleProcess(request.id, 'REJECTED')}
                            disabled={processing}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal for viewing details - CORRECTED VERSION */}
      {selectedRequest && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSelectedRequest(null)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <div 
                className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                      Withdrawal Request Details
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">User</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedRequest.user?.full_name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedRequest.user?.email || 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Amount</label>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          ${selectedRequest.amount.toFixed(2)}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Withdrawal Address</label>
                        <p className="mt-1 text-sm text-gray-900 break-all">
                          {selectedRequest.user?.withdrawal_address || 'No address provided'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Requested At</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {format(new Date(selectedRequest.requested_at), 'MMM dd, yyyy HH:mm:ss')}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Status</label>
                        <p className="mt-1">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                            {getStatusText(selectedRequest.status)}
                          </span>
                        </p>
                      </div>
                      
                      {selectedRequest.admin_notes && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Admin Notes</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedRequest.admin_notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
                      {selectedRequest.status === 'PENDING' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleProcess(selectedRequest.id, 'APPROVED')}
                            disabled={processing}
                            className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                          >
                            Approve Withdrawal
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const notes = prompt('Enter reason for rejection:');
                              if (notes) handleProcess(selectedRequest.id, 'REJECTED', notes);
                            }}
                            disabled={processing}
                            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                          >
                            Reject Withdrawal
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(null)}
                        className={`inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          selectedRequest.status === 'PENDING' ? 'sm:col-span-2' : ''
                        }`}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ApprovWithdrawals