import React, { useState, useEffect } from 'react'
import { getAllWithdrawals, processWithdrawal } from '../../services/withdrawal'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Eye, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
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
        withdrawal_status: filterStatus === 'all' ? undefined : filterStatus
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
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Withdrawal Requests</h2>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
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
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading withdrawal requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 text-gray-400">
            <Download className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No withdrawal requests</h3>
          <p className="mt-2 text-gray-500 max-w-sm mx-auto">
            {filterStatus !== 'all' ? `No ${filterStatus.toLowerCase()} withdrawal requests found` : 'No withdrawal requests have been made yet'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
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
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {request.user && request.user.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.user && request.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-semibold text-gray-900">
                        ${request.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(request.requested_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      {request.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleProcess(request.id, 'APPROVED')}
                            disabled={processing}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleProcess(request.id, 'REJECTED')}
                            disabled={processing}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
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

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{request.user?.full_name}</h3>
                    <p className="text-sm text-gray-500 truncate">{request.user?.email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="text-lg font-semibold text-gray-900">${request.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Requested</p>
                    <p className="text-sm text-gray-900">
                      {format(new Date(request.requested_at), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="flex-1 min-w-[120px] inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  {request.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleProcess(request.id, 'APPROVED')}
                        disabled={processing}
                        className="flex-1 min-w-[120px] inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleProcess(request.id, 'REJECTED')}
                        disabled={processing}
                        className="flex-1 min-w-[120px] inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination - Responsive */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between px-2">
            <div className="mb-4 sm:mb-0">
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center space-x-1">
                {[...Array(Math.min(3, totalPages))].map((_, i) => {
                  let pageNum: number;
                  if (totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage <= 2) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 1) {
                    pageNum = totalPages - 2 + i;
                  } else {
                    pageNum = currentPage - 1 + i;
                  }

                  if (pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${currentPage === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 3 && currentPage < totalPages - 1 && (
                  <>
                    <span className="px-1">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${currentPage === totalPages
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal for viewing details */}
      {selectedRequest && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={() => setSelectedRequest(null)}
          />

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div
                className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all w-full max-w-lg mx-auto my-8"
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
                            className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
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
                            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                          >
                            Reject Withdrawal
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(null)}
                        className={`inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${selectedRequest.status === 'PENDING' ? 'sm:col-span-2' : ''
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