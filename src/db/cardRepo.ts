import { db } from './db'
import { isDueLearningCard, isDueReviewCard, isNewCard, normalizeCardState } from '../lib/cardState'
import type { Flashcard } from '../types/card'

export async function getCardsByDeckId(deckId: string) {
  return db.cards.where('deckId').equals(deckId).sortBy('dueAt')
}

export async function createCards(cards: Array<Pick<Flashcard, 'deckId' | 'front' | 'back'> & Partial<Flashcard>>) {
  const now = new Date().toISOString()
  const newCards: Flashcard[] = cards.map((card) => {
    const state = card.state ?? (card.isNew === false || (card.reviewCount ?? 0) > 0 ? 'review' : 'new')
    return {
      id: card.id ?? crypto.randomUUID(),
      deckId: card.deckId,
      noteId: card.noteId,
      front: card.front,
      back: card.back,
      fields: card.fields ?? [],
      mediaRefs: card.mediaRefs ?? [],
      state,
      learningStep: card.learningStep ?? 0,
      dueAt: card.dueAt === undefined ? null : card.dueAt,
      intervalMinutes: card.intervalMinutes ?? 0,
      reviewCount: card.reviewCount ?? 0,
      lapseCount: card.lapseCount ?? 0,
      isNew: card.isNew ?? state === 'new',
      createdAt: card.createdAt ?? now,
      updatedAt: card.updatedAt ?? now,
    }
  })

  await db.transaction('rw', db.cards, db.decks, async () => {
    await db.cards.bulkPut(newCards)
    const deckIds = Array.from(new Set(newCards.map((card) => card.deckId)))
    await Promise.all(deckIds.map(refreshDeckCounts))
  })

  return newCards
}

export async function refreshDeckCounts(deckId: string) {
  const now = new Date()
  const cards = await db.cards.where('deckId').equals(deckId).toArray()
  const cardCount = cards.length
  const newCount = cards.filter((card) => isNewCard(card)).length
  const learningCount = cards.filter((card) => normalizeCardState(card) === 'learning').length
  const dueLearningCount = cards.filter((card) => isDueLearningCard(card, now)).length
  const dueCount = cards.filter((card) => isDueReviewCard(card, now)).length
  const reviewedCards = cards.filter((card) => normalizeCardState(card) !== 'new').length
  const progress = cardCount === 0 ? 0 : Math.round((reviewedCards / cardCount) * 100)
  await db.decks.update(deckId, { cardCount, dueCount, newCount, learningCount, dueLearningCount, progress, updatedAt: now.toISOString() })
}
