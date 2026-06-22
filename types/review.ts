export type ReviewRating = 'again' | 'hard' | 'good' | 'easy'

export type ReviewInterval = {
  rating: ReviewRating
  label: 'Again' | 'Hard' | 'Good' | 'Easy'
  interval: string
}

export type StudyActivity = {
  day: string
  reviewed: number
  accuracy: number
}

export type StudyStats = {
  totalCards: number
  dueToday: number
  newCards: number
  studyStreak: number
  cardsReviewed: number
  accuracy: number
}

export type ReviewHistory = {
  id: string
  cardId: string
  deckId: string
  rating: ReviewRating
  reviewedAt: string
  nextReview: string
}
