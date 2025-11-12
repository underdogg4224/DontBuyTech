'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import StatsOverview from '@/components/dashboard/StatsOverview'
import DeviceTracker from '@/components/dashboard/DeviceTracker'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalSaved: 0,
    purchasesAvoided: 0,
    activeChallenges: 0,
    achievementsEarned: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [purchasesRes, challengesRes, achievementsRes] = await Promise.all([
        fetch('/api/avoided-purchases'),
        fetch('/api/user/challenges'),
        fetch('/api/achievements'),
      ])

      const purchasesData = await purchasesRes.json()
      const challengesData = await challengesRes.json()
      const achievementsData = await achievementsRes.json()

      setStats({
        totalSaved: purchasesData.stats?.totalSaved || 0,
        purchasesAvoided: purchasesData.stats?.purchasesAvoided || 0,
        activeChallenges: challengesData.filter((c: any) => c.status === 'active').length,
        achievementsEarned: achievementsData.filter((a: any) => a.earned).length,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Track your tech minimalism journey</p>
        </div>

        <div className="space-y-6">
          <StatsOverview
            totalSaved={stats.totalSaved}
            purchasesAvoided={stats.purchasesAvoided}
            activeChallenges={stats.activeChallenges}
            achievementsEarned={stats.achievementsEarned}
          />

          <DeviceTracker />

          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/dashboard/avoided-purchases"
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-green-200"
            >
              <h3 className="text-lg font-semibold mb-2">Avoided Purchases</h3>
              <p className="text-sm text-muted-foreground">
                Log items you didn't buy and track your savings
              </p>
            </Link>

            <Link
              href="/dashboard/challenges"
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-green-200"
            >
              <h3 className="text-lg font-semibold mb-2">Challenges</h3>
              <p className="text-sm text-muted-foreground">
                Join community challenges and track your progress
              </p>
            </Link>

            <Link
              href="/dashboard/achievements"
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-green-200"
            >
              <h3 className="text-lg font-semibold mb-2">Achievements</h3>
              <p className="text-sm text-muted-foreground">
                View your badges and unlock new achievements
              </p>
            </Link>

            <Link
              href="/dashboard/goals"
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-green-200"
            >
              <h3 className="text-lg font-semibold mb-2">Goals</h3>
              <p className="text-sm text-muted-foreground">
                Set and track your tech minimalism goals
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
