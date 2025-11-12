'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Smartphone, Laptop, Tablet, Watch, Headphones, Plus, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Device {
  id: string
  name: string
  category: string
  purchaseDate: string | null
  cost: number | null
  status: string
  notes: string | null
}

const categoryIcons: Record<string, any> = {
  smartphone: Smartphone,
  laptop: Laptop,
  tablet: Tablet,
  smartwatch: Watch,
  headphones: Headphones,
}

export default function DeviceTracker() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: 'smartphone',
    purchaseDate: '',
    cost: '',
    status: 'active',
    notes: '',
  })

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices')
      const data = await response.json()
      setDevices(data)
    } catch (error) {
      console.error('Error fetching devices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchDevices()
        setShowForm(false)
        setFormData({
          name: '',
          category: 'smartphone',
          purchaseDate: '',
          cost: '',
          status: 'active',
          notes: '',
        })
      }
    } catch (error) {
      console.error('Error creating device:', error)
    }
  }

  const activeDevices = devices.filter(d => d.status === 'active')
  const totalValue = activeDevices.reduce((sum, d) => sum + (d.cost || 0), 0)

  if (loading) {
    return <div>Loading devices...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>My Tech Devices</CardTitle>
            <CardDescription>
              Track your current tech inventory
            </CardDescription>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Device Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="iPhone 15 Pro"
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
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Purchase Date</label>
                <Input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cost</label>
                <Input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="999"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Add Device</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Active Devices</p>
            <p className="text-2xl font-bold">{activeDevices.length}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
          </div>
        </div>

        <div className="space-y-3">
          {devices.map((device) => {
            const Icon = categoryIcons[device.category] || Smartphone
            return (
              <div
                key={device.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{device.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {device.category.replace('_', ' ')}
                      {device.purchaseDate && ` • ${new Date(device.purchaseDate).getFullYear()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {device.cost && (
                    <span className="text-sm font-medium">{formatCurrency(device.cost)}</span>
                  )}
                  <Badge variant={device.status === 'active' ? 'default' : 'secondary'}>
                    {device.status}
                  </Badge>
                </div>
              </div>
            )
          })}
          {devices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No devices tracked yet. Add your first device to get started!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
