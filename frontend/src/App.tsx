import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { type RootState } from './store'

// Layout Components
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'

// Pages
import Home from './pages/Home'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import IncomePage from './pages/IncomePage'
import WithdrawalPage from './pages/WithdrawalPage'
import ProfilePage from './pages/ProfilePage'
import ReferralsPage from './pages/ReferralsPage'

function App() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/:referralCode" element={<Register />} />
        
        {/* User Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute isAllowed={isAuthenticated && !user?.is_admin}>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/income" element={
          <ProtectedRoute isAllowed={isAuthenticated && !user?.is_admin}>
            <IncomePage />
          </ProtectedRoute>
        } />
        <Route path="/withdraw" element={
          <ProtectedRoute isAllowed={isAuthenticated && !user?.is_admin}>
            <WithdrawalPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute isAllowed={isAuthenticated && !user?.is_admin}>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/referrals" element={
          <ProtectedRoute isAllowed={isAuthenticated && !user?.is_admin}>
            <ReferralsPage />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute isAllowed={isAuthenticated && user?.is_admin && !user?.is_superadmin || false}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Super Admin Routes */}
        <Route path="/super-admin" element={
          <ProtectedRoute isAllowed={isAuthenticated && user?.is_superadmin || false}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  )
}

export default App