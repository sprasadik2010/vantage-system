import React from 'react'
import UploadExcel from '../../components/admin/UploadExcel'

const UploadExcelPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Upload Excel for Income Distribution</h1>
              <p className="mt-1 text-sm text-gray-600">
                Upload Excel files containing vantage broker usernames and income data
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Back
              </button>
              {/* <a
                href="/admin"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Admin Dashboard
              </a> */}
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500 truncate">Required Columns</dt>
                    <dd className="text-lg font-semibold text-gray-900">3 Columns</dd>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500 truncate">File Format</dt>
                    <dd className="text-lg font-semibold text-gray-900">.xlsx / .xls</dd>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500 truncate">Max File Size</dt>
                    <dd className="text-lg font-semibold text-gray-900">10 MB</dd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Component */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <UploadExcel />
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Upload Instructions</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Excel file must contain these exact column names: <code className="font-mono">vantage_username</code>, <code className="font-mono">amount</code>, <code className="font-mono">income_type</code></li>
                    {/* <li><code className="font-mono">income_type</code> must be one of: <code className="font-mono">DAILY</code>, <code className="font-mono">WEEKLY</code>, or <code className="font-mono">MONTHLY</code></li> */}
                    <li><code className="font-mono">income_type</code> must be: <code className="font-mono">WEEKLY</code></li>
                    <li>Amount should be in numbers (e.g., 1500.00)</li>
                    <li>Vantage username should match exactly with user's saved vantage broker username</li>
                    <li>Income will be distributed to 5 levels up from each user found in the Excel</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Data Table */}
          <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Sample Excel Data Format</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-100">
                      vantage_username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-100">
                      amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-100">
                      income_type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      vbu100
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      1500.00
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      WEEKLY
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      vbu101
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      2500.50
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      WEEKLY
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      vbu102
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      10000.00
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      WEEKLY
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-4 py-4 sm:px-6 bg-gray-50">
              <div className="text-sm text-gray-600">
                <p>Download a sample Excel template: <a href="#" className="text-primary-600 hover:text-primary-500 font-medium">sample_template.xlsx</a></p>
              </div>
            </div>
          </div>

          {/* Distribution Rules */}
          <div className="mt-6 bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-primary-900 mb-4">Income Distribution Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { level: 1, percentage: "02%", condition: "Direct referral" },
                { level: 2, percentage: "02%", condition: "If user has 2+ direct referrals" },
                { level: 3, percentage: "02%", condition: "If user has 3+ direct referrals" },
                { level: 4, percentage: "02%", condition: "If user has 4+ direct referrals" },
                { level: 5, percentage: "02%", condition: "If user has 5+ direct referrals" },
              ].map((rule) => (
                <div key={rule.level} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 text-lg font-bold">
                      {rule.level}
                    </div>
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900">{rule.percentage}</div>
                      <div className="mt-1 text-sm text-gray-600">{rule.condition}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Example Distribution:</h4>
              <p className="text-sm text-gray-600">
                If user <code className="font-mono">vbu100</code> has income of $1500, and has a referral chain of 5 levels:
              </p>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>• Level 1 (Direct referral): $30 (02% of $1500)</li>
                <li>• Level 2: $30 (02% of $1500)</li>
                <li>• Level 3: $30 (02% of $1500)</li>
                <li>• Level 4: $30 (02% of $1500)</li>
                <li>• Level 5: $30 (02% of $1500)</li>
                <li className="font-medium">• Total Distributed: $1500</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadExcelPage