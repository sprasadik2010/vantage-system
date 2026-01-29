import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { type RootState } from '../../store'
import { Navigate/* Routes, Route */} from 'react-router-dom'
// import Sidebar from '../components/common/Sidebar'
import toast from 'react-hot-toast'
import { getUsers } from '../../services/users'
import { getAllWithdrawals } from '../../services/withdrawal'
import { getUserReport/*, getIncomeReport*/ } from '../../services/admin'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
// import { format } from 'date-fns'

const SuperAdminDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalIncome: 0,
    totalWithdrawn: 0,
    pendingWithdrawals: 0
  })
  const [incomeData, setIncomeData] = useState<any[]>([])
  const [userGrowthData, setUserGrowthData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.is_superadmin) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const [users, withdrawals/*, userReport*/] = await Promise.all([
        getUsers(),
        getAllWithdrawals(),
        getUserReport()
      ])

      const activeUsers = users.filter(u => u.is_active).length
      const totalIncome = users.reduce((sum, u) => sum + u.total_earned, 0)
      const totalWithdrawn = users.reduce((sum, u) => sum + u.total_withdrawn, 0)
      const pendingWithdrawals = withdrawals.filter(w => w.status === 'PENDING').length

      setStats({
        totalUsers: users.length,
        activeUsers,
        totalIncome,
        totalWithdrawn,
        pendingWithdrawals
      })

      // Mock data for charts (replace with real data)
      setIncomeData([
        { name: 'Level 1', value: 45, color: '#3B82F6' },
        { name: 'Level 2', value: 25, color: '#10B981' },
        { name: 'Level 3', value: 15, color: '#F59E0B' },
        { name: 'Level 4', value: 10, color: '#8B5CF6' },
        { name: 'Level 5', value: 5, color: '#EF4444' }
      ])

      setUserGrowthData([
        { date: 'Jan', users: 100 },
        { date: 'Feb', users: 150 },
        { date: 'Mar', users: 200 },
        { date: 'Apr', users: 250 },
        { date: 'May', users: 300 },
        { date: 'Jun', users: 350 },
        { date: 'Jul', users: 400 }
      ])

    } catch (error) {
      toast.error('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (!user?.is_superadmin) {
    return <Navigate to="/overview" replace />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <Sidebar /> */}
      
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600">System overview and management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            <p className="text-sm text-green-600">{stats.activeUsers} active ({((stats.activeUsers/stats.totalUsers)*100).toFixed(1)}%)</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
            <p className="text-2xl font-semibold text-gray-900">${stats.totalIncome.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Platform earnings</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Withdrawn</h3>
            <p className="text-2xl font-semibold text-gray-900">${stats.totalWithdrawn.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Paid to users</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Platform Balance</h3>
            <p className="text-2xl font-semibold text-gray-900">${(stats.totalIncome - stats.totalWithdrawn).toFixed(2)}</p>
            <p className="text-sm text-blue-600">Available funds</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Pending Withdrawals</h3>
            <p className="text-2xl font-semibold text-gray-900">{stats.pendingWithdrawals}</p>
            <p className="text-sm text-yellow-600">Need processing</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Income Distribution Pie Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Income Distribution by Level</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Growth Line Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">System Status:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Operational
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Database:</span>
                <span className="font-medium">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">API Version:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Backup:</span>
                <span className="font-medium">Today, 02:00 AM</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Sessions:</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Storage Usage:</span>
                <span className="font-medium">1.2 GB / 10 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Uptime:</span>
                <span className="font-medium">99.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Response Time:</span>
                <span className="font-medium">142ms avg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors text-left">
            <h4 className="font-medium text-gray-900">System Settings</h4>
            <p className="text-sm text-gray-500 mt-1">Configure platform settings</p>
          </button>
          
          <button className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors text-left">
            <h4 className="font-medium text-gray-900">Audit Log</h4>
            <p className="text-sm text-gray-500 mt-1">View system activity logs</p>
          </button>
          
          <button className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors text-left">
            <h4 className="font-medium text-gray-900">Backup & Restore</h4>
            <p className="text-sm text-gray-500 mt-1">Manage database backups</p>
          </button>
        </div>
      </main>
    </div>
  )
}

export default SuperAdminDashboard