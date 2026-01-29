import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import { registerUser } from '../../services/auth'
// import { User } from 'lucide-react'
// import { setCredentials } from '../../store/authSlice'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  country: z.string().min(2, 'Country is required'),
  full_name: z.string().min(2, 'Full name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  referral_code: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

const Register: React.FC = () => {
  const { referralCode } = useParams()
  useDispatch()
  const navigate = useNavigate()
  const [showEmailNotification, setShowEmailNotification] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [registeredUser, setRegisteredUser] = useState<{username: string} | null>(null)
  console.log(registeredEmail);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      referral_code: referralCode || ''
    }
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = data
      
      // Register user - FastAPI will handle email sending
      const response = await registerUser(registerData)
      setRegisteredUser(response.user || response);
      // Show email notification
      setRegisteredEmail(data.email)
      setShowEmailNotification(true)
      
      // Clear form
      reset()
      
      // Show success toast
      toast.success(
        <div>
          <p className="font-semibold">Registration Successful!</p>
          <p className="text-sm">Please check your email for login credentials.</p>
        </div>,
        {
          duration: 5000,
          icon: '📧'
        }
      )
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Registration failed'
      toast.error(errorMessage)
    }
  }

  const handleGoToLogin = () => {
    navigate('/login')
  }

  const handleResendEmail = async () => {
    try {
      // You can add a resend email endpoint in FastAPI later
      toast.success('Check your email inbox!', {
        icon: '📨'
      })
    } catch (error) {
      toast.error('Failed to resend email')
    }
  }

  if (showEmailNotification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Check Your Email!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent your login credentials
            </p>
            
            <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
              <div className="text-left">
                <p className="text-gray-700 text-center">
                   Your account has been successfully created.
                </p>
                <p className="text-gray-700 mb-4 text-center">
                   Your username is: {/*We've sent your login credentials to: */}
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                  <p className="font-semibold text-lg text-gray-900 text-center">
                    {/* {registeredEmail} */}
                    {registeredUser?.username}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-sm text-gray-600">
                      Your username and password have been emailed to you
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-sm text-gray-600">
                      Check your spam/junk folder if you don't see the email
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-sm text-gray-600">
                      Keep your credentials secure and never share them
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 space-y-4">
              <button
                onClick={handleGoToLogin}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
              >
                Go to Login Page
              </button>
              
              <button
                onClick={handleResendEmail}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Resend Email
              </button>
              
              <p className="text-xs text-gray-500 mt-4">
                Need help? Contact support if you don't receive the email within 10 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Brand FX
          </p>
          
          {/* Informational note */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  After registration, your login credentials will be emailed to you.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
        >
          {/* Hidden fields to prevent autocomplete */}
          <input type="email" name="email" autoComplete="off" style={{display: 'none'}} />
          <input type="password" name="password" autoComplete="new-password" style={{display: 'none'}} />
          
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="sr-only">Full Name</label>
              <input
                {...register('full_name')}
                type="text"
                autoComplete="off"
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
              )}
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="off"
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Your login credentials will be sent to this email
              </p>
            </div>
            
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="sr-only">Phone Number</label>
              <input
                {...register('phone')}
                type="tel"
                autoComplete="off"
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Phone Number"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
            
            {/* Country */}
            <div>
              <label htmlFor="country" className="sr-only">Country</label>
              <input
                {...register('country')}
                type="text"
                autoComplete="off"
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Country"
              />
              {errors.country && (
                <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
              )}
            </div>
            
            {/* Referral Code */}
            <div>
              <label htmlFor="referral_code" className="sr-only">Referral Code (Optional)</label>
              <input
                {...register('referral_code')}
                type="text"
                autoComplete="off"
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Referral Code (Optional)"
                readOnly={!!referralCode}
              />
            </div>
            
            {/* Password */}
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                {...register('password')}
                type="password"
                autoComplete="new-password"
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Minimum 8 characters
              </p>
            </div>
            
            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <input
                {...register('confirmPassword')}
                type="password"
                autoComplete="new-password"
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              I agree to the{' '}
              <a href="/terms" className="font-medium text-purple-600 hover:text-purple-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="font-medium text-purple-600 hover:text-purple-500">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </>
              ) : 'Create Account'}
            </button>
          </div>
          
          {/* Login Link */}
          <div className="text-sm text-center">
            <span className="text-gray-600">Already have an account?</span>{' '}
            <a href="/login" className="font-medium text-purple-600 hover:text-purple-500">
              Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register