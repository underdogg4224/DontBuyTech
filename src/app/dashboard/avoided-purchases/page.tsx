'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, TrendingUp, DollarSign, Calendar, PiggyBank } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDate } from '@/lib/utils'

interface AvoidedPurchase {
  id: string
  itemName: string
  category: string
  estimatedCost: number
  avoidedDate: string
  reason: string | null
  notes: string | null
}

interface SavingsStats {
  totalSaved: number
  purchasesAvoided: number
  averageSavings: number
  thisMonth: number
  thisYear: number
}

export default function AvoidedPurchasesPage() {
  const [purchases, setPurchases] = useState<AvoidedPurchase[]>([])
  const [stats, setStats] = useState<SavingsStats>({
    totalSaved: 0,
    purchasesAvoided: 0,
    averageSavings: 0,
    thisMonth: 0,
    thisYear: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'smartphone',
    estimatedCost: '',
    reason: '',
    notes: '',
  })

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/avoided-purchases')
      const data = await response.json()
      setPurchases(data.purchases)
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching avoided purchases:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/avoided-purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchPurchases()
        setShowForm(false)
        setFormData({
          itemName: '',
          category: 'smartphone',
          estimatedCost: '',
          reason: '',
          notes: '',
        })
      }
    } catch (error) {
      console.error('Error creating avoided purchase:', error)
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Avoided Purchases</h1>
          <p className="text-gray-600">Track items you didn't buy and celebrate your savings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
              <PiggyBank className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalSaved)}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.thisMonth)}</div>
              <p className="text-xs text-muted-foreground">
                {purchases.filter(p => {
                  const now = new Date()
                  const purchaseDate = new Date(p.avoidedDate)
                  return purchaseDate.getMonth() === now.getMonth() &&
                         purchaseDate.getFullYear() === now.getFullYear()
                }).length} purchases avoided
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.averageSavings)}
              </div>
              <p className="text-xs text-muted-foreground">Per avoided purchase</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Year</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.thisYear)}</div>
              <p className="text-xs text-muted-foreground">{stats.purchasesAvoided} total</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Purchase Log</CardTitle>
                <CardDescription>
                  Every avoided purchase is a victory for your wallet and the planet
                </CardDescription>
              </div>
              <Button onClick={() => setShowForm(!showForm)}>
                <Plus className="h-4 w-4 mr-2" />
                Log Avoided Purchase
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showForm && (
              <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Item Name</label>
                    <Input
                      value={formData.itemName}
                      onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                      placeholder="Apple Watch Series 9"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="smartphone">Smartphone</option>
                      <option value="laptop">Laptop</option>
                      <option value="tablet">Tablet</option>
                      <option value="smartwatch">Smartwatch</option>
                      <option value="headphones">Headphones</option>
                      <option value="gaming_console">Gaming Console</option>
                      <option value="smart_home">Smart Home</option>
                      <option value="accessories">Accessories</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Estimated Cost</label>
                    <Input
                      type="number"
                      value={formData.estimatedCost}
                      onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                      placeholder="399"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Reason</label>
                    <Input
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Don't really need it"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional thoughts..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Save</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{purchase.itemName}</h3>
                      <span className="text-xs text-muted-foreground capitalize px-2 py-1 bg-muted rounded">
                        {purchase.category.replace('_', ' ')}
                      </span>
                    </div>
                    {purchase.reason && (
                      <p className="text-sm text-muted-foreground">{purchase.reason}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(purchase.avoidedDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(purchase.estimatedCost)}
                    </p>
                    <p className="text-xs text-muted-foreground">saved</p>
                  </div>
                </div>
              ))}
              {purchases.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No avoided purchases yet. Log your first one to start tracking your savings!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
