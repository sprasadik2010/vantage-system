import React, { useState, useEffect } from 'react'
import { getUserReport, getIncomeReport } from '../../services/admin'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month')
  const [userReport, setUserReport] = useState<any>(null)
  const [incomeReport, setIncomeReport] = useState<any>(null)

  useEffect(() => {
    fetchReports()
  }, [dateRange])

  const fetchReports = async () => {
    try {
      const endDate = new Date()
      const startDate = new Date()
      
      if (dateRange === 'week') {
        startDate.setDate(endDate.getDate() - 7)
      } else if (dateRange === 'month') {
        startDate.setMonth(endDate.getMonth() - 1)
      } else {
        startDate.setMonth(endDate.getMonth() - 3)
      }

      const [userData, incomeData] = await Promise.all([
        getUserReport({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        }),
        getIncomeReport({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        })
      ])

      setUserReport(userData)
      setIncomeReport(incomeData)
    } catch (error) {
      toast.error('Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  const generateMockChartData = () => {
    const data = []
    const today = new Date()
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      data.push({
        date: format(date, 'MMM dd'),
        registrations: Math.floor(Math.random() * 20) + 5,
        income: Math.floor(Math.random() * 5000) + 1000,
        withdrawals: Math.floor(Math.random() * 3000) + 500
      })
    }
    
    return data
  }

  const chartData = generateMockChartData()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Reports & Analytics</h2>
          
          <div className="flex space-x-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
            </select>
            
            <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
              Export Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800">Total Users</h3>
            <p className="text-2xl font-semibold text-blue-900">{userReport?.statistics?.total_users || 0}</p>
            <p className="text-xs text-blue-700">{userReport?.statistics?.active_users || 0} active users</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800">Total Income</h3>
            <p className="text-2xl font-semibold text-green-900">${userReport?.statistics?.total_income?.toFixed(2) || '0.00'}</p>
            <p className="text-xs text-green-700">Platform earnings</p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-800">Total Withdrawn</h3>
            <p className="text-2xl font-semibold text-purple-900">${userReport?.statistics?.total_withdrawals?.toFixed(2) || '0.00'}</p>
            <p className="text-xs text-purple-700">Paid to users</p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800">Platform Balance</h3>
            <p className="text-2xl font-semibold text-yellow-900">
              ${((userReport?.statistics?.total_income || 0) - (userReport?.statistics?.total_withdrawals || 0)).toFixed(2)}
            </p>
            <p className="text-xs text-yellow-700">Available funds</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Registrations Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="registrations" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Income vs Withdrawals Chart */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Income vs Withdrawals</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" name="Income" />
                  <Bar dataKey="withdrawals" fill="#f59e0b" name="Withdrawals" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Income Distribution Table */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Income Distribution by Level</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Income Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transactions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incomeReport?.distribution?.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Level {item.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {item.income_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${item.total_amount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.percentage}%
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No income distribution data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports