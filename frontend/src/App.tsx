import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { type RootState } from './store'

// Layout Components
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'

// Pages
import Home from './pages/Home'
import About from './pages/about'
import WhatWeDo from './pages/what-we-do'
import TradingBoat from './pages/trading-boat'
import Contact from './pages/contact'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import UserDashboard from './pages/user/UserDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard'
import IncomePage from './pages/user/IncomePage'
import WithdrawalPage from './pages/user/WithdrawalPage'
import ProfilePage from './pages/user/ProfilePage'
import ReferralsPage from './pages/user/ReferralsPage'
import ExcelUploadsListPage from './pages/admin/ExcelUploadsListPage'
import UploadExcelPage from './pages/admin/UploadExcelPage'
import UserActivationPage from './pages/superadmin/UserActivationPage'
import WithdrawalApproval from './pages/superadmin/ApproveWithdrawals'
import ReportsPage from './pages/superadmin/ReportsPage'
import ManualDistributionPage from './pages/admin/manual-distribution'

function App() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/overview" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/what-we-do" element={<WhatWeDo />} />
        <Route path="/boat" element={<TradingBoat />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register/:referralCode" element={<Register />} />
        
        {/* User Routes */}
        <Route path="/overview" element={
          <ProtectedRoute isAllowed={isAuthenticated && !user?.is_admin && !user?.is_superadmin || false}>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/income" element={
          <ProtectedRoute isAllowed={isAuthenticated && !user?.is_admin && !user?.is_superadmin || false}>
            <IncomePage />
          </ProtectedRoute>
        } />
        <Route path="/withdraw" element={
          <ProtectedRoute isAllowed={isAuthenticated && !user?.is_admin && !user?.is_superadmin || false}>
            <WithdrawalPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute isAllowed={isAuthenticated && !user?.is_admin && !user?.is_superadmin || false}>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/referrals" element={
          <ProtectedRoute isAllowed={isAuthenticated && !user?.is_admin && !user?.is_superadmin || false}>
            <ReferralsPage />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/overview" element={
          <ProtectedRoute isAllowed={isAuthenticated && user?.is_admin && !user?.is_superadmin || false}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/upload-excel" element={
          <ProtectedRoute isAllowed={isAuthenticated && user?.is_admin && !user?.is_superadmin || false}>
            <UploadExcelPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/manual-distribution" element={
          <ProtectedRoute isAllowed={isAuthenticated && user?.is_admin && !user?.is_superadmin || false}>
            <ManualDistributionPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/uploaded-list" element={
          <ProtectedRoute isAllowed={isAuthenticated && user?.is_admin && !user?.is_superadmin || false}>
            <ExcelUploadsListPage />
          </ProtectedRoute>
        } />
        
        {/* Super Admin Routes */}
        <Route path="/super-admin/overview" element={
          <ProtectedRoute isAllowed={isAuthenticated && !user?.is_admin && user?.is_superadmin || false}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/super-admin/user-activation" element={
          <ProtectedRoute isAllowed={isAuthenticated && !user?.is_admin && user?.is_superadmin || false}>
            <UserActivationPage />
          </ProtectedRoute>
        } />
        <Route path="/super-admin/withdrawal-approval" element={
          <ProtectedRoute isAllowed={isAuthenticated && !user?.is_admin && user?.is_superadmin || false}>
            <WithdrawalApproval />
          </ProtectedRoute>
        } />
        <Route path="/super-admin/reports" element={
          <ProtectedRoute isAllowed={isAuthenticated && !user?.is_admin && user?.is_superadmin || false}>
            <ReportsPage />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  )
}

export default App