import { db } from '@/src/db/db'
import { refreshDeckCounts } from '@/src/db/cardRepo'
import { scheduleNextReview, type Rating } from '@/src/features/scheduler/simpleScheduler'
import { normalizeFlashcard } from '@/src/lib/cardState'
import type { Flashcard } from '@/src/types/card'
import type { Review } from '@/src/types/review'

type ReviewCardInput = {
  card: Flashcard
  rating: Rating
}

export async function reviewCard({ card, rating }: ReviewCardInput): Promise<{ updatedCard: Flashcard; review: Review }> {
  const now = new Date()
  const reviewedAt = now.toISOString()
  const normalizedCard = normalizeFlashcard(card)
  const previousState = normalizedCard.state
  const scheduled = scheduleNextReview({
    rating,
    card: normalizedCard,
    intervalMinutes: normalizedCard.intervalMinutes,
    now,
  })
  const review: Review = {
    id: crypto.randomUUID(),
    cardId: card.id,
    deckId: card.deckId,
    rating,
    reviewedAt,
    nextDueAt: scheduled.dueAt,
    introducedNew: previousState === 'new',
    previousState,
    nextState: scheduled.state,
  }
  const updatedCard: Flashcard = {
    ...normalizedCard,
    state: scheduled.state,
    learningStep: scheduled.learningStep,
    dueAt: scheduled.dueAt,
    intervalMinutes: scheduled.intervalMinutes,
    reviewCount: normalizedCard.reviewCount + 1,
    lapseCount: scheduled.lapseCount,
    isNew: scheduled.state === 'new',
    updatedAt: reviewedAt,
  }

  await db.transaction('rw', db.reviews, db.cards, db.decks, async () => {
    await db.reviews.add(review)
    await db.cards.put(updatedCard)
    await refreshDeckCounts(card.deckId)
  })

  return { updatedCard, review }
}
