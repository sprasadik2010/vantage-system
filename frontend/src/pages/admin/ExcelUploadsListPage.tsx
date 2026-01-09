import React, { useState, useEffect } from 'react'
import { getExcelUploads } from '../../services/admin'
import { format } from 'date-fns'
import { Save } from 'lucide-react'

interface ExcelUpload {
  id: number
  filename: string
  uploaded_by: number
  uploaded_at: string
  processed_at: string | null
  is_processed: boolean
  total_rows: number
  processed_rows: number
  error_rows: number
  total_distributed: number
}

const ExcelUploadsListPage: React.FC = () => {
  const [uploads, setUploads] = useState<ExcelUpload[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  useEffect(() => {
    fetchUploads()
  }, [currentPage])

const fetchUploads = async () => {
  try {
    setLoading(true)
    // Cast to any to bypass TypeScript temporarily
    const uploads = await getExcelUploads({
      skip: (currentPage - 1) * limit,
      limit: limit
    }) as any
    
    // Assuming backend returns array directly
    setUploads(uploads)
    
    // Simple pagination logic
    if (uploads.length < limit) {
      setTotalPages(currentPage)
    } else {
      setTotalPages(currentPage + 1)
    }
  } catch (error) {
    console.error('Failed to fetch uploads:', error)
  } finally {
    setLoading(false)
  }
}

  const getStatusColor = (isProcessed: boolean, errorRows: number) => {
    if (!isProcessed) return 'bg-yellow-100 text-yellow-800'
    if (errorRows > 0) return 'bg-red-100 text-red-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusText = (isProcessed: boolean, errorRows: number) => {
    if (!isProcessed) return 'Processing'
    if (errorRows > 0) return `Completed with ${errorRows} errors`
    return 'Completed'
  }

  const handleExport = (upload: ExcelUpload) => {
    // Implement export functionality
    console.log('Exporting upload:', upload.id)
  }

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Excel Upload History</h2>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading uploads...</p>
        </div>
      ) : uploads.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No uploads found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filename
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rows
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distributed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {uploads.map((upload) => (
                  <tr key={upload.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{upload.filename}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(upload.uploaded_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(upload.is_processed, upload.error_rows)}`}>
                        {getStatusText(upload.is_processed, upload.error_rows)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {upload.processed_rows}/{upload.total_rows}
                      {upload.error_rows > 0 && (
                        <span className="ml-1 text-red-600">({upload.error_rows} errors)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${upload.total_distributed.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleExport(upload)}
                        className="text-primary-600 hover:text-primary-900 flex items-center"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Export
                      </button>
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
    </div>
  )
}

export default ExcelUploadsListPage