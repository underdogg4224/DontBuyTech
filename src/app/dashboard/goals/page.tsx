'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Target, Plus, TrendingDown, DollarSign, Smartphone } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

interface Goal {
  id: string
  type: string
  target: number
  current: number
  deadline: string | null
  status: string
  createdAt: string
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'save_money',
    target: '',
    deadline: '',
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      const data = await response.json()
      setGoals(data)
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchGoals()
        setShowForm(false)
        setFormData({
          type: 'save_money',
          target: '',
          deadline: '',
        })
      }
    } catch (error) {
      console.error('Error creating goal:', error)
    }
  }

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'save_money':
        return DollarSign
      case 'reduce_devices':
        return Smartphone
      case 'avoid_purchases':
        return TrendingDown
      default:
        return Target
    }
  }

  const getGoalLabel = (type: string) => {
    switch (type) {
      case 'save_money':
        return 'Save Money'
      case 'reduce_devices':
        return 'Reduce Devices'
      case 'avoid_purchases':
        return 'Avoid Purchases'
      default:
        return type
    }
  }

  const formatGoalValue = (type: string, value: number) => {
    if (type === 'save_money') {
      return formatCurrency(value)
    }
    return value.toString()
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Goals</h1>
          <p className="text-gray-600">Set and track your tech minimalism objectives</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Active Goals</CardTitle>
                <CardDescription>Track your progress towards tech minimalism</CardDescription>
              </div>
              <Button onClick={() => setShowForm(!showForm)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showForm && (
              <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Goal Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="save_money">Save Money</option>
                      <option value="reduce_devices">Reduce Devices</option>
                      <option value="avoid_purchases">Avoid Purchases</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Target {formData.type === 'save_money' ? 'Amount ($)' : 'Number'}
                    </label>
                    <Input
                      type="number"
                      value={formData.target}
                      onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                      placeholder="5000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Deadline (Optional)</label>
                    <Input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create Goal</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {activeGoals.map((goal) => {
                const Icon = getGoalIcon(goal.type)
                const progress = Math.min((goal.current / goal.target) * 100, 100)
                const daysRemaining = goal.deadline
                  ? Math.ceil(
                      (new Date(goal.deadline).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : null

                return (
                  <div key={goal.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{getGoalLabel(goal.type)}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatGoalValue(goal.type, goal.current)} of{' '}
                            {formatGoalValue(goal.type, goal.target)}
                          </p>
                        </div>
                      </div>
                      {daysRemaining !== null && (
                        <Badge variant={daysRemaining < 7 ? 'destructive' : 'default'}>
                          {daysRemaining > 0
                            ? `${daysRemaining} days left`
                            : 'Deadline passed'}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Progress value={progress} />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{Math.round(progress)}% complete</span>
                        <span>
                          {formatGoalValue(goal.type, goal.target - goal.current)} remaining
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {activeGoals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No active goals yet. Set your first goal to start your journey!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {completedGoals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Completed Goals</CardTitle>
              <CardDescription>Goals you've successfully achieved</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {completedGoals.map((goal) => {
                  const Icon = getGoalIcon(goal.type)
                  return (
                    <div key={goal.id} className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Icon className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{getGoalLabel(goal.type)}</h3>
                          <p className="text-sm text-muted-foreground">
                            Target: {formatGoalValue(goal.type, goal.target)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
