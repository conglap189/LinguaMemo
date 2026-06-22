import { db } from './db'
import { loadDemoData } from './seed'
import { defaultSettings } from './settingsRepo'

const seedMarkerKey = 'linguamemo-demo-seeded'

export async function clearAllLocalData(): Promise<void> {
  await db.transaction('rw', db.decks, db.cards, db.reviews, db.media, db.settings, async () => {
    await Promise.all([db.decks.clear(), db.cards.clear(), db.reviews.clear(), db.media.clear(), db.settings.clear()])
    await db.settings.put({ ...defaultSettings, updatedAt: new Date().toISOString() })
  })
  setDemoSeededMarker()
}

export async function resetDemoData(): Promise<void> {
  await db.transaction('rw', db.decks, db.cards, db.reviews, db.media, db.settings, async () => {
    await Promise.all([db.decks.clear(), db.cards.clear(), db.reviews.clear(), db.media.clear(), db.settings.clear()])
    await db.settings.put({ ...defaultSettings, updatedAt: new Date().toISOString() })
  })
  clearDemoSeededMarker()
  await loadDemoData()
}

function setDemoSeededMarker() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(seedMarkerKey, 'true')
}

function clearDemoSeededMarker() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(seedMarkerKey)
}
