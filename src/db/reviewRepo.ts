import { db } from './db'
import { refreshDeckCounts } from './cardRepo'
import { reviewCard } from '../features/study/reviewCard'
import { isDueLearningCard, isDueReviewCard, isNewCard, normalizeCardState } from '../lib/cardState'
import type { Review } from '../types/review'

export type LocalStats = {
  totalCards: number
  dueToday: number
  newCards: number
  studyStreak: number
  reviewed: number
  reviewedToday: number
  accuracy: number
  activity: Array<{ day: string; reviewed: number; accuracy: number }>
  dueForecast: Array<{ label: string; cards: number; progress: number }>
}

export async function createReview(input: Omit<Review, 'id' | 'reviewedAt' | 'nextDueAt'> & Partial<Review>) {
  const card = await db.cards.get(input.cardId)
  if (!card) throw new Error(`Card not found: ${input.cardId}`)
  const result = await reviewCard({ card, rating: input.rating })
  return result.review
}

export async function getReviews() {
  return db.reviews.orderBy('reviewedAt').reverse().toArray()
}

export async function getStats(): Promise<LocalStats> {
  const now = Date.now()
  const cards = await db.cards.toArray()
  const reviews = await db.reviews.toArray()
  const totalCards = cards.length
  const dueToday = cards.filter((card) => isDueLearningCard(card, now) || isDueReviewCard(card, now)).length
  const newCards = cards.filter((card) => isNewCard(card)).length
  const reviewed = reviews.length
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)
  const reviewedToday = reviews.filter((review) => {
    const reviewedAt = new Date(review.reviewedAt).getTime()
    return reviewedAt >= todayStart.getTime() && reviewedAt < tomorrowStart.getTime()
  }).length
  const correct = reviews.filter((review) => review.rating === 'good' || review.rating === 'easy').length
  const accuracy = reviewed === 0 ? 0 : Math.round((correct / reviewed) * 100)
  const activity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now - (6 - index) * 86_400_000)
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    const dayReviews = reviews.filter((review) => {
      const reviewedAt = new Date(review.reviewedAt).getTime()
      return reviewedAt >= start.getTime() && reviewedAt < end.getTime()
    })
    const dayCorrect = dayReviews.filter((review) => review.rating === 'good' || review.rating === 'easy').length
    return {
      day: date.toLocaleDateString(undefined, { weekday: 'short' }),
      reviewed: dayReviews.length,
      accuracy: dayReviews.length === 0 ? 0 : Math.round((dayCorrect / dayReviews.length) * 100),
    }
  })
  const dueWindows = [
    { label: 'Tomorrow', days: 1 },
    { label: '3 days', days: 3 },
    { label: '7 days', days: 7 },
  ]
  const maxDue = Math.max(1, cards.length)
  const dueForecast = dueWindows.map(({ label, days }) => {
    const cutoff = now + days * 86_400_000
    const count = cards.filter((card) => normalizeCardState(card) !== 'new' && card.dueAt && new Date(card.dueAt).getTime() <= cutoff).length
    return { label, cards: count, progress: Math.min(100, Math.round((count / maxDue) * 100)) }
  })

  // TODO: Compute a real streak from review days once streak UX is finalized.
  return { totalCards, dueToday, newCards, studyStreak: 0, reviewed, reviewedToday, accuracy, activity, dueForecast }
}
