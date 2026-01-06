import React from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { type RootState } from '../../store'

const Sidebar: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)

  const userLinks = [
    { to: '/dashboard', label: 'Overview', icon: '🏠' },
    { to: '/dashboard/income', label: 'Income', icon: '💰' },
    { to: '/dashboard/withdraw', label: 'Withdraw', icon: '🏧' },
    { to: '/dashboard/profile', label: 'Profile', icon: '👤' },
    { to: '/dashboard/referrals', label: 'Referrals', icon: '👥' },
  ]

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: '📊' },
    { to: '/admin/upload', label: 'Upload Excel', icon: '📤' },
    { to: '/admin/users', label: 'Users', icon: '👥' },
    { to: '/admin/withdrawals', label: 'Withdrawals', icon: '🏧' },
    { to: '/admin/reports', label: 'Reports', icon: '📈' },
  ]

  const superAdminLinks = [
    ...adminLinks,
    { to: '/super-admin/settings', label: 'Settings', icon: '⚙️' },
    { to: '/super-admin/audit', label: 'Audit Log', icon: '📋' },
  ]

  const links = user?.is_superadmin ? superAdminLinks : 
                user?.is_admin ? adminLinks : userLinks

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Navigation</h2>
      </div>
      
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="mt-8 p-4 bg-gray-900 rounded-lg">
        <h3 className="font-medium mb-2">Quick Stats</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Balance:</span>
            <span className="font-medium">${user?.wallet_balance.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Earned:</span>
            <span className="font-medium">${user?.total_earned.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Referral Code:</span>
            <span className="font-medium">{user?.referral_code}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar