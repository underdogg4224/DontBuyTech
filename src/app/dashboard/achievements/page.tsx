'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Lock, Trophy, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  requirement: string
  earned: boolean
  earnedAt: string | null
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements')
      const data = await response.json()
      setAchievements(data)
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const earnedAchievements = achievements.filter(a => a.earned)
  const lockedAchievements = achievements.filter(a => !a.earned)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'savings':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'challenges':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'devices':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'mindfulness':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRequirementText = (requirement: string) => {
    try {
      const req = JSON.parse(requirement)
      switch (req.type) {
        case 'avoided_purchases':
          return `Avoid ${req.value} purchase${req.value > 1 ? 's' : ''}`
        case 'total_saved':
          return `Save $${req.value}`
        case 'challenges_completed':
          return `Complete ${req.value} challenge${req.value > 1 ? 's' : ''}`
        case 'devices_reduced':
          return `Reduce ${req.value} device${req.value > 1 ? 's' : ''}`
        case 'days_active':
          return `Stay active for ${req.value} days`
        default:
          return 'Complete requirement'
      }
    } catch {
      return 'Complete requirement'
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Achievements</h1>
          <p className="text-gray-600">Unlock badges by building sustainable tech habits</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Achievements</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{achievements.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Earned</CardTitle>
              <Star className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{earnedAchievements.length}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((earnedAchievements.length / achievements.length) * 100)}% complete
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <Lock className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lockedAchievements.length}</div>
            </CardContent>
          </Card>
        </div>

        {earnedAchievements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-600" />
              Earned Achievements
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedAchievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`border-2 ${getCategoryColor(achievement.category)} hover:shadow-lg transition-shadow`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{achievement.icon}</div>
                        <div>
                          <CardTitle className="text-lg">{achievement.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {achievement.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Earned {achievement.earnedAt ? new Date(achievement.earnedAt).toLocaleDateString() : 'recently'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Lock className="h-6 w-6 text-gray-600" />
            Locked Achievements
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map((achievement) => (
              <Card
                key={achievement.id}
                className="border-2 border-gray-200 opacity-75 hover:opacity-100 transition-opacity"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl grayscale">{achievement.icon}</div>
                      <div>
                        <CardTitle className="text-lg text-muted-foreground">
                          {achievement.name}
                        </CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {achievement.category}
                        </Badge>
                      </div>
                    </div>
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Target className="h-3 w-3" />
                    <span>{getRequirementText(achievement.requirement)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Target({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
