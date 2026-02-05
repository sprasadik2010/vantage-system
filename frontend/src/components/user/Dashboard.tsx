import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { type RootState } from '../../store'
import { getMyWithdrawals } from '../../services/withdrawal'
import { getUserReferrals } from '../../services/users'  // Updated import
import { getIncomeSummary } from '../../services/income'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { Income } from '../../types'
import { getMyIncome } from '../../services/income'

interface ReferralUser {
  id: number
  username: string
  email: string
  full_name: string
  country: string
  phone: string
  is_active: boolean
  created_at: string
  vantage_username: string |null
  wallet_balance: number
  total_earned: number
}

interface WithdrawalRecord {
  id: number
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  admin_notes: string | null
  requested_at: string
  processed_at: string | null
}
const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [summary, setSummary] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [referrals, setReferrals] = useState<ReferralUser[]>([])
  const [activeLevel, setActiveLevel] = useState(1)
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])

   useEffect(() => {
      console.log(summary)
      setActiveLevel(1)
      fetchWithdrawals()
    }, [])
  
    const fetchWithdrawals = async () => {
      try {
        setLoading(true)
        const data = await getMyWithdrawals()
        setWithdrawals(data)
      } catch (error) {
        console.error('Failed to fetch withdrawals:', error)
      } finally {
        setLoading(false)
      }
    }
  

  useEffect(() => {
    fetchSummary()
  }, [])

  useEffect(() => {
      if (user?.id) {
        fetchReferrals()
      }
    }, [activeLevel, user?.id])
  
    const fetchReferrals = async () => {
      if (!user?.id) return
      
      try {
        setLoading(true)
        const data = await getUserReferrals(user.id)  // Fixed: no level parameter
        setReferrals(data || [])  // Fixed: direct assignment, not [data]
      } catch (error) {
        console.error('Failed to fetch referrals:', error)
        setReferrals([])  // Set empty array on error
      } finally {
        setLoading(false)
      }
    }

  const fetchSummary = async () => {
    try {
      const data = await getIncomeSummary('all')
      setSummary(data)
    } catch (error) {
      console.error('Failed to fetch summary:', error)
    } finally {
      setLoading(false)
    }
  }

   useEffect(() => {
      fetchIncomes()
    }, [])
  
    const fetchIncomes = async () => {
      try {
        setLoading(true)
        const data = await getMyIncome()
        setIncomes(data)
      } catch (error) {
        console.error('Failed to fetch incomes:', error)
      } finally {
        setLoading(false)
      }
    }

  // const incomeData = [
  //   { day: 'Mon', income: summary.daily?.total_amount || 0 },
  //   { day: 'Tue', income: 1500 },
  //   { day: 'Wed', income: 2000 },
  //   { day: 'Thu', income: 1800 },
  //   { day: 'Fri', income: 2200 },
  //   { day: 'Sat', income: 2500 },
  //   { day: 'Sun', income: 2100 },
  // ]

const getLast7CalendarDays = (incomes: Income[]) => {
  const result: Array<{day: string, date: string, income: number}> = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Get today's date at start of day for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Create last 7 days (from 6 days ago to today)
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dayName = daysOfWeek[date.getDay()];
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    result.push({
      day: dayName,
      date: dateString,
      income: 0
    });
  }
  
  // Calculate income for each specific date
  incomes.forEach(item => {
    const itemDate = new Date(item.created_at);
    itemDate.setHours(0, 0, 0, 0);
    const dateString = itemDate.toISOString().split('T')[0];
    
    // Find if this date is in our last 7 days
    const dayData = result.find(d => d.date === dateString);
    if (dayData) {
      dayData.income += item.amount;
    }
  });
  
  // Return only day and income
  return result.map(({ day, income }) => ({ day, income }));
};

// Usage
const incomeData = getLast7CalendarDays(incomes);
  


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }
  const totalApproved = withdrawals
    .filter(w => w.status === 'APPROVED' || w.status === 'COMPLETED')
    .reduce((sum, w) => sum + w.amount, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-2xl">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Wallet Balance</h3>
              <p className="text-2xl font-semibold text-gray-900">
                ${user?.wallet_balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-2xl">📈</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Earned</h3>
              <p className="text-2xl font-semibold text-gray-900">
                ${user?.total_earned.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-2xl">🏧</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Withdrawn</h3>
              <p className="text-2xl font-semibold text-gray-900">
                ${totalApproved.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-2xl">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Direct Referrals</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {referrals.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Income Chart (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={incomeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-4">
            <a
              href="/withdraw"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Withdraw Funds</h4>
                  <p className="text-sm text-gray-500">Minimum withdrawal: $10</p>
                </div>
                <span className="text-primary-600">→</span>
              </div>
            </a>

            <a
              href="/profile"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Update Profile</h4>
                  <p className="text-sm text-gray-500">Add vantage username & withdrawal address</p>
                </div>
                <span className="text-primary-600">→</span>
              </div>
            </a>

            <a
              href="/referrals"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Share Referral Link</h4>
                  <p className="text-sm text-gray-500">Invite friends and earn more</p>
                </div>
                <span className="text-primary-600">→</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard