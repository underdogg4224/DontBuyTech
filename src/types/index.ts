export type DeviceCategory =
  | 'smartphone'
  | 'laptop'
  | 'tablet'
  | 'smartwatch'
  | 'headphones'
  | 'gaming_console'
  | 'smart_home'
  | 'other'

export type DeviceStatus = 'active' | 'sold' | 'donated' | 'recycled'

export type ChallengeType = 'no_purchases' | 'device_reduction' | 'mindful_usage'

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard'

export type ChallengeStatus = 'active' | 'completed' | 'failed' | 'abandoned'

export type AchievementCategory = 'savings' | 'challenges' | 'devices' | 'mindfulness'

export type GoalType = 'reduce_devices' | 'save_money' | 'avoid_purchases'

export type GoalStatus = 'active' | 'completed' | 'abandoned'

export interface DeviceWithStats {
  id: string
  name: string
  category: string
  purchaseDate: Date | null
  cost: number | null
  status: string
  daysOwned?: number
}

export interface SavingsStats {
  totalSaved: number
  purchasesAvoided: number
  averageSavings: number
  thisMonth: number
  thisYear: number
}

export interface ChallengeWithProgress {
  id: string
  name: string
  description: string
  duration: number
  type: string
  difficulty: string
  startDate: Date
  endDate: Date
  progress: number
  status: string
  checkInsCount: number
  successRate: number
}

export interface BadgeRequirement {
  type: 'savings' | 'days_active' | 'challenges_completed' | 'devices_reduced'
  value: number
}
