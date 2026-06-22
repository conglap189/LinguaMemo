'use client'

import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '../db/db'
import { getStats, type LocalStats } from '../db/reviewRepo'

export const emptyStats: LocalStats = {
  totalCards: 0,
  dueToday: 0,
  newCards: 0,
  studyStreak: 0,
  reviewed: 0,
  reviewedToday: 0,
  accuracy: 0,
  activity: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({ day, reviewed: 0, accuracy: 0 })),
  dueForecast: ['Tomorrow', '3 days', '7 days'].map((label) => ({ label, cards: 0, progress: 0 })),
}

export function useStats() {
  return useLiveQuery(() => getStats(), [db.cards, db.reviews, db.decks], emptyStats)
}
