import type { CardState, Flashcard } from '@/src/types/card'

export function normalizeCardState(card: Partial<Flashcard>): CardState {
  if (card.state === 'new' || card.state === 'learning' || card.state === 'review') return card.state
  if (card.isNew === true || (card.reviewCount ?? 0) === 0) return 'new'
  return 'review'
}

export function normalizeFlashcard(card: Flashcard): Flashcard {
  const state = normalizeCardState(card)
  return {
    ...card,
    state,
    learningStep: card.learningStep ?? 0,
    dueAt: state === 'new' && card.dueAt === undefined ? null : card.dueAt ?? null,
    intervalMinutes: card.intervalMinutes ?? 0,
    reviewCount: card.reviewCount ?? 0,
    lapseCount: card.lapseCount ?? 0,
    isNew: state === 'new',
  }
}

export function isNewCard(card: Partial<Flashcard>) {
  return normalizeCardState(card) === 'new'
}

export function isLearningCard(card: Partial<Flashcard>) {
  return normalizeCardState(card) === 'learning'
}

export function isDueLearningCard(card: Partial<Flashcard>, now: Date | string | number = new Date()) {
  return isLearningCard(card) && card.dueAt !== null && card.dueAt !== undefined && new Date(card.dueAt).getTime() <= new Date(now).getTime()
}

export function isDueReviewCard(card: Partial<Flashcard>, now: Date | string | number = new Date()) {
  return normalizeCardState(card) === 'review' && card.dueAt !== null && card.dueAt !== undefined && new Date(card.dueAt).getTime() <= new Date(now).getTime()
}
