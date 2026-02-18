import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { type RootState } from '../../store'
import { logout } from '../../store/authSlice'
import { Sparkles, Menu, X, User, DollarSign, LogOut, ChevronDown, ChevronUp, Home, BarChart3, Users as Info, Target, Ship, Phone, Upload, FileText, CheckCircle, TrendingUp, Wallet, Users, /*BanknoteXIcon, UserPlus*/ } from 'lucide-react'
import { BanknotesIcon } from '@heroicons/react/24/outline'

interface MenuLink {
  path: string;
  label: string;
  icon: React.ReactElement;
  description?: string;
}

const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setIsUserMenuOpen(false)
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
    setIsMobileMenuOpen(false)
  }

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false)
    setIsUserMenuOpen(false)
  }

  // Public menu items
  const publicMenuItems: MenuLink[] = [
    { path: '/', label: 'Home', icon: <Home className="w-4 h-4 mr-2" />, description: 'Welcome to Brand FX' },
    { path: '/about', label: 'About Brand FX', icon: <Info className="w-4 h-4 mr-2" />, description: 'Learn about our platform' },
    { path: '/what-we-do', label: 'What we do', icon: <Target className="w-4 h-4 mr-2" />, description: 'Our services & features' },
    { path: '/boat', label: 'Trading Boat', icon: <Ship className="w-4 h-4 mr-2" />, description: 'Automated trading strategies' },
    { path: '/contact', label: 'Contact', icon: <Phone className="w-4 h-4 mr-2" />, description: 'Get in touch with us' },
  ]

  // User dashboard links (for regular users)
  const userLinks: MenuLink[] = [
    { path: '/overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4 mr-3 text-gray-500" /> },
    ...(user?.is_active ? [
      { path: '/usdtdeposit', label: 'USDT Deposit', icon: <BanknotesIcon className="w-4 h-4 mr-3 text-gray-500" /> },
      { path: '/income', label: 'Income', icon: <TrendingUp className="w-4 h-4 mr-3 text-gray-500" /> },
      { path: '/withdraw', label: 'Withdrawal', icon: <Wallet className="w-4 h-4 mr-3 text-gray-500" /> },
    ] : []),
    { path: '/profile', label: 'Profile', icon: <User className="w-4 h-4 mr-3 text-gray-500" /> },
    { path: '/referrals', label: 'Referrals', icon: <Users className="w-4 h-4 mr-3 text-gray-500" /> },
  ]

  // Admin dashboard links
  const adminLinks: MenuLink[] = [
    { path: '/admin/manual-distribution', label: 'Manual Distribution', icon: <FileText className="w-4 h-4 mr-3 text-gray-500" /> },
    { path: '/admin/upload-excel', label: 'Upload Excel', icon: <Upload className="w-4 h-4 mr-3 text-gray-500" /> },
    { path: '/admin/uploaded-list', label: 'List of Uploads', icon: <FileText className="w-4 h-4 mr-3 text-gray-500" /> },
  ]

  // Super Admin dashboard links
  const superAdminLinks: MenuLink[] = [
  { path: '/super-admin/overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4 mr-3 text-gray-500" /> },
  { path: '/super-admin/user-management', label: 'User Management', icon: <Users className="w-4 h-4 mr-3 text-gray-500" /> },
  { path: '/super-admin/withdrawal-approval', label: 'Approve Withdrawals', icon: <CheckCircle className="w-4 h-4 mr-3 text-gray-500" /> },
  { path: '/super-admin/reports', label: 'Reports', icon: <TrendingUp className="w-4 h-4 mr-3 text-gray-500" /> },
  // ...adminLinks,
]

  // Get appropriate links based on user role
  const getUserDashboardLinks = (): MenuLink[] => {
    if (user?.is_superadmin) {
      return superAdminLinks
    } else if (user?.is_admin) {
      return adminLinks
    } else {
      return userLinks
    }
  }

  const dashboardLinks = getUserDashboardLinks()

  return (
    <nav className="bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 xs:px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            {!isAuthenticated && <button
              onClick={toggleMobileMenu}
              className="md:hidden mr-3 p-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>}            
            {!isAuthenticated && <Link 
              to="/" 
              className="flex items-center group"
              onClick={closeAllMenus}
            >
              <div className="relative">
                <Sparkles className="w-7 h-7 xs:w-8 xs:h-8 text-yellow-300 group-hover:text-yellow-200 transition-colors" />
                <div className="absolute -inset-1 bg-yellow-300/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="ml-2 xs:ml-3">
                <div className="text-lg xs:text-xl sm:text-2xl font-bold tracking-tight">
                  Brand<span className="text-secondary-300">FX</span>
                </div>
                <div className="hidden xs:block text-xxs xs:text-xs text-primary-200 mt-0.5">
                  Maximize Your Trading Income
                </div>
              </div>
            </Link>}
             {isAuthenticated && (
  <div className="flex items-center ml-4">
    <span className="text-primary-200 text-sm mr-2">Welcome back,</span>
    <span className="font-semibold text-white truncate max-w-[150px]">
      {user?.full_name}
    </span>
  </div>
)}
          </div>

          {/* Desktop Navigation - Public menus */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {!isAuthenticated && publicMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 active:bg-white/20 transition-colors flex flex-col items-start group relative"
              >
                <div className="flex items-center">
                  {item.icon}
                  {item.label}
                </div>
                <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 text-white text-xs px-3 py-2 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {item.description}
                </div>
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2 xs:space-x-3">
            {isAuthenticated ? (
              <>
                {/* Balance Display - Desktop (only for regular users) */}
                {!user?.is_admin && !user?.is_superadmin && (
                  <div className="hidden sm:flex items-center px-3 py-1.5 bg-white/10 rounded-lg">
                    <DollarSign className="w-4 h-4 text-green-300 mr-2" />
                    <span className="text-sm font-medium">
                      ${user?.wallet_balance?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                )}

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 xs:w-9 xs:h-9 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
                    </div>
                    <div className="hidden xs:block text-left">
                      <div className="text-sm font-medium truncate max-w-[120px]">
                        {user?.full_name || 'User'}
                      </div>
                      <div className="text-xs text-primary-200">
                        {user?.is_superadmin ? 'Super Admin' : user?.is_admin ? 'Admin' : 'Trader'}
                      </div>
                    </div>
                    {isUserMenuOpen ? (
                      <ChevronUp className="hidden xs:block w-4 h-4 ml-1" />
                    ) : (
                      <ChevronDown className="hidden xs:block w-4 h-4 ml-1" />
                    )}
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      
                      <div className="absolute right-0 mt-2 w-48 xs:w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-fade-in">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {user?.full_name || 'User'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {user?.is_superadmin ? 'Super Admin' : user?.is_admin ? 'Admin' : 'Trader'}
                          </div>
                          {!user?.is_admin && !user?.is_superadmin && (
                            <div className="flex items-center mt-2 text-sm text-gray-700">
                              <DollarSign className="w-3 h-3 mr-1" />
                              <span className="font-medium">${user?.wallet_balance?.toFixed(2) || '0.00'}</span>
                            </div>
                          )}
                        </div>

                        {/* Dashboard Links */}
                        <div className="py-1">
                          {dashboardLinks.map((link) => (
                            <Link
                              key={link.path}
                              to={link.path}
                              onClick={closeAllMenus}
                              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              {link.icon}
                              {link.label}
                            </Link>
                          ))}
                        </div>

                        {/* Logout */}
                        <div className="pt-1 border-t border-gray-100">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Desktop Login Button */}
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  onClick={closeAllMenus}
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 z-40" 
              onClick={closeAllMenus}
            />
            
            {/* Menu Panel */}
            <div className="fixed inset-x-0 top-16 bg-gradient-to-b from-primary-900 to-secondary-900 text-white shadow-2xl z-50 animate-fade-in">
              <div className="px-4 xs:px-6 pt-4 pb-6 space-y-1">
                {isAuthenticated ? (
                  <>
                    {/* User Info in Mobile Menu */}
                    <div className="px-3 py-4 mb-4 bg-white/10 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold truncate">{user?.full_name || 'User'}</div>
                          <div className="text-sm text-primary-200">
                            {user?.is_superadmin ? 'Super Admin' : user?.is_admin ? 'Admin' : 'Trader'}
                          </div>
                          {!user?.is_admin && !user?.is_superadmin && (
                            <div className="flex items-center mt-1 text-sm">
                              <DollarSign className="w-3 h-3 mr-1 text-green-300" />
                              <span className="font-medium">${user?.wallet_balance?.toFixed(2) || '0.00'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Public Menu Links */}
                    {publicMenuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={closeAllMenus}
                        className="flex items-center px-3 py-3 text-base font-medium rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors"
                      >
                        <div className="w-8 h-8 flex items-center justify-center mr-3 bg-white/10 rounded-lg">
                          {item.icon}
                        </div>
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-primary-300 mt-0.5">{item.description}</div>
                        </div>
                      </Link>
                    ))}

                    {/* Dashboard Links */}
                    <div className="pt-4 border-t border-white/20">
                      {dashboardLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={closeAllMenus}
                          className="flex items-center px-3 py-3 text-base font-medium rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors"
                        >
                          <div className="w-8 h-8 flex items-center justify-center mr-3 bg-white/10 rounded-lg">
                            {React.cloneElement(link.icon, { className: "w-5 h-5" })}
                          </div>
                          <div>
                            <div className="font-medium">{link.label}</div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Logout */}
                    <div className="pt-4 border-t border-white/20">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-3 text-base font-medium text-red-300 hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors"
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Mobile Menu Links for non-authenticated */}
                    {publicMenuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={closeAllMenus}
                        className="flex items-center px-3 py-3 text-base font-medium rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors"
                      >
                        <div className="w-8 h-8 flex items-center justify-center mr-3 bg-white/10 rounded-lg">
                          {item.icon}
                        </div>
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-primary-300 mt-0.5">{item.description}</div>
                        </div>
                      </Link>
                    ))}

                    {/* Login Button in Mobile */}
                    <div className="pt-4 border-t border-white/20">
                      <Link
                        to="/login"
                        onClick={closeAllMenus}
                        className="flex items-center justify-center w-full px-3 py-3 text-base font-medium rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 transition-colors"
                      >
                        <User className="w-5 h-5 mr-2" />
                        Sign In
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Balance Bar */}
      {isAuthenticated && !user?.is_admin && !user?.is_superadmin && (
        <div className="md:hidden bg-gradient-to-r from-green-900/30 to-emerald-900/30 px-4 xs:px-6 py-2 border-t border-white/10">
          <div className="flex items-center justify-center space-x-2">
            <DollarSign className="w-4 h-4 text-green-300" />
            <span className="text-sm font-medium">Balance:</span>
            <span className="text-lg font-bold text-green-300">
              ${user?.wallet_balance?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar