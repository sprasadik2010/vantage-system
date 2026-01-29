import React, { useState, useEffect } from 'react'
// import { useSelector } from 'react-redux'
// import { type RootState } from '../store'
import { getMyIncome } from '../../services/income'
import { format } from 'date-fns'
import { /*LineChart, Line, */BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { Income } from '../../types'

// interface IncomeRecord {
//   id: number
//   amount: number
//   percentage: number
//   level: number
//   income_type: string
//   description: string
//   source_vantage_username: string
//   source_income_amount: number
//   created_at: string
// }

const IncomePage: React.FC = () => {
//   const { user } = useSelector((state: RootState) => state.auth)
  const [incomes, setIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    type: 'all',
    period: 'all'
  })

  useEffect(() => {
    fetchIncomes()
  }, [])

  const fetchIncomes = async () => {
    try {
      setLoading(true)
      const data = await getMyIncome()
      setIncomes(data)
    } catch (error) {
      console.error('Failed to fetch incomes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredIncomes = incomes.filter(income => {
    if (filter.type !== 'all' && income.income_type !== filter.type) return false
    if (filter.period !== 'all') {
      const incomeDate = new Date(income.created_at)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - incomeDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (filter.period === 'today' && diffDays > 1) return false
      if (filter.period === 'week' && diffDays > 7) return false
      if (filter.period === 'month' && diffDays > 30) return false
    }
    return true
  })

  const totalEarned = filteredIncomes.reduce((sum, income) => sum + income.amount, 0)
  // const dailyIncome = incomes.filter(i => i.income_type === 'DAILY').reduce((sum, i) => sum + i.amount, 0)
  const weeklyIncome = incomes.filter(i => i.income_type === 'WEEKLY').reduce((sum, i) => sum + i.amount, 0)
  // const monthlyIncome = incomes.filter(i => i.income_type === 'MONTHLY').reduce((sum, i) => sum + i.amount, 0)

  // Prepare chart data
  // const dailyData = incomes
  //   .filter(i => i.income_type === 'DAILY')
  //   .reduce((acc: any[], income) => {
  //     const date = format(new Date(income.created_at), 'MMM dd')
  //     const existing = acc.find(item => item.date === date)
  //     if (existing) {
  //       existing.amount += income.amount
  //     } else {
  //       acc.push({ date, amount: income.amount })
  //     }
  //     return acc
  //   }, [])
  //   .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  //   .slice(-7)

  const levelData = [1, 2, 3, 4, 5].map(level => ({
    level: `Level ${level}`,
    amount: incomes.filter(i => i.level === level).reduce((sum, i) => sum + i.amount, 0)
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Income History</h1>
          <p className="mt-1 text-sm text-gray-500">Track your earnings from income distribution</p>
        </div>
        <div className="flex space-x-4">
          <select
            value={filter.type}
            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
            className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {/* <option value="all">All Types</option>
            <option value="DAILY">DAILY</option> */}
            <option value="WEEKLY">WEEKLY</option>
            {/* <option value="MONTHLY">MONTHLY</option> */}
          </select>
          <select
            value={filter.period}
            onChange={(e) => setFilter(prev => ({ ...prev, period: e.target.value }))}
            className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Earned</h3>
              <p className="text-2xl font-bold text-gray-900">${totalEarned.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Daily Income</h3>
              <p className="text-2xl font-bold text-gray-900">${dailyIncome.toFixed(2)}</p>
            </div>
          </div>
        </div> */}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Weekly Income</h3>
              <p className="text-2xl font-bold text-gray-900">${weeklyIncome.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Monthly Income</h3>
              <p className="text-2xl font-bold text-gray-900">${monthlyIncome.toFixed(2)}</p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Income Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Income']} />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Income by Level</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={levelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Income']} />
                <Legend />
                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Income Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Income Records</h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-sm text-gray-500">Loading incomes...</p>
            </div>
          ) : filteredIncomes.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">No income records found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIncomes.map((income) => (
                  <tr key={income.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(income.created_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        // income.income_type === 'DAILY' ? 'bg-blue-100 text-blue-800' :
                        income.income_type === 'WEEKLY' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {income.income_type.charAt(0).toUpperCase() + income.income_type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Level {income.level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(income.percentage * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${income.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      From: {income.source_vantage_username}
                      <br />
                      <span className="text-xs">Source amount: ${income.source_income_amount.toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default IncomePage