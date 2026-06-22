import { db } from './db'
import { getLocalDateKey } from '../lib/dateUtils'
import type { Deck } from '../types/deck'

export const defaultDeckStudyLimits = {
  newCardsPerDay: 20,
  reviewsPerDay: null as number | null,
}

export function normalizeDeck(deck: Deck): Deck {
  const today = getLocalDateKey()
  const todayLimitDate = deck.todayLimitDate ?? today
  return {
    ...deck,
    newCardsPerDay: Math.max(0, deck.newCardsPerDay ?? defaultDeckStudyLimits.newCardsPerDay),
    reviewsPerDay: deck.reviewsPerDay === undefined ? defaultDeckStudyLimits.reviewsPerDay : deck.reviewsPerDay === null ? null : Math.max(0, deck.reviewsPerDay),
    todayExtraNewCards: todayLimitDate === today ? Math.max(0, deck.todayExtraNewCards ?? 0) : 0,
    todayLimitDate: todayLimitDate === today ? todayLimitDate : today,
  }
}

export async function getAllDecks() {
  const decks = await db.decks.orderBy('createdAt').toArray()
  return decks.map(normalizeDeck)
}

export async function createDeck(deck: Omit<Deck, 'id' | 'cardCount' | 'dueCount' | 'newCount' | 'progress' | 'newCardsPerDay' | 'reviewsPerDay' | 'todayExtraNewCards' | 'todayLimitDate' | 'createdAt' | 'updatedAt'> & Partial<Deck>) {
  const now = new Date().toISOString()
  const id = deck.id ?? crypto.randomUUID()
  const today = getLocalDateKey()
  const todayLimitDate = deck.todayLimitDate ?? today
  const newDeck: Deck = {
    id,
    name: deck.name,
    description: deck.description,
    starterDeckId: deck.starterDeckId,
    language: deck.language,
    source: deck.source ?? 'manual',
    cardCount: deck.cardCount ?? 0,
    dueCount: deck.dueCount ?? 0,
    newCount: deck.newCount ?? 0,
    progress: deck.progress ?? 0,
    newCardsPerDay: Math.max(0, deck.newCardsPerDay ?? defaultDeckStudyLimits.newCardsPerDay),
    reviewsPerDay: deck.reviewsPerDay === undefined ? defaultDeckStudyLimits.reviewsPerDay : deck.reviewsPerDay === null ? null : Math.max(0, deck.reviewsPerDay),
    todayExtraNewCards: todayLimitDate === today ? Math.max(0, deck.todayExtraNewCards ?? 0) : 0,
    todayLimitDate: today,
    createdAt: deck.createdAt ?? now,
    updatedAt: deck.updatedAt ?? now,
  }
  await db.decks.put(newDeck)
  return newDeck
}

export async function getDeck(deckId: string) {
  const deck = await db.decks.get(deckId)
  return deck ? normalizeDeck(deck) : undefined
}

export async function getDeckByStarterDeckId(starterDeckId: string) {
  const deck = await db.decks.where('starterDeckId').equals(starterDeckId).first()
  return deck ? normalizeDeck(deck) : undefined
}

export async function updateDeck(deckId: string, changes: Partial<Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>>) {
  const existing = await getDeck(deckId)
  if (!existing) throw new Error(`Deck not found: ${deckId}`)
  const next = normalizeDeck({ ...existing, ...changes, id: deckId, updatedAt: new Date().toISOString() })
  await db.decks.put(next)
  return next
}

export async function addTodayExtraNewCards(deckId: string, amount: number) {
  const deck = await getDeck(deckId)
  if (!deck) throw new Error(`Deck not found: ${deckId}`)
  const today = getLocalDateKey()
  const currentExtra = deck.todayLimitDate === today ? deck.todayExtraNewCards : 0
  return updateDeck(deckId, { todayLimitDate: today, todayExtraNewCards: Math.max(0, currentExtra + amount) })
}

export async function resetTodayExtraNewCards(deckId: string) {
  return updateDeck(deckId, { todayLimitDate: getLocalDateKey(), todayExtraNewCards: 0 })
}

export async function deleteDeck(deckId: string) {
  await db.transaction('rw', db.decks, db.cards, db.media, db.reviews, async () => {
    await db.decks.delete(deckId)
    await db.cards.where('deckId').equals(deckId).delete()
    await db.media.where('deckId').equals(deckId).delete()
    await db.reviews.where('deckId').equals(deckId).delete()
  })
}
