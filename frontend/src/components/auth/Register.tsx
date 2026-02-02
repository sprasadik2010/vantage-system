import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import { registerUser } from '../../services/auth'

// Country data with name, code, and dial code
const countries = [
  { name: 'United States', code: 'US', dialCode: '+1' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44' },
  { name: 'Canada', code: 'CA', dialCode: '+1' },
  { name: 'Australia', code: 'AU', dialCode: '+61' },
  { name: 'Germany', code: 'DE', dialCode: '+49' },
  { name: 'France', code: 'FR', dialCode: '+33' },
  { name: 'Japan', code: 'JP', dialCode: '+81' },
  { name: 'India', code: 'IN', dialCode: '+91' },
  { name: 'China', code: 'CN', dialCode: '+86' },
  { name: 'Brazil', code: 'BR', dialCode: '+55' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971' },
  { name: 'Singapore', code: 'SG', dialCode: '+65' },
  { name: 'Hong Kong', code: 'HK', dialCode: '+852' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41' },
  // Add more countries as needed
].sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  country: z.string().min(2, 'Please select your country'),
  full_name: z.string().min(2, 'Full name is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters'),
    // .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    // .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    // .regex(/\d/, 'Must contain at least one number'),
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
  const [registeredUser, setRegisteredUser] = useState<{ username: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<string>('US')
  const [selectedDialCode, setSelectedDialCode] = useState<string>('+1')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      referral_code: referralCode || '',
      country: 'US',
      phone: '+1 ' // Start with US dial code
    }
  })

  // Update dial code when country changes
  useEffect(() => {
    const countryData = countries.find(c => c.code === selectedCountry)
    if (countryData) {
      setSelectedDialCode(countryData.dialCode)

      // Get current phone value from form
      const currentPhone = watch('phone') || ''

      // Extract the phone number part (remove dial code if present)
      let phoneNumberOnly = currentPhone
      // Remove any dial code pattern at the beginning
      const dialCodePattern = /^\+\d+\s*/
      phoneNumberOnly = phoneNumberOnly.replace(dialCodePattern, '')

      // Remove any non-digit characters for processing
      phoneNumberOnly = phoneNumberOnly.replace(/\D/g, '')

      // Update form value with new dial code
      const fullPhoneNumber = `${countryData.dialCode} ${phoneNumberOnly}`.trim()
      setValue('phone', fullPhoneNumber, { shouldValidate: true })

      // Clear the input field display (it will show just numbers on focus)
      // The dial code is displayed separately on the left
    }
  }, [selectedCountry, setValue, watch])


  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = data

      const response = await registerUser(registerData)
      setRegisteredUser(response.user || response)
      setRegisteredEmail(data.email)
      setShowEmailNotification(true)

      reset()

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
        'Registration failed. Please try again.'
      toast.error(errorMessage)
    }
  }

  const handleGoToLogin = () => {
    navigate('/login')
  }

  const handleResendEmail = async () => {
    try {
      toast.success('Email resent! Check your inbox.', {
        icon: '📨'
      })
    } catch (error) {
      toast.error('Failed to resend email')
    }
  }

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value
    setSelectedCountry(countryCode)
    setValue('country', countryCode, { shouldValidate: true })
  }

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value

    // Extract only digits from the input
    const numbersOnly = input.replace(/\D/g, '')

    // Get the dial code numbers (without +)
    const dialCodeNumbers = selectedDialCode.replace('+', '')

    // Check if the input starts with the dial code
    let phoneNumberOnly = numbersOnly
    if (numbersOnly.startsWith(dialCodeNumbers)) {
      // Remove dial code from the beginning
      phoneNumberOnly = numbersOnly.slice(dialCodeNumbers.length)
    }

    // Format the phone number based on country
    let formattedNumber = phoneNumberOnly

    // Add some basic formatting for better UX
    if (phoneNumberOnly.length > 0) {
      if (selectedDialCode === '+1') { // US/Canada format
        if (phoneNumberOnly.length <= 3) {
          formattedNumber = phoneNumberOnly
        } else if (phoneNumberOnly.length <= 6) {
          formattedNumber = `(${phoneNumberOnly.slice(0, 3)}) ${phoneNumberOnly.slice(3)}`
        } else {
          formattedNumber = `(${phoneNumberOnly.slice(0, 3)}) ${phoneNumberOnly.slice(3, 6)}-${phoneNumberOnly.slice(6, 10)}`
        }
      } else { // International format
        if (phoneNumberOnly.length <= 4) {
          formattedNumber = phoneNumberOnly
        } else if (phoneNumberOnly.length <= 7) {
          formattedNumber = `${phoneNumberOnly.slice(0, 4)} ${phoneNumberOnly.slice(4)}`
        } else {
          formattedNumber = `${phoneNumberOnly.slice(0, 4)} ${phoneNumberOnly.slice(4, 7)} ${phoneNumberOnly.slice(7, 11)}`
        }
      }
    }

    // Set the input value to just the formatted number (without dial code in the input)
    e.target.value = formattedNumber

    // Update form value with full phone number including dial code
    const fullPhoneNumber = `${selectedDialCode} ${phoneNumberOnly}`.trim()
    setValue('phone', fullPhoneNumber, { shouldValidate: true })
  }

  const handlePhoneFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.target

    // Clear any existing formatting and show just the numbers for editing
    const currentValue = input.value
    const numbersOnly = currentValue.replace(/\D/g, '')

    // Set the input to show just the numbers without dial code
    // The dial code is visually shown on the left, not in the input
    input.value = numbersOnly

    // Move cursor to end
    setTimeout(() => {
      input.setSelectionRange(numbersOnly.length, numbersOnly.length)
    }, 0)
  }

  // const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   const input = e.currentTarget
  //   const cursorPosition = input.selectionStart || 0
  //   const dialCodeLength = selectedDialCode.length

  //   // Prevent deletion of dial code
  //   if (cursorPosition <= dialCodeLength) {
  //     if (
  //       e.key === 'Backspace' ||
  //       e.key === 'Delete' ||
  //       (e.ctrlKey && e.key === 'x')
  //     ) {
  //       e.preventDefault()
  //       // Move cursor to after dial code if they try to delete it
  //       input.setSelectionRange(dialCodeLength + 1, dialCodeLength + 1)
  //     }
  //   }
  // }

  const password = watch('password')

  if (showEmailNotification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/50 p-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200/50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-4">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Check Your Email!</h2>
              <p className="text-blue-100">We've sent your login credentials</p>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="text-center mb-8">
                <p className="text-gray-600 mb-6">
                  Your account has been successfully created. Your username is:
                </p>
                <div className="inline-block bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl px-6 py-4 mb-6">
                  <p className="font-bold text-2xl text-gray-900 tracking-wide">
                    {registeredUser?.username}
                  </p>
                </div>

                <div className="space-y-4 bg-gray-50 rounded-xl p-6 mb-8">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">
                      Your username and password have been emailed to <span className="font-semibold">{registeredEmail}</span>
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                        <svg className="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">
                      Check your spam/junk folder if you don't see the email within 5 minutes
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">
                      Keep your credentials secure and never share them with anyone
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleGoToLogin}
                  className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Go to Login Page
                </button>

                <button
                  onClick={handleResendEmail}
                  className="w-full flex justify-center items-center py-3 px-6 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Resend Email
                </button>

                <p className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
                  Need help? <a href="/support" className="font-medium text-purple-600 hover:text-purple-500">Contact support</a> if you don't receive the email within 10 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/50 p-4">
      {/* Right side - Registration Form */}
      <div className="md:w-1/2 max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-600 mt-2">Join thousands of successful traders</p>
          </div>

          {/* Information Banner */}
          <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-blue-700">
                After registration, your login credentials will be sent to your email address.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Hidden fields to prevent autocomplete */}
            <input type="email" name="email" autoComplete="off" style={{ display: 'none' }} />
            <input type="password" name="password" autoComplete="new-password" style={{ display: 'none' }} />

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register('full_name')}
                  type="text"
                  autoComplete="off"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.full_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    } focus:ring-2 focus:ring-opacity-20 focus:outline-none transition-colors`}
                  placeholder="Enter your full name"
                />
                <div className="absolute right-3 top-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              {errors.full_name && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="off"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    } focus:ring-2 focus:ring-opacity-20 focus:outline-none transition-colors`}
                  placeholder="you@example.com"
                />
                <div className="absolute right-3 top-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email.message}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Your login credentials will be sent to this email
              </p>
            </div>

            {/* Country - Moved before Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  {...register('country')}
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  className={`w-full px-4 py-3 rounded-xl border appearance-none ${errors.country ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    } focus:ring-2 focus:ring-opacity-20 focus:outline-none transition-colors bg-white`}
                >
                  <option value="">Select your country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name} ({country.dialCode})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.country && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.country.message}
                </p>
              )}
            </div>

            {/* Phone Number - Now with country code from selected country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {/* <div className="absolute left-3 top-3 pointer-events-none z-10">
                  <span className="text-gray-700 font-medium">{selectedDialCode}</span>
                </div> */}
                <input
                  {...register('phone')}
                  type="tel"
                  autoComplete="off"
                  onChange={handlePhoneInput}
                  onFocus={handlePhoneFocus}
                  // onKeyDown={handlePhoneKeyDown}
                  className={`w-full pl-16 pr-12 py-3 rounded-xl border ${errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    } focus:ring-2 focus:ring-opacity-20 focus:outline-none transition-colors`}
                  // placeholder={`(${selectedDialCode === '+1' ? 'XXX' : 'XX'}) XXX-XXXX`}
                />
                <div className="absolute right-3 top-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.phone.message}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Country code is automatically selected based on your country
              </p>
            </div>

            {/* Referral Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referral Code (Optional)
              </label>
              <div className="relative">
                <input
                  {...register('referral_code')}
                  type="text"
                  autoComplete="off"
                  className={`w-full px-4 py-3 rounded-xl border ${referralCode ? 'bg-gray-50 text-gray-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    } focus:ring-2 focus:ring-opacity-20 focus:outline-none transition-colors`}
                  placeholder="Enter referral code"
                  readOnly={!!referralCode}
                />
                {referralCode && (
                  <div className="absolute right-3 top-3">
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                      Pre-filled
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    } focus:ring-2 focus:ring-opacity-20 focus:outline-none transition-colors pr-12`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password.message}
                </p>
              )}

              {/* Password strength indicator */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${password.length >= 8 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        style={{ width: `${Math.min(password.length * 10, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {password.length >= 8 ? 'Strong' : 'Weak'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div className={`flex items-center ${/^(?=.*[a-z])/.test(password) ? 'text-green-600' : ''}`}>
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Lowercase letter
                    </div>
                    <div className={`flex items-center ${/^(?=.*[A-Z])/.test(password) ? 'text-green-600' : ''}`}>
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Uppercase letter
                    </div>
                    <div className={`flex items-center ${/^(?=.*\d)/.test(password) ? 'text-green-600' : ''}`}>
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Number
                    </div>
                    <div className={`flex items-center ${password.length >= 8 ? 'text-green-600' : ''}`}>
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      8+ characters
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    } focus:ring-2 focus:ring-opacity-20 focus:outline-none transition-colors pr-12`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the{' '}
                <a href="/terms" className="font-medium text-purple-600 hover:text-purple-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="font-medium text-purple-600 hover:text-purple-500">
                  Privacy Policy
                </a>
                . I understand that my login credentials will be emailed to me.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Your Account...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Create Account
                </>
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="font-semibold text-purple-600 hover:text-purple-500 transition-colors">
                  Sign in here
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register