import type { Deck } from '@/src/types/deck'

type ResolveStudyDeckIdParams = {
  selectedDeckId?: string | null
  decks: Pick<Deck, 'id'>[]
  lastDeckId?: string | null
}

export const LAST_DECK_ID_STORAGE_KEY = 'linguamemo-last-deck-id'

export function resolveStudyDeckId({ selectedDeckId, decks, lastDeckId }: ResolveStudyDeckIdParams): string | null {
  if (selectedDeckId && decks.some((deck) => deck.id === selectedDeckId)) {
    return selectedDeckId
  }

  if (lastDeckId && decks.some((deck) => deck.id === lastDeckId)) {
    return lastDeckId
  }

  if (decks.length === 1) {
    return decks[0].id
  }

  return null
}
