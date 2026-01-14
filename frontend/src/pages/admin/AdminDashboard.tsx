import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { type RootState } from '../../store'
import { Routes, Route, Navigate } from 'react-router-dom'
// import Sidebar from '../components/common/Sidebar'
import UploadExcel from '../../components/admin/UploadExcel'
import toast from 'react-hot-toast'
import { getUsers } from '../../services/users'
import { getAllWithdrawals } from '../../services/withdrawal'
import { getExcelUploads } from '../../services/admin'
// import { User, WithdrawalRequest, ExcelUpload } from '../types'

const AdminDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingWithdrawals: 0,
    totalIncome: 0,
    recentUploads: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.is_admin) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const [users, withdrawals, uploads] = await Promise.all([
        getUsers(),
        getAllWithdrawals({ status: 'PENDING' }),
        getExcelUploads({ limit: 10 })
      ])

      const activeUsers = users.filter(u => u.is_active).length
      const totalIncome = users.reduce((sum, u) => sum + u.total_earned, 0)

      setStats({
        totalUsers: users.length,
        activeUsers,
        pendingWithdrawals: withdrawals.length,
        totalIncome,
        recentUploads: uploads.length
      })
    } catch (error) {
      toast.error('Failed to fetch admin statistics')
    } finally {
      setLoading(false)
    }
  }

  if (!user?.is_admin) {
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
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.full_name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-2xl">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                <p className="text-sm text-green-600">{stats.activeUsers} active</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-2xl">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
                <p className="text-2xl font-semibold text-gray-900">${stats.totalIncome.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Platform total</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-2xl">🏧</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Pending Withdrawals</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingWithdrawals}</p>
                <p className="text-sm text-yellow-600">Need approval</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-2xl">📤</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Recent Uploads</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.recentUploads}</p>
                <p className="text-sm text-gray-500">Last 10 files</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Content */}
        <Routes>
          <Route path="/" element={
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <a href="/admin/upload" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600">📤</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Upload Excel</h3>
                      <p className="text-sm text-gray-500">Process income distribution</p>
                    </div>
                  </div>
                </a>

                <a href="/admin/users" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-green-600">👥</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Manage Users</h3>
                      <p className="text-sm text-gray-500">Activate/Deactivate users</p>
                    </div>
                  </div>
                </a>

                <a href="/admin/withdrawals" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-yellow-600">🏧</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Process Withdrawals</h3>
                      <p className="text-sm text-gray-500">Approve/Reject requests</p>
                    </div>
                  </div>
                </a>

                <a href="/admin/reports" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-purple-600">📈</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">View Reports</h3>
                      <p className="text-sm text-gray-500">Analytics & insights</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          } />
          <Route path="/upload" element={<UploadExcel />} />
          {/* <Route path="/users" element={<UserActivation />} />
          <Route path="/withdrawals" element={<WithdrawalApproval />} />
          <Route path="/reports" element={<Reports />} /> */}
        </Routes>
      </main>
    </div>
  )
}

export default AdminDashboard