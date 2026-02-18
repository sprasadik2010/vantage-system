// Application Constants

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://vantage-system-backend.onrender.com/',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
}

// Income Distribution Constants
export const INCOME_DISTRIBUTION = {
  LEVEL_1: 0.02, // 02%
  LEVEL_2: 0.02, // 02%
  LEVEL_3: 0.02, // 02%
  LEVEL_4: 0.02, // 02%
  LEVEL_5: 0.02, // 02%
  
  DIRECT_REFERRAL_REQUIREMENTS: {
    LEVEL_2: 2, // Need 2 direct referrals for level 2 bonus
    LEVEL_3: 3, // Need 3 direct referrals for level 3 bonus
    LEVEL_4: 4, // Need 4 direct referrals for level 4 bonus
    LEVEL_5: 5, // Need 5 direct referrals for level 5 bonus
  },
  
  MIN_WITHDRAWAL_AMOUNT: 10, // $10 minimum withdrawal
}

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'superadmin',
} as const

// Income Types
export const INCOME_TYPES = {
  // DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  // MONTHLY: 'MONTHLY',
} as const

// Withdrawal Status
export const WITHDRAWAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
} as const

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ],
  ALLOWED_EXTENSIONS: ['.xlsx', '.xls'],
}

// Date Format Constants
export const DATE_FORMATS = {
  DISPLAY_DATE: 'MMM dd, yyyy',
  DISPLAY_DATETIME: 'MMM dd, yyyy HH:mm',
  API_DATE: 'yyyy-MM-dd',
  API_DATETIME: "yyyy-MM-dd'T'HH:mm:ss",
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  DEFAULT: 'Something went wrong. Please try again.',
}

// Success Messages
export const SUCCESS_MESSAGES = {
  REGISTER: 'Registration successful! Welcome to Brand FX.',
  LOGIN: 'Login successful! Redirecting to dashboard...',
  LOGOUT: 'Logged out successfully.',
  PROFILE_UPDATE: 'Profile updated successfully.',
  WITHDRAWAL_REQUEST: 'Withdrawal request submitted successfully.',
  EXCEL_UPLOAD: 'Excel file uploaded successfully. Processing started.',
  USER_ACTIVATION: 'User activated successfully.',
  PASSWORD_RESET: 'Password reset successful.',
}

// Validation Messages
export const VALIDATION = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PHONE: 'Please enter a valid phone number',
  MIN_LENGTH: (length: number) => `Must be at least ${length} characters`,
  MAX_LENGTH: (length: number) => `Must be at most ${length} characters`,
  PASSWORD: 'Password must be at least 8 characters long',
  PASSWORD_MISMATCH: 'Passwords do not match',
  NUMBER: 'Please enter a valid number',
  MIN_NUMBER: (min: number) => `Must be at least ${min}`,
  MAX_NUMBER: (max: number) => `Must be at most ${max}`,
}

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
}

// Theme Constants
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
}

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [10, 25, 50, 100],
  DEFAULT_PAGE: 1,
}

// Currency Constants
export const CURRENCY = {
  SYMBOL: '$',
  CODE: 'USD',
  LOCALE: 'en-US',
  DECIMALS: 2,
}

// Country List (Top 20 countries for initial selection)
export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
  { code: 'BR', name: 'Brazil' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'RU', name: 'Russia' },
  { code: 'MX', name: 'Mexico' },
  { code: 'JP', name: 'Japan' },
  { code: 'PH', name: 'Philippines' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'EG', name: 'Egypt' },
  { code: 'DE', name: 'Germany' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TH', name: 'Thailand' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
]

// Income Level Colors (for charts and UI)
export const LEVEL_COLORS = {
  1: '#3B82F6', // Blue
  2: '#10B981', // Green
  3: '#F59E0B', // Yellow
  4: '#8B5CF6', // Purple
  5: '#EF4444', // Red
}

// Navigation Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/overview',
  ADMIN: '/admin',
  SUPER_ADMIN: '/super-admin/overview',
  
  // Dashboard Subroutes
  DASHBOARD_SUB: {
    OVERVIEW: '/overview',
    INCOME: '/income',
    WITHDRAW: '/withdraw',
    PROFILE: '/profile',
    REFERRALS: '/referrals',
  },
  
  // Admin Subroutes
  ADMIN_SUB: {
    DASHBOARD: '/admin',
    UPLOAD: '/admin/upload',
    USERS: '/admin/users',
    WITHDRAWALS: '/admin/withdrawals',
    REPORTS: '/admin/reports',
  },
  
  // Super Admin Subroutes
  SUPER_ADMIN_SUB: {
    SETTINGS: '/super-admin/settings',
    AUDIT: '/super-admin/audit',
  },
}

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_TWO_FACTOR: false,
  ENABLE_EMAIL_VERIFICATION: true,
  ENABLE_SMS_NOTIFICATIONS: false,
  ENABLE_BONUS_SYSTEM: true,
  ENABLE_MULTI_LANGUAGE: false,
}

// Notification Types
export const NOTIFICATION_TYPES = {
  INCOME_RECEIVED: 'income_received',
  WITHDRAWAL_APPROVED: 'withdrawal_approved',
  WITHDRAWAL_REJECTED: 'withdrawal_rejected',
  REFERRAL_JOINED: 'referral_joined',
  ACCOUNT_ACTIVATED: 'account_activated',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
}

// Performance Constants
export const PERFORMANCE = {
  DEBOUNCE_DELAY: 300, // ms
  THROTTLE_DELAY: 1000, // ms
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds
}

// Export all constants as a single object for easier imports
export default {
  API_CONFIG,
  INCOME_DISTRIBUTION,
  USER_ROLES,
  INCOME_TYPES,
  WITHDRAWAL_STATUS,
  FILE_UPLOAD,
  DATE_FORMATS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION,
  STORAGE_KEYS,
  THEME,
  PAGINATION,
  CURRENCY,
  COUNTRIES,
  LEVEL_COLORS,
  ROUTES,
  FEATURE_FLAGS,
  NOTIFICATION_TYPES,
  PERFORMANCE,
}

// Add to your existing constants
export const DEPOSIT_STATUS = {
  PENDING: 'PENDING',
  CONFIRMING: 'CONFIRMING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
} as const

// Add minimum deposit amount if not present
export const MIN_DEPOSIT_AMOUNT = 10.0