export type AppSettings = {
  id: 'app-settings'
  theme: 'light' | 'dark' | 'system'
  dailyGoal: number
  newCardsPerDay: number
  reviewsPerDay: number
  algorithm: 'simple' | 'fsrs'
  requestedRetention: number
  maximumIntervalDays: number
  updatedAt: string
}
