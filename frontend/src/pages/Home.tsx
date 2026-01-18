import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { type RootState } from '../store'

const Home: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Vantage Income System
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          A revolutionary platform for income sharing and distribution through strategic referrals.
          Maximize your earnings with our 5-level income distribution system.
        </p>
        
        {!isAuthenticated ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <Link
            to="/overview"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
          >
            Go to Dashboard
          </Link>
        )}
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-600 text-2xl">👤</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Register & Set Vantage Username</h3>
            <p className="text-gray-600">
              Create your account and add your Vantage broker username to start receiving income shares.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-green-600 text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Receive Income Shares</h3>
            <p className="text-gray-600">
              Get income distributed through 5 levels based on referrals. The more referrals, the higher your percentage.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-purple-600 text-2xl">🏧</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Withdraw Earnings</h3>
            <p className="text-gray-600">
              Request withdrawals anytime with a minimum of $10. Fast and secure payment processing.
            </p>
          </div>
        </div>
      </div>

      {/* Income Distribution Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Income Distribution Model
          </h2>
          
          <div className="relative">
            {/* Tree structure visualization */}
            <div className="flex flex-col items-center space-y-8">
              {/* Level 5 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">5</span>
                </div>
                <p className="font-medium">Level 5: 02%</p>
                <p className="text-sm text-gray-500">5+ direct referrals</p>
              </div>

              {/* Level 4 */}
              <div className="flex justify-center space-x-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <p className="font-medium">Level 4: 02%</p>
                  <p className="text-sm text-gray-500">4+ direct referrals</p>
                </div>
              </div>

              {/* Level 3 */}
              <div className="flex justify-center space-x-24">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-400 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <p className="font-medium">Level 3: 02%</p>
                  <p className="text-sm text-gray-500">3+ direct referrals</p>
                </div>
              </div>

              {/* Level 2 */}
              <div className="flex justify-center space-x-36">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-300 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <p className="font-medium">Level 2: 02%</p>
                  <p className="text-sm text-gray-500">2+ direct referrals</p>
                </div>
              </div>

              {/* Level 1 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">1</span>
                </div>
                <p className="font-medium">Level 1: 02%</p>
                <p className="text-sm text-gray-500">You (with referral bonus)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Ready to Start Earning?
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of users who are already maximizing their income through our referral system.
        </p>
        <Link
          to={isAuthenticated ? "/overview" : "/register"}
          className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
        >
          {isAuthenticated ? "Go to Dashboard" : "Get Started Now"}
        </Link>
      </div>
    </div>
  )
}

export default Home