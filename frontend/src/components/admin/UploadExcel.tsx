import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { uploadExcel } from '../../services/admin'

const UploadExcel: React.FC = () => {
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      if (file.type.includes('excel') || file.type.includes('spreadsheet') || 
          file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setFile(file)
      } else {
        toast.error('Please upload an Excel file (.xlsx or .xls)')
      }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  })

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      await uploadExcel(formData)
      toast.success('Excel uploaded successfully! Processing in background.')
      setFile(null)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Excel for Income Distribution</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-2">Upload Excel file containing vantage broker usernames and income data.</p>
        <p className="text-sm text-gray-500">Required columns: vantage_username, amount, income_type (DAILY/WEEKLY/MONTHLY)</p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}`}
      >
        <input {...getInputProps()} />
        
        {file ? (
          <div className="space-y-2">
            <div className="text-primary-600">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-gray-400">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="font-medium">Drop your Excel file here, or click to browse</p>
            <p className="text-sm text-gray-500">Supports .xlsx and .xls files</p>
          </div>
        )}
      </div>

      {file && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading...
              </>
            ) : (
              'Upload and Process'
            )}
          </button>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Income Distribution Rules</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Income is distributed to 5 levels up from the target user</li>
          <li>• Level 1: 2% (with referral bonus based on direct referrals)</li>
          <li>• Level 2: 2% (if user has 2+ direct referrals)</li>
          <li>• Level 3: 2% (if user has 3+ direct referrals)</li>
          <li>• Level 4: 2% (if user has 4+ direct referrals)</li>
          <li>• Level 5: 2% (if user has 5+ direct referrals)</li>
        </ul>
      </div>
    </div>
  )
}

export default UploadExcel