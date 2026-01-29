import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  LogIn, 
  Eye, 
  EyeOff, 
  Shield, 
  // TrendingUp,
  // Users,
  // DollarSign,
  Lock,
  User,
  ArrowRight
} from 'lucide-react'

import { login } from '../../services/auth'
import { setCredentials } from '../../store/authSlice'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

const Login: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const response = await login(data)
      
      dispatch(setCredentials({
        user: response.user,
        accessToken: response.access_token
      }))
      
      toast.success('🎉 Login successful! Welcome back!', {
        duration: 4000,
        style: {
          background: '#10B981',
          color: '#fff',
        },
      })
      
      // Redirect based on user role
      if (response.user.is_superadmin) {
        navigate('/super-admin/overview')
      } else if (response.user.is_admin) {
        navigate('/admin/manual-distribution')
      } else {
        navigate('/overview')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed. Please check your credentials.', {
        duration: 5000,
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      })
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="min-h-full flex flex-col lg:flex-row items-center justify-center ">
      {/* Left Section - Brand & Stats */}

      {/* Right Section - Login Form */}
      <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4 xs:p-6 sm:p-8 lg:p-12">
        <div className="max-w-md w-full">
          {/* Form Container */}
          <div className="bg-white rounded-xl xs:rounded-2xl sm:rounded-3xl shadow-lg xs:shadow-xl sm:shadow-2xl p-4 xs:p-6 sm:p-8 lg:p-10 border border-gray-100">
            {/* Form Header */}
            <div className="text-center mb-6 xs:mb-8 sm:mb-10">
              <div className="inline-flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg xs:rounded-xl sm:rounded-2xl mb-4 xs:mb-5 sm:mb-6">
                <LogIn className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mb-2 xs:mb-3">
                Sign In to Your Account
              </h2>
              <p className="text-xs xs:text-sm sm:text-base text-gray-600">
                Enter your credentials to access your dashboard
              </p>
            </div>

            {/* Login Form */}
            <form className="space-y-4 xs:space-y-5 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Username Field */}
              <div className="space-y-1.5 xs:space-y-2">
                <label className="text-xs xs:text-sm font-medium text-gray-700 flex items-center">
                  <User className="w-3 h-3 xs:w-4 xs:h-4 mr-1.5 xs:mr-2" />
                  Username
                </label>
                <div className="relative">
                  <input
                    {...register('username')}
                    type="text"
                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 pl-10 xs:pl-12 bg-gray-50 border border-gray-200 rounded-lg xs:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-sm xs:text-base"
                    placeholder="Enter your username"
                  />
                  <User className="absolute left-3 xs:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 xs:w-5 xs:h-5 text-gray-400" />
                </div>
                {errors.username && (
                  <p className="text-xs xs:text-sm text-red-600 animate-shake mt-1">
                    ⚠️ {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5 xs:space-y-2">
                <label className="text-xs xs:text-sm font-medium text-gray-700 flex items-center">
                  <Lock className="w-3 h-3 xs:w-4 xs:h-4 mr-1.5 xs:mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? "text" : "password"}
                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 pl-10 xs:pl-12 pr-10 xs:pr-12 bg-gray-50 border border-gray-200 rounded-lg xs:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-sm xs:text-base"
                    placeholder="Enter your password"
                  />
                  <Lock className="absolute left-3 xs:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 xs:w-5 xs:h-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 xs:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 xs:w-5 xs:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 xs:w-5 xs:h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs xs:text-sm text-red-600 animate-shake mt-1">
                    ⚠️ {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-1.5 xs:space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-3 h-3 xs:w-4 xs:h-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                  />
                  <span className="text-xs xs:text-sm text-gray-600">Remember me</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full py-3 xs:py-4 px-4 xs:px-6 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg xs:rounded-xl hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm xs:text-base"
              >
                <div className="flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 xs:w-5 xs:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 xs:mr-3"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="ml-2 xs:ml-3 w-4 h-4 xs:w-5 xs:h-5 transform transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>
                <div className="absolute inset-0 rounded-lg xs:rounded-xl border-2 border-white/20 group-hover:border-white/40 transition-colors"></div>
              </button>

              {/* Register Link */}
              {/* <div className="text-center pt-4 xs:pt-6 border-t border-gray-100">
                <p className="text-xs xs:text-sm text-gray-600">
                  Don't have an account?{' '}
                  <a 
                    href="/register" 
                    className="font-semibold text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center group"
                  >
                    Sign up now
                    <ArrowRight className="ml-1 w-3 h-3 xs:w-4 xs:h-4 transform transition-transform group-hover:translate-x-1" />
                  </a>
                </p>
              </div> */}
            </form>
          </div>

          {/* Security Notice */}
          <div className="mt-4 xs:mt-6 sm:mt-8 text-center">
            <div className="inline-flex items-center space-x-1.5 xs:space-x-2 text-xs xs:text-sm text-gray-500">
              <Shield className="w-3 h-3 xs:w-4 xs:h-4" />
              <span>Your data is protected with 256-bit SSL encryption</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-48 h-48 xs:w-56 xs:h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 xs:opacity-15 sm:opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-48 h-48 xs:w-56 xs:h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 xs:opacity-15 sm:opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-48 h-48 xs:w-56 xs:h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 xs:opacity-15 sm:opacity-20 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  )
}

export default Login