export type CardState = 'new' | 'learning' | 'review'

export type Flashcard = {
  id: string
  deckId: string
  noteId?: string
  front: string
  back: string
  fields: string[]
  mediaRefs: string[]
  state: CardState
  learningStep: number
  dueAt: string | null
  intervalMinutes: number
  reviewCount: number
  lapseCount?: number
  isNew?: boolean
  createdAt: string
  updatedAt: string
}
