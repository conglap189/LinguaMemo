'use client'

import { useEffect } from 'react'

import { db } from '@/src/db/db'
import { getSettings } from '@/src/db/settingsRepo'

export function useAppStartup() {
  useEffect(() => {
    let cancelled = false

    async function initializeLocalDatabase() {
      await getSettings()

      if (process.env.NODE_ENV !== 'production' && !cancelled) {
        const [decks, cards, reviews, media] = await Promise.all([
          db.decks.count(),
          db.cards.count(),
          db.reviews.count(),
          db.media.count(),
        ])
        console.log('[LinguaMemo] DB counts', { decks, cards, reviews, media })
      }
    }

    void initializeLocalDatabase()

    return () => {
      cancelled = true
    }
  }, [])
}
