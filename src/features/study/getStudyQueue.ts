import { getCardsByDeckId } from '@/src/db/cardRepo'
import { getDeck } from '@/src/db/deckRepo'
import { db } from '@/src/db/db'
import { isDueLearningCard, isDueReviewCard, isNewCard } from '@/src/lib/cardState'
import { getLocalDateKey } from '@/src/lib/dateUtils'
import type { Flashcard } from '@/src/types/card'

type StudyQueueOptions = {
  newCardsLimit?: number
  reviewsLimit?: number
}

export type StudyQueueStats = {
  dueReviewsTotal: number
  dueReviewsIncluded: number
  dueLearningTotal: number
  reviewedDueToday: number
  newCardsTotal: number
  newCardsRemainingInDeck: number
  introducedNewToday: number
  newCardsLimit: number
  newCardsRemaining: number
  reviewsLimit: number | null
  reviewsRemaining: number | null
  emptyReason: 'new-limit-reached' | 'review-limit-reached' | 'no-due-cards' | null
}

export type StudyQueueResult = {
  cards: Flashcard[]
  stats: StudyQueueStats
}

export async function getStudyQueue(deckId: string, options: StudyQueueOptions = {}): Promise<StudyQueueResult> {
  const deck = await getDeck(deckId)
  const today = getLocalDateKey()
  const newCardsLimit = options.newCardsLimit ?? ((deck?.newCardsPerDay ?? 20) + (deck?.todayLimitDate === today ? deck.todayExtraNewCards : 0))
  const reviewsLimit = options.reviewsLimit ?? deck?.reviewsPerDay ?? null
  const nowDate = new Date()
  const [cards, reviews] = await Promise.all([getCardsByDeckId(deckId), db.reviews.where('deckId').equals(deckId).toArray()])
  const introducedNewToday = reviews.filter((review) => review.introducedNew === true && getLocalDateKey(new Date(review.reviewedAt)) === today).length
  const newCardsRemaining = Math.max(0, newCardsLimit - introducedNewToday)
  const reviewedDueToday = reviews.filter((review) => review.introducedNew !== true && getLocalDateKey(new Date(review.reviewedAt)) === today).length
  const reviewsRemaining = reviewsLimit === null ? null : Math.max(0, reviewsLimit - reviewedDueToday)

  const dueLearningTotal = cards.filter((card) => isDueLearningCard(card, nowDate))
  const dueReviewsTotal = cards.filter((card) => isDueReviewCard(card, nowDate))
  const dueReviews = reviewsRemaining === null ? dueReviewsTotal : dueReviewsTotal.slice(0, reviewsRemaining)
  const newCardsTotal = cards.filter((card) => isNewCard(card))
  const newCards = newCardsTotal.slice(0, newCardsRemaining)
  const queue = [...dueLearningTotal, ...dueReviews, ...newCards]
  const emptyReason = queue.length > 0
    ? null
    : dueReviewsTotal.length > 0 && reviewsRemaining === 0
      ? 'review-limit-reached'
      : newCardsTotal.length > 0 && newCardsRemaining === 0
        ? 'new-limit-reached'
        : 'no-due-cards'

  return {
    cards: queue,
    stats: {
      dueReviewsTotal: dueReviewsTotal.length,
      dueReviewsIncluded: dueReviews.length,
      dueLearningTotal: dueLearningTotal.length,
      reviewedDueToday,
      newCardsTotal: newCardsTotal.length,
      newCardsRemainingInDeck: newCardsTotal.length,
      introducedNewToday,
      newCardsLimit,
      newCardsRemaining,
      reviewsLimit,
      reviewsRemaining,
      emptyReason,
    },
  }
}
