'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Calendar, TrendingUp, CheckCircle2, Play } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface Challenge {
  id: string
  name: string
  description: string
  duration: number
  type: string
  difficulty: string
  participants: any[]
}

interface UserChallenge {
  id: string
  challengeId: string
  startDate: string
  endDate: string
  status: string
  progress: number
  challenge: Challenge
  checkIns: any[]
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChallenges()
    fetchUserChallenges()
  }, [])

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/challenges')
      const data = await response.json()
      setChallenges(data)
    } catch (error) {
      console.error('Error fetching challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserChallenges = async () => {
    try {
      const response = await fetch('/api/user/challenges')
      const data = await response.json()
      setUserChallenges(data)
    } catch (error) {
      console.error('Error fetching user challenges:', error)
    }
  }

  const joinChallenge = async (challengeId: string) => {
    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId }),
      })

      if (response.ok) {
        await fetchUserChallenges()
      }
    } catch (error) {
      console.error('Error joining challenge:', error)
    }
  }

  const isEnrolled = (challengeId: string) => {
    return userChallenges.some(
      uc => uc.challengeId === challengeId && uc.status === 'active'
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'no_purchases':
        return '🛑'
      case 'device_reduction':
        return '📉'
      case 'mindful_usage':
        return '🧘'
      default:
        return '🎯'
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const activeChallenges = userChallenges.filter(uc => uc.status === 'active')
  const completedChallenges = userChallenges.filter(uc => uc.status === 'completed')

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Community Challenges</h1>
          <p className="text-gray-600">Join challenges and build sustainable tech habits</p>
        </div>

        {activeChallenges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">My Active Challenges</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {activeChallenges.map((uc) => {
                const daysTotal = uc.challenge.duration
                const startDate = new Date(uc.startDate)
                const now = new Date()
                const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                const daysRemaining = daysTotal - daysElapsed

                return (
                  <Card key={uc.id} className="border-2 border-green-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getTypeIcon(uc.challenge.type)}</span>
                          <div>
                            <CardTitle className="text-lg">{uc.challenge.name}</CardTitle>
                            <CardDescription>{uc.challenge.description}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{uc.progress}%</span>
                          </div>
                          <Progress value={uc.progress} />
                        </div>
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{daysRemaining} days remaining</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>{uc.checkIns.length} check-ins</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Available Challenges</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-3xl">{getTypeIcon(challenge.type)}</span>
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  <CardTitle>{challenge.name}</CardTitle>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{challenge.duration} days</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{challenge.participants.length} participants</span>
                      </div>
                    </div>
                    {isEnrolled(challenge.id) ? (
                      <Button variant="outline" className="w-full" disabled>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Enrolled
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => joinChallenge(challenge.id)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Join Challenge
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {completedChallenges.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Completed Challenges</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {completedChallenges.map((uc) => (
                <Card key={uc.id} className="bg-muted">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <CardTitle className="text-base">{uc.challenge.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Completed on {new Date(uc.endDate).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
