export type Deck = {
  id: string
  name: string
  language: string
  description: string
  totalCards: number
  dueCards: number
  newCards: number
  progress: number
  lastStudied: string
  level: string
  tags: string[]
}
