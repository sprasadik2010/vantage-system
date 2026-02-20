import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { type RootState } from '../../store'
import api from '../../services/api'
import { CURRENCY } from '../../utils/constants'
import { format } from 'date-fns'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'react-hot-toast'
import {
  DocumentArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [transactionHash, setTransactionHash] = useState<string>('')
  const [showUploadModal, setShowUploadModal] = useState<number | null>(null)
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
      await api.post('/deposit/create', {
        amount: parseFloat(amount),
        usdt_address: paymentDetails?.usdt_address
      })

      toast.success('Deposit request created successfully')
      setAmount('')
      fetchDeposits()
      fetchSummary()
      toast.success('Please upload your payment screenshot in the deposit history tab')
      setActiveTab('history')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create deposit request')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

const handleUploadScreenshot = async (depositId: number) => {
  if (!selectedFile) {
    toast.error('Please select a screenshot to upload')
    return
  }

  setUploading(depositId)
  
  try {
    // Show converting toast
    const convertingToast = toast.loading('Converting image to WebP...')

    // Convert to WebP first (optimize)
    const webpFile = await convertToWebP(selectedFile)
    
    toast.dismiss(convertingToast)
    const uploadToast = toast.loading('Uploading to ImgBB...')

    // Upload to ImgBB
    const formData = new FormData()
    formData.append('image', webpFile)
    
    // Use your ImgBB API key from environment variables
    const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error('Failed to upload to ImgBB')
    }

    // Get the image URL from ImgBB
    const imageUrl = data.data.url // Direct image URL
    // Alternative: data.data.display_url (for thumbnail) or data.data.image.url

    toast.dismiss(uploadToast)

    // Now send this URL to your backend
    const backendFormData = new FormData()
    // We don't need to append the file again, just the URL
    backendFormData.append('payment_screenshot_url', imageUrl)
    if (transactionHash) {
      backendFormData.append('transaction_hash', transactionHash)
    }

    await api.post(`/deposit/upload-screenshot/${depositId}`, backendFormData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    toast.success('Screenshot uploaded successfully')
    setShowUploadModal(null)
    setSelectedFile(null)
    setTransactionHash('')
    fetchDeposits()
    fetchSummary()
  } catch (error: any) {
    console.error('Upload error:', error)
    toast.error(error.message || 'Failed to upload screenshot')
  } finally {
    setUploading(null)
  }
}

// Add this helper function for WebP conversion
const convertToWebP = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      
      img.onload = () => {
        // Calculate dimensions (max 1200px width)
        let width = img.width
        let height = img.height
        const maxWidth = 1200
        
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        // Create canvas
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        
        // Draw image with white background
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to WebP
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const webpFile = new File(
                [blob], 
                file.name.replace(/\.[^/.]+$/, '') + '.webp', 
                { type: 'image/webp' }
              )
              resolve(webpFile)
            } else {
              reject(new Error('Failed to convert to WebP'))
            }
          },
          'image/webp',
          0.85 // Quality
        )
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image for conversion'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
  })
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">USDT Deposit</h1>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
          Deposit USDT to your account securely
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 text-left">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
              Total Deposited
            </p>
            <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-semibold text-gray-900">
              {CURRENCY.SYMBOL}{summary.total_deposited.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 text-left">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
              Pending Amount
            </p>
            <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-semibold text-yellow-600">
              {CURRENCY.SYMBOL}{summary.pending_amount.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 text-left">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
              Total Transactions
            </p>
            <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-semibold text-gray-900">
              {summary.total_transactions}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 text-left">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
              Wallet Balance
            </p>
            <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-semibold text-green-600">
              {CURRENCY.SYMBOL}{user?.wallet_balance?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4 sm:mb-6">
        <nav className="-mb-px flex space-x-6 sm:space-x-8">
          <button
            onClick={() => setActiveTab('new')}
            className={`${
              activeTab === 'new'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm text-left`}
          >
            New Deposit
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm text-left`}
          >
            Deposit History
          </button>
        </nav>
      </div>

      {activeTab === 'new' && paymentDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Payment Details Card */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 text-left">
              <h2 className="text-base sm:text-lg font-medium text-gray-900">Payment Details</h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex flex-col items-center mb-4 sm:mb-6">
                <div className="bg-gray-100 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4">
                  <QRCodeSVG
                    value={paymentDetails.usdt_address}
                    size={window.innerWidth < 640 ? 150 : 200}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                <div className="w-full text-left">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    USDT Address (TRC20)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      readOnly
                      value={paymentDetails.usdt_address}
                      className="flex-1 rounded-md sm:rounded-l-md sm:rounded-r-none border-gray-300 bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm px-3 py-2"
                    />
                    <button
                      onClick={() => copyToClipboard(paymentDetails.usdt_address)}
                      className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md sm:rounded-l-none sm:rounded-r-md bg-gray-50 text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Network:</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900">{paymentDetails.network}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Minimum Deposit:</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                    {CURRENCY.SYMBOL}{paymentDetails.min_deposit}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 bg-yellow-50 p-2 sm:p-3 rounded-md text-left">
                  ⚠️ {paymentDetails.note}
                </div>
              </div>
            </div>
          </div>

          {/* Create Deposit Form */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 text-left">
              <h2 className="text-base sm:text-lg font-medium text-gray-900">Create Deposit Request</h2>
            </div>
            <div className="p-4 sm:p-6">
              <form onSubmit={handleCreateDeposit} className="text-left">
                <div className="mb-3 sm:mb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Amount (USD)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-xs sm:text-sm">{CURRENCY.SYMBOL}</span>
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min={paymentDetails.min_deposit}
                      step="0.01"
                      required
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 text-xs sm:text-sm border-gray-300 rounded-md py-2"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="mt-1 sm:mt-2 text-xs text-gray-500 text-left">
                    Minimum: {CURRENCY.SYMBOL}{paymentDetails.min_deposit}
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

              <div className="mt-4 sm:mt-6 border-t border-gray-200 pt-4 sm:pt-6 text-left">
                <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 text-left">
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
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 text-left">
            <h2 className="text-base sm:text-lg font-medium text-gray-900">Deposit History</h2>
          </div>

          {deposits.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <DocumentArrowUpIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No deposits</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                You haven't made any deposits yet.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {deposits.map((deposit) => (
                <div key={deposit.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  {/* Card Header - Status and Amount */}
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(deposit.status)}
                      <span className="text-xs text-gray-500">
                        ID: #{deposit.id}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {CURRENCY.SYMBOL}{deposit.amount.toFixed(2)}
                    </span>
                  </div>

                  {/* Card Body - Details */}
                  <div className="p-4 space-y-3 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Date</span>
                      <span className="text-sm text-gray-900">
                        {format(new Date(deposit.created_at), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Time</span>
                      <span className="text-sm text-gray-900">
                        {format(new Date(deposit.created_at), 'HH:mm')}
                      </span>
                    </div>

                    {deposit.transaction_hash && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Tx Hash</span>
                        <span className="text-xs font-mono text-gray-900 truncate max-w-[150px]">
                          {deposit.transaction_hash.slice(0, 10)}...
                          {deposit.transaction_hash.slice(-6)}
                        </span>
                      </div>
                    )}

                    {deposit.payment_screenshot && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Screenshot</span>
                        <a
                          href={deposit.payment_screenshot}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:text-indigo-900 font-medium flex items-center"
                        >
                          <DocumentArrowUpIcon className="w-4 h-4 mr-1" />
                          View
                        </a>
                      </div>
                    )}

                    {deposit.admin_notes && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-md text-left">
                        <span className="text-xs font-medium text-blue-700">Admin Note:</span>
                        <p className="text-xs text-blue-600 mt-1">{deposit.admin_notes}</p>
                      </div>
                    )}

                    {deposit.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-md text-left">
                        <span className="text-xs font-medium text-gray-700">Your Note:</span>
                        <p className="text-xs text-gray-600 mt-1">{deposit.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer - Actions */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                    {deposit.status === 'PENDING' && !deposit.payment_screenshot ? (
                      <button
                        onClick={() => setShowUploadModal(deposit.id)}
                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <DocumentArrowUpIcon className="w-4 h-4 mr-2" />
                        Upload Payment Proof
                      </button>
                    ) : deposit.status === 'PENDING' && deposit.payment_screenshot ? (
                      <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded-md text-center flex items-center justify-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Payment proof uploaded - Awaiting confirmation
                      </div>
                    ) : deposit.status === 'COMPLETED' ? (
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded-md text-center flex items-center justify-center">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Completed on {deposit.confirmed_at ? format(new Date(deposit.confirmed_at), 'MMM dd, yyyy') : 'N/A'}
                      </div>
                    ) : deposit.status === 'FAILED' ? (
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded-md text-center flex items-center justify-center">
                        <XCircleIcon className="w-4 h-4 mr-1" />
                        Transaction failed
                      </div>
                    ) : deposit.status === 'EXPIRED' ? (
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-md text-center flex items-center justify-center">
                        <XCircleIcon className="w-4 h-4 mr-1" />
                        Deposit request expired
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => {
              setShowUploadModal(null);
              setSelectedFile(null);
              setTransactionHash('');
            }}
          />
          
          <div className="relative bg-white rounded-lg w-full max-w-md mx-auto p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto text-left">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Upload Payment Screenshot
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Transaction Hash <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={transactionHash}
                  onChange={(e) => setTransactionHash(e.target.value)}
                  placeholder="e.g., 0x1234..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-3 sm:py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Screenshot
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:py-2.5 sm:file:py-2 file:px-4 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="mt-1 text-xs text-gray-500 text-left">
                  Upload a screenshot of your payment confirmation
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(null);
                  setSelectedFile(null);
                  setTransactionHash('');
                }}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUploadScreenshot(showUploadModal)}
                disabled={uploading === showUploadModal}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {uploading === showUploadModal ? 'Uploading...' : 'Upload Proof'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default USDTDeposit