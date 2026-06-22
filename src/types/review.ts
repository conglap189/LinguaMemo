import type { CardState } from './card'

export type Review = {
  id: string
  cardId: string
  deckId: string
  rating: 'again' | 'hard' | 'good' | 'easy'
  reviewedAt: string
  nextDueAt: string
  introducedNew?: boolean
  previousState?: CardState
  nextState?: CardState
}
