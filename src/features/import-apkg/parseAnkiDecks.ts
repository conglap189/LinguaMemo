import type { Database } from 'sql.js'

import type { AnkiDeckInfo } from './types'
import { runAnkiQuery, valueToString } from './parseAnkiDb'

type RawAnkiDeck = {
  name?: unknown
}

export function parseAnkiDecks(db: Database): AnkiDeckInfo[] {
  const rows = runAnkiQuery(db, 'select decks from col limit 1')
  const decksJson = valueToString(rows[0]?.decks ?? '')
  if (!decksJson) return []

  try {
    const parsed = JSON.parse(decksJson) as Record<string, RawAnkiDeck>
    return Object.entries(parsed)
      .map(([id, deck]) => ({ id, name: typeof deck.name === 'string' ? deck.name : '' }))
      .filter((deck) => deck.name.length > 0)
  } catch {
    return []
  }
}
