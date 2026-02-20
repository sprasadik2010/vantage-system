import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { type RootState } from '../../store'
import api from '../../services/api'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import { QRCodeSVG } from 'qrcode.react'
import {
  // ArrowDownTrayIcon,
  DocumentArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Deposit {
  id: number
  amount: number
  status: 'PENDING' | 'CONFIRMING' | 'COMPLETED' | 'FAILED' | 'EXPIRED'
  usdt_address: string
  transaction_hash: string | null
  payment_screenshot: string | null
  notes: string | null
  admin_notes: string | null
  created_at: string
  confirmed_at: string | null
}

interface DepositSummary {
  total_deposited: number
  pending_amount: number
  status_counts: Record<string, number>
  total_transactions: number
}

interface PaymentDetails {
  usdt_address: string
  usdt_qr_code: string
  network: string
  min_deposit: number
  note: string
}

const USDTDeposit: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [summary, setSummary] = useState<DepositSummary | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [amount, setAmount] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<number | null>(null)
  const [screenshotUrl, setScreenshotUrl] = useState<string>('')
  const [transactionHash, setTransactionHash] = useState<string>('')
  const [showUploadModal, setShowUploadModal] = useState<number | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new')

  useEffect(() => {
    fetchDeposits()
    fetchSummary()
    fetchPaymentDetails()
  }, [])

  const fetchDeposits = async () => {
    try {
      const response = await api.get('/deposit/my-deposits?limit=50')
      setDeposits(response.data)
    } catch (error) {
      console.error('Error fetching deposits:', error)
      toast.error('Failed to load deposit history')
    }
  }

  const fetchSummary = async () => {
    try {
      const response = await api.get('/deposit/summary')
      setSummary(response.data)
    } catch (error) {
      console.error('Error fetching summary:', error)
    }
  }

  const fetchPaymentDetails = async () => {
    try {
      const response = await api.get('/deposit/payment-details')
      setPaymentDetails(response.data)
    } catch (error) {
      console.error('Error fetching payment details:', error)
    }
  }

  const handleCreateDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) < (paymentDetails?.min_deposit || 10)) {
      toast.error(`Minimum deposit amount is $${paymentDetails?.min_deposit || 10}`)
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/deposit/create', {
        amount: parseFloat(amount),
        usdt_address: paymentDetails?.usdt_address
      })
      
      toast.success('Deposit request created successfully')
      setAmount('')
      fetchDeposits()
      fetchSummary()
      setShowUploadModal(response.data.id)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create deposit request')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadScreenshot = async (depositId: number) => {
    if (!screenshotUrl) {
      toast.error('Please provide the screenshot URL')
      return
    }

    const formData = new FormData()
    formData.append('payment_screenshot_url', screenshotUrl)
    if (transactionHash) {
      formData.append('transaction_hash', transactionHash)
    }

    setUploading(depositId)
    try {
      await api.post(`/deposit/upload-screenshot/${depositId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      toast.success('Screenshot submitted successfully')
      setShowUploadModal(null)
      setScreenshotUrl('')
      setTransactionHash('')
      fetchDeposits()
      fetchSummary()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to submit screenshot')
    } finally {
      setUploading(null)
    }
  }

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setShowImageModal(true)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      CONFIRMING: { color: 'bg-blue-100 text-blue-800', icon: ExclamationCircleIcon },
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      FAILED: { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
      EXPIRED: { color: 'bg-gray-100 text-gray-800', icon: XCircleIcon }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {status}
      </span>
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Address copied to clipboard')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">USDT Deposit</h1>
        <p className="mt-2 text-sm text-gray-600">
          Deposit USDT to your account securely
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600 truncate">
              Total Deposited
            </p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {formatCurrency(summary.total_deposited)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600 truncate">
              Pending Amount
            </p>
            <p className="mt-2 text-3xl font-semibold text-yellow-600">
              {formatCurrency(summary.pending_amount)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600 truncate">
              Total Transactions
            </p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {summary.total_transactions}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600 truncate">
              Wallet Balance
            </p>
            <p className="mt-2 text-3xl font-semibold text-green-600">
              {formatCurrency(user?.wallet_balance || 0)}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('new')}
            className={`${
              activeTab === 'new'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            New Deposit
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Deposit History
          </button>
        </nav>
      </div>

      {activeTab === 'new' && paymentDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Details Card */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Payment Details</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                {/* QR Code */}
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <QRCodeSVG 
                    value={paymentDetails.usdt_address}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                
                {/* USDT Address */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    USDT Address (TRC20)
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      readOnly
                      value={paymentDetails.usdt_address}
                      className="flex-1 rounded-l-md border-gray-300 bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(paymentDetails.usdt_address)}
                      className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:text-gray-700"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Network:</span>
                  <span className="font-medium text-gray-900">{paymentDetails.network}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Minimum Deposit:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(paymentDetails.min_deposit)}
                  </span>
                </div>
                <div className="text-sm text-gray-500 bg-yellow-50 p-3 rounded-md">
                  ⚠️ {paymentDetails.note}
                </div>
              </div>
            </div>
          </div>

          {/* Create Deposit Form */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Create Deposit Request</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreateDeposit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (USD)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min={paymentDetails.min_deposit}
                      step="0.01"
                      required
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Minimum: {formatCurrency(paymentDetails.min_deposit)}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Deposit Request'}
                </button>
              </form>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li>Enter the amount you want to deposit</li>
                  <li>Create a deposit request</li>
                  <li>Send exact USDT amount to the provided address</li>
                  <li>Upload payment screenshot with transaction hash</li>
                  <li>Wait for admin confirmation (usually within 1-2 hours)</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Deposit History</h2>
          </div>
          
          {deposits.length === 0 ? (
            <div className="text-center py-12">
              <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No deposits</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't made any deposits yet.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Cards View */}
              <div className="block sm:hidden">
                {deposits.map((deposit) => (
                  <div key={deposit.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs text-gray-500">#{deposit.id}</span>
                        <div className="mt-1">{getStatusBadge(deposit.status)}</div>
                      </div>
                      <p className="font-semibold text-indigo-600">{formatCurrency(deposit.amount)}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="text-xs">{format(new Date(deposit.created_at), 'MMM dd, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Screenshot</p>
                        {deposit.payment_screenshot ? (
                          <button
                            onClick={() => openImageModal(deposit.payment_screenshot!)}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center text-xs"
                          >
                            <PhotoIcon className="h-4 w-4 mr-1" />
                            View
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">No</span>
                        )}
                      </div>
                    </div>

                    {deposit.transaction_hash && (
                      <div className="mb-2 text-xs">
                        <span className="text-gray-500">Tx: </span>
                        <span className="font-mono text-gray-700">{deposit.transaction_hash.slice(0, 10)}...</span>
                      </div>
                    )}

                    {deposit.status === 'PENDING' && !deposit.payment_screenshot && (
                      <button
                        onClick={() => setShowUploadModal(deposit.id)}
                        className="mt-2 text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Upload Proof
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction Hash
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Screenshot
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deposits.map((deposit) => (
                      <tr key={deposit.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          #{deposit.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(deposit.created_at), 'MMM dd, yyyy HH:mm')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(deposit.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(deposit.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {deposit.transaction_hash ? (
                            <span className="font-mono text-xs">
                              {deposit.transaction_hash.slice(0, 10)}...
                            </span>
                          ) : (
                            '-'
                          )}
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
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {deposit.status === 'PENDING' && !deposit.payment_screenshot && (
                            <button
                              onClick={() => setShowUploadModal(deposit.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Upload Proof
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowUploadModal(null)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Upload Payment Screenshot
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction Hash (Optional)
                    </label>
                    <input
                      type="text"
                      value={transactionHash}
                      onChange={(e) => setTransactionHash(e.target.value)}
                      placeholder="e.g., 0x1234..."
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Screenshot URL (from ImgBB)
                    </label>
                    <input
                      type="url"
                      value={screenshotUrl}
                      onChange={(e) => setScreenshotUrl(e.target.value)}
                      placeholder="https://i.ibb.co/..."
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Upload your screenshot to ImgBB and paste the direct image URL here
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-700">
                      📸 How to upload to ImgBB:
                    </p>
                    <ol className="list-decimal list-inside text-xs text-blue-600 mt-2 space-y-1">
                      <li>Go to <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="underline">ImgBB.com</a></li>
                      <li>Upload your payment screenshot</li>
                      <li>Copy the "Direct link" (ends with .jpg/.png)</li>
                      <li>Paste it in the field above</li>
                    </ol>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleUploadScreenshot(showUploadModal)}
                  disabled={uploading === showUploadModal || !screenshotUrl}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {uploading === showUploadModal ? 'Uploading...' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(null)
                    setScreenshotUrl('')
                    setTransactionHash('')
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
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
    </div>
  )
}

export default USDTDeposit