export type Deck = {
  id: string
  name: string
  description?: string
  starterDeckId?: string
  language?: string
  source: 'manual' | 'apkg' | 'backup' | 'starter'
  cardCount: number
  dueCount: number
  newCount: number
  learningCount?: number
  dueLearningCount?: number
  progress: number
  newCardsPerDay: number
  reviewsPerDay: number | null
  todayExtraNewCards: number
  todayLimitDate: string
  createdAt: string
  updatedAt: string
}
