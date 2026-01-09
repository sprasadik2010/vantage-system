import React from 'react'
import { Routes, Route } from 'react-router-dom'
// import Sidebar from '../components/common/Sidebar'
import Dashboard from '../../components/user/Dashboard'
import IncomeList from '../../components/user/IncomeList'
import WithdrawalRequests from '../../components/user/WithdrawalRequests'
import Profile from '../../components/user/Profile'

const UserDashboard: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <Sidebar /> */}
      
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/income" element={<IncomeList />} />
          <Route path="/withdraw" element={<WithdrawalRequests />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/referrals" element={<div>Referrals Page</div>} />
        </Routes>
      </main>
    </div>
  )
}

export default UserDashboard