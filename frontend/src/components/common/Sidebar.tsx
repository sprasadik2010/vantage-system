import React from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { type RootState } from '../../store'

interface SidebarLink {
  to: string
  label: string
  icon: string
}

const Sidebar: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)

  // User dashboard links
  const userLinks: SidebarLink[] = [
    { to: '/overview', label: 'Overview', icon: '🏠' },
    ...(user?.is_active ? [
      { to: '/income', label: 'Income', icon: '💰' },
      { to: '/withdraw', label: 'Withdrawal', icon: '🏧' },
    ] : []),
    { to: '/profile', label: 'Profile', icon: '👤' },
    { to: '/referrals', label: 'Referrals', icon: '👥' },
  ]

  // Admin dashboard links
  const adminLinks: SidebarLink[] = [
    { to: '/admin/manual-distribution', label: 'Manual Distribution', icon: '✍️' },
    { to: '/admin/upload-excel', label: 'Upload Excel', icon: '📤' },
    { to: '/admin/uploaded-list', label: 'List of uploads', icon: '📄' },
  ]

  // Super Admin dashboard links
  const superAdminLinks: SidebarLink[] = [
    { to: '/super-admin/overview', label: 'Overview', icon: '📊' },
    { to: '/super-admin/user-activation', label: 'User Activation', icon: '👥' },
    { to: '/super-admin/withdrawal-approval', label: 'Approve Withdrawals', icon: '✅' },
    { to: '/super-admin/reports', label: 'Reports', icon: '📈' },
    ...adminLinks, // Include admin links for super admins
  ]

  // Get appropriate links based on user role
  const links = user?.is_superadmin ? superAdminLinks :
    user?.is_admin ? adminLinks : userLinks

  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-300 to-secondary-300">
          Navigation
        </h2>
      </div>

      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:translate-x-1'
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>
      
      {/* Quick Stats for regular users */}
      {!user?.is_admin && !user?.is_superadmin && (
        <div className="mt-8 p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="font-bold mb-3 text-primary-200">Quick Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-1.5 border-b border-gray-700">
              <span className="text-gray-300">Balance:</span>
              <span className="font-bold text-green-300">${user?.wallet_balance?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-700">
              <span className="text-gray-300">Total Earned:</span>
              <span className="font-bold text-yellow-300">${user?.total_earned?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-gray-300">Referral Code:</span>
              <span className="font-bold bg-gray-700 px-2 py-1 rounded text-xs">
                {user?.referral_code || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar