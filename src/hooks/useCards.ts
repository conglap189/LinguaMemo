'use client'

import { useLiveQuery } from 'dexie-react-hooks'

import { getCardsByDeckId } from '../db/cardRepo'

export function useCards(deckId?: string) {
  return useLiveQuery(() => (deckId ? getCardsByDeckId(deckId) : Promise.resolve([])), [deckId], [])
}
