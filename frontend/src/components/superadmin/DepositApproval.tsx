import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { type RootState } from '../../store'
import api from '../../services/api'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowPathIcon,
  BanknotesIcon,
  UserIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Deposit {
  id: number
  user_id: number
  amount: number
  status: 'PENDING' | 'CONFIRMING' | 'COMPLETED' | 'FAILED' | 'EXPIRED'
  usdt_address: string
  transaction_hash: string | null
  payment_screenshot: string | null
  notes: string | null
  admin_notes: string | null
  created_at: string
  confirmed_at: string | null
  user: {
    id: number
    username: string
    full_name: string
    email: string
    wallet_balance: number
  }
}

interface DepositStats {
  total_deposits: number
  pending_amount: number
  confirming_amount: number
  status_counts: Record<string, number>
  today_deposits: number
  week_deposits: number
  month_deposits: number
  total_transactions: number
}

const DepositApproval: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [stats, setStats] = useState<DepositStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showManualModal, setShowManualModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [filter, setFilter] = useState({
    status: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  })
  const [manualData, setManualData] = useState({
    user_id: '',
    amount: '',
    transaction_hash: '',
    notes: ''
  })

  useEffect(() => {
    fetchDeposits()
    fetchStats()
  }, [filter])

  const fetchDeposits = async () => {
    setLoading(true)
    try {
      let url = '/deposit/admin/all?limit=100'
      if (filter.status) {
        url += `&status=${filter.status}`
      }
      const response = await api.get(url)
      setDeposits(response.data)
    } catch (error) {
      console.error('Error fetching deposits:', error)
      toast.error('Failed to load deposits')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/deposit/admin/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleProcessDeposit = async (depositId: number, status: string, adminNotes: string = '') => {
    setProcessing(depositId)
    try {
      await api.put(`/deposit/admin/process/${depositId}`, {
        status,
        admin_notes: adminNotes
      })

      toast.success(`Deposit ${status.toLowerCase()} successfully`)
      fetchDeposits()
      fetchStats()
      setSelectedDeposit(null)
      setShowDetailModal(false)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to process deposit')
    } finally {
      setProcessing(null)
    }
  }

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!manualData.user_id || !manualData.amount) {
      toast.error('User ID and amount are required')
      return
    }

    const formData = new FormData()
    formData.append('user_id', manualData.user_id)
    formData.append('amount', manualData.amount)
    if (manualData.transaction_hash) formData.append('transaction_hash', manualData.transaction_hash)
    if (manualData.notes) formData.append('notes', manualData.notes)

    try {
      await api.post('/deposit/admin/manual-add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('Manual deposit added successfully')
      setShowManualModal(false)
      setManualData({ user_id: '', amount: '', transaction_hash: '', notes: '' })
      fetchDeposits()
      fetchStats()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add manual deposit')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      CONFIRMING: { color: 'bg-blue-100 text-blue-800', icon: ArrowPathIcon },
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      FAILED: { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
      EXPIRED: { color: 'bg-gray-100 text-gray-800', icon: XCircleIcon }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setShowImageModal(true)
  }

  if (!user?.is_superadmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-gray-600">You don't have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Deposit Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Review and process user deposit requests
          </p>
        </div>
        <button
          onClick={() => setShowManualModal(true)}
          className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <BanknotesIcon className="h-5 w-5 mr-2" />
          Manual Add
        </button>
      </div>

      {/* Statistics Cards - Responsive Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Deposits</p>
            <p className="mt-1 sm:mt-2 text-lg sm:text-3xl font-semibold text-gray-900">
              {formatCurrency(stats.total_deposits)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {stats.total_transactions} txns
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Pending</p>
            <p className="mt-1 sm:mt-2 text-lg sm:text-3xl font-semibold text-yellow-600">
              {formatCurrency(stats.pending_amount)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {stats.status_counts.PENDING || 0} req
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Confirming</p>
            <p className="mt-1 sm:mt-2 text-lg sm:text-3xl font-semibold text-blue-600">
              {formatCurrency(stats.confirming_amount)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {stats.status_counts.CONFIRMING || 0} waiting
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Today</p>
            <p className="mt-1 sm:mt-2 text-lg sm:text-3xl font-semibold text-green-600">
              {formatCurrency(stats.today_deposits)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Week: {formatCurrency(stats.week_deposits)}
            </p>
          </div>
        </div>
      )}

      {/* Filters - Stack on mobile */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Filters</h2>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMING">Confirming</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                placeholder="Search user..."
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={filter.dateFrom}
              onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={filter.dateTo}
              onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Deposits - Cards for mobile, Table for desktop */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Deposit Requests</h2>
          <button
            onClick={fetchDeposits}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-500">Loading deposits...</p>
          </div>
        ) : deposits.length === 0 ? (
          <div className="text-center py-12">
            <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No deposits</h3>
            <p className="mt-1 text-sm text-gray-500">
              No deposit requests found matching your criteria.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Cards View (visible on small screens) */}
            {/* Mobile Cards View - Alternative with more separation */}
            <div className="block sm:hidden space-y-4">
              {deposits
                .filter(deposit =>
                  filter.search === '' ||
                  deposit.user.full_name.toLowerCase().includes(filter.search.toLowerCase()) ||
                  deposit.user.email.toLowerCase().includes(filter.search.toLowerCase()) ||
                  deposit.user.username.toLowerCase().includes(filter.search.toLowerCase())
                )
                .filter(deposit =>
                  (!filter.dateFrom || new Date(deposit.created_at) >= new Date(filter.dateFrom)) &&
                  (!filter.dateTo || new Date(deposit.created_at) <= new Date(filter.dateTo))
                )
                .map((deposit) => (
                  <div key={deposit.id} className="bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {/* Colored status strip */}
                    <div className={`h-1.5 w-full ${deposit.status === 'PENDING' ? 'bg-yellow-500' :
                        deposit.status === 'CONFIRMING' ? 'bg-blue-500' :
                          deposit.status === 'COMPLETED' ? 'bg-green-500' :
                            deposit.status === 'FAILED' ? 'bg-red-500' : 'bg-gray-500'
                      }`} />

                    <div className="p-4">
                      {/* Header with ID and Status */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-xs text-gray-400">Deposit ID: #{deposit.id}</span>
                          <h3 className="font-bold text-gray-900 mt-1">{deposit.user.full_name}</h3>
                        </div>
                        <div className="ml-2">
                          {getStatusBadge(deposit.status)}
                        </div>
                      </div>

                      {/* Email */}
                      <p className="text-sm text-gray-600 mb-4 pb-3 border-b border-gray-100">
                        {deposit.user.email}
                      </p>

                      {/* Amount and Balance */}
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Deposit Amount</p>
                          <p className="text-xl font-bold text-indigo-600">{formatCurrency(deposit.amount)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Wallet Balance</p>
                          <p className="text-lg font-semibold text-gray-700">{formatCurrency(deposit.user.wallet_balance)}</p>
                        </div>
                      </div>

                      {/* Date and Screenshot */}
                      <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Requested Date</p>
                          <p className="text-sm font-medium text-gray-700">
                            {format(new Date(deposit.created_at), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Screenshot</p>
                          {deposit.payment_screenshot ? (
                            <button
                              onClick={() => openImageModal(deposit.payment_screenshot!)}
                              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            >
                              <PhotoIcon className="h-4 w-4 mr-1" />
                              View
                            </button>
                          ) : (
                            <span className="text-sm text-gray-400">Not uploaded</span>
                          )}
                        </div>
                      </div>

                      {/* Transaction Hash */}
                      {deposit.transaction_hash && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                          <div className="bg-gray-100 p-2 rounded font-mono text-xs break-all">
                            {deposit.transaction_hash}
                          </div>
                        </div>
                      )}

                      {/* Process Button */}
                      <button
                        onClick={() => {
                          setSelectedDeposit(deposit)
                          setShowDetailModal(true)
                        }}
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                      >
                        Process Deposit
                        <span className="ml-2">→</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Desktop Table View (hidden on mobile) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Screenshot</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deposits
                    .filter(deposit =>
                      filter.search === '' ||
                      deposit.user.full_name.toLowerCase().includes(filter.search.toLowerCase()) ||
                      deposit.user.email.toLowerCase().includes(filter.search.toLowerCase()) ||
                      deposit.user.username.toLowerCase().includes(filter.search.toLowerCase())
                    )
                    .filter(deposit =>
                      (!filter.dateFrom || new Date(deposit.created_at) >= new Date(filter.dateFrom)) &&
                      (!filter.dateTo || new Date(deposit.created_at) <= new Date(filter.dateTo))
                    )
                    .map((deposit) => (
                      <tr key={deposit.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{deposit.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{deposit.user.full_name}</div>
                          <div className="text-sm text-gray-500">{deposit.user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(deposit.amount)}</div>
                          <div className="text-xs text-gray-500">Balance: {formatCurrency(deposit.user.wallet_balance)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(deposit.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(deposit.created_at), 'MMM dd, yyyy HH:mm')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {deposit.payment_screenshot ? (
                            <button
                              onClick={() => openImageModal(deposit.payment_screenshot!)}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              View
                            </button>
                          ) : (
                            'No screenshot'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => {
                              setSelectedDeposit(deposit)
                              setShowDetailModal(true)
                            }}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Process
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Image Modal */}
      {/* Image Modal - Minimal, clean design */}
      {showImageModal && selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={() => setShowImageModal(false)}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-80" />

          {/* Close button in corner */}
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 z-[101] text-white/80 hover:text-white bg-black/30 hover:bg-black/50 rounded-full p-2 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Image with max size constraints */}
          <div className="relative z-[100] p-4">
            <img
              src={selectedImage}
              alt="Payment Screenshot"
              className="max-w-[95vw] max-h-[85vh] w-auto h-auto object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Process Deposit Modal - Make it responsive */}
      {showDetailModal && selectedDeposit && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDetailModal(false)} />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Process Deposit #{selectedDeposit.id}
                  </h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
                  {/* User Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <UserIcon className="h-4 w-4 mr-2" />
                      User Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Name:</p>
                        <p className="font-medium">{selectedDeposit.user.full_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Email:</p>
                        <p className="font-medium break-all">{selectedDeposit.user.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Username:</p>
                        <p className="font-medium">{selectedDeposit.user.username}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Current Balance:</p>
                        <p className="font-medium text-green-600">
                          {formatCurrency(selectedDeposit.user.wallet_balance)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Deposit Details */}
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Deposit Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Amount:</p>
                        <p className="font-medium text-lg text-indigo-600">
                          {formatCurrency(selectedDeposit.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Status:</p>
                        <div className="mt-1">{getStatusBadge(selectedDeposit.status)}</div>
                      </div>
                      <div>
                        <p className="text-gray-500">Requested:</p>
                        <p className="font-medium">{format(new Date(selectedDeposit.created_at), 'MMM dd, yyyy HH:mm')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">USDT Address:</p>
                        <p className="font-medium text-xs break-all">{selectedDeposit.usdt_address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Proof */}
                  {selectedDeposit.payment_screenshot && (
                    <div className="border rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Proof</h4>
                      <div className="space-y-2">
                        {selectedDeposit.transaction_hash && (
                          <div>
                            <p className="text-gray-500 text-xs">Transaction Hash:</p>
                            <p className="font-mono text-xs break-all">{selectedDeposit.transaction_hash}</p>
                          </div>
                        )}
                        <div className="mt-2 cursor-pointer" onClick={() => openImageModal(selectedDeposit.payment_screenshot!)}>
                          <img
                            src={selectedDeposit.payment_screenshot}
                            alt="Payment Screenshot"
                            className="max-h-48 rounded-lg border hover:opacity-75 transition-opacity"
                          />
                          <p className="text-xs text-indigo-600 mt-1">Click to enlarge</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes
                    </label>
                    <textarea
                      id="adminNotes"
                      rows={3}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Add notes about this deposit..."
                    />
                  </div>

                  {/* Action Buttons - Stack on mobile */}
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                    {selectedDeposit.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => {
                            const notes = (document.getElementById('adminNotes') as HTMLTextAreaElement).value
                            handleProcessDeposit(selectedDeposit.id, 'CONFIRMING', notes)
                          }}
                          disabled={processing === selectedDeposit.id}
                          className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                          {processing === selectedDeposit.id ? 'Processing...' : 'Mark as Confirming'}
                        </button>
                      </>
                    )}

                    {selectedDeposit.status === 'CONFIRMING' && (
                      <>
                        <button
                          onClick={() => {
                            const notes = (document.getElementById('adminNotes') as HTMLTextAreaElement).value
                            handleProcessDeposit(selectedDeposit.id, 'COMPLETED', notes)
                          }}
                          disabled={processing === selectedDeposit.id}
                          className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                          {processing === selectedDeposit.id ? 'Processing...' : 'Approve & Complete'}
                        </button>
                        <button
                          onClick={() => {
                            const notes = (document.getElementById('adminNotes') as HTMLTextAreaElement).value
                            handleProcessDeposit(selectedDeposit.id, 'FAILED', notes)
                          }}
                          disabled={processing === selectedDeposit.id}
                          className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                        >
                          {processing === selectedDeposit.id ? 'Processing...' : 'Mark as Failed'}
                        </button>
                      </>
                    )}

                    {(selectedDeposit.status === 'PENDING' || selectedDeposit.status === 'CONFIRMING') && (
                      <button
                        onClick={() => setShowDetailModal(false)}
                        className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    )}

                    {(selectedDeposit.status === 'COMPLETED' || selectedDeposit.status === 'FAILED' || selectedDeposit.status === 'EXPIRED') && (
                      <button
                        onClick={() => setShowDetailModal(false)}
                        className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Modal - Make it responsive */}
      {showManualModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowManualModal(false)} />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleManualAdd}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Manual Deposit Addition
                  </h3>

                  <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        User ID *
                      </label>
                      <input
                        type="number"
                        value={manualData.user_id}
                        onChange={(e) => setManualData({ ...manualData, user_id: e.target.value })}
                        required
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter user ID"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount (USD) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={manualData.amount}
                        onChange={(e) => setManualData({ ...manualData, amount: e.target.value })}
                        required
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction Hash
                      </label>
                      <input
                        type="text"
                        value={manualData.transaction_hash}
                        onChange={(e) => setManualData({ ...manualData, transaction_hash: e.target.value })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Optional"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        rows={3}
                        value={manualData.notes}
                        onChange={(e) => setManualData({ ...manualData, notes: e.target.value })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Reason for manual addition"
                      />
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-md">
                      <p className="text-sm text-yellow-700">
                        ⚠️ This will directly add funds to the user's wallet. Use only for manual corrections or special cases.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                  >
                    Add Deposit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowManualModal(false)}
                    className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DepositApproval