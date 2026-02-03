import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../common/Navbar'
import { useSelector } from 'react-redux'
import { type RootState } from '../../store'
// import Sidebar from '../common/Sidebar'

const Layout: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        {/* Sidebar for authenticated users */}
        {/* {isAuthenticated && (
          <div className="hidden md:block">
            <Sidebar />
          </div>
        )} */}
        
        {/* Main content */}
        <main className={`flex-1 ${isAuthenticated ? 'p-4 md:p-6' : ''}`}>
          <Outlet />
        </main>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-center items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500 mt-1">              
              © {new Date().getFullYear()} <span className="text-lg font-semibold text-gray-900 pr-1">Brand FX</span> All rights reserved.</p>
            </div>
            
            {/* <div className="flex space-x-6">
              <a href="/terms" className="text-sm text-gray-500 hover:text-gray-700">Terms</a>
              <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">Privacy</a>
              <a href="/contact" className="text-sm text-gray-500 hover:text-gray-700">Contact</a>
              <a href="/help" className="text-sm text-gray-500 hover:text-gray-700">Help</a>
            </div> */}
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout