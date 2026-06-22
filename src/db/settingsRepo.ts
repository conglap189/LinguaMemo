import { db } from './db'
import type { AppSettings } from '../types/settings'

export const defaultSettings: AppSettings = {
  id: 'app-settings',
  theme: 'light',
  dailyGoal: 60,
  newCardsPerDay: 20,
  reviewsPerDay: 120,
  algorithm: 'simple',
  requestedRetention: 0.9,
  maximumIntervalDays: 365,
  updatedAt: new Date().toISOString(),
}

export async function getSettings() {
  const existing = await db.settings.get('app-settings')
  if (existing) return existing
  const settings = { ...defaultSettings, updatedAt: new Date().toISOString() }
  await db.settings.put(settings)
  return settings
}

export async function updateSettings(changes: Partial<Omit<AppSettings, 'id' | 'updatedAt'>>) {
  const current = await getSettings()
  const next: AppSettings = { ...current, ...changes, id: 'app-settings', updatedAt: new Date().toISOString() }
  await db.settings.put(next)
  return next
}

export async function clearAllData() {
  const { clearAllLocalData } = await import('./dbMaintenance')
  await clearAllLocalData()
}
