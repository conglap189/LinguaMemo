'use client'

import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '../db/db'
import { normalizeDeck } from '../db/deckRepo'
import { isDueLearningCard, isDueReviewCard, isNewCard, normalizeCardState } from '../lib/cardState'
import { getLocalDateKey } from '../lib/dateUtils'

export function useDecks() {
  return useLiveQuery(async () => {
    const [decks, cards, reviews] = await Promise.all([db.decks.orderBy('createdAt').toArray(), db.cards.toArray(), db.reviews.toArray()])
    const now = Date.now()
    const today = getLocalDateKey()

    return decks.map((rawDeck) => {
      const deck = normalizeDeck(rawDeck)
      const deckCards = cards.filter((card) => card.deckId === deck.id)
      const cardCount = deckCards.length
      const newCount = deckCards.filter((card) => isNewCard(card)).length
      const learningCount = deckCards.filter((card) => normalizeCardState(card) === 'learning').length
      const dueLearningCount = deckCards.filter((card) => isDueLearningCard(card, now)).length
      const dueReviewsCount = deckCards.filter((card) => isDueReviewCard(card, now)).length
      const introducedNewToday = reviews.filter((review) => review.deckId === deck.id && review.introducedNew === true && getLocalDateKey(new Date(review.reviewedAt)) === today).length
      const reviewedDueToday = reviews.filter((review) => review.deckId === deck.id && review.introducedNew !== true && getLocalDateKey(new Date(review.reviewedAt)) === today).length
      const newCardsDailyLimit = deck.newCardsPerDay + deck.todayExtraNewCards
      const newCardsRemainingToday = Math.max(0, newCardsDailyLimit - introducedNewToday)
      const newAvailableCount = Math.min(newCount, newCardsRemainingToday)
      const reviewsRemainingToday = deck.reviewsPerDay === null ? null : Math.max(0, deck.reviewsPerDay - reviewedDueToday)
      const limitedDueReviewsCount = reviewsRemainingToday === null ? dueReviewsCount : Math.min(dueReviewsCount, reviewsRemainingToday)
      const dueCount = limitedDueReviewsCount
      const reviewedCards = deckCards.filter((card) => normalizeCardState(card) !== 'new').length
      const progress = cardCount === 0 ? 0 : Math.round((reviewedCards / cardCount) * 100)

      return {
        ...deck,
        cardCount,
        newCount,
        learningCount,
        dueLearningCount,
        dueCount,
        dueReviewsCount,
        introducedNewToday,
        reviewedDueToday,
        newCardsDailyLimit,
        newCardsRemainingToday,
        newAvailableCount,
        reviewsRemainingToday,
        doneToday: dueLearningCount === 0 && dueReviewsCount === 0 && newCount > 0 && newCardsRemainingToday === 0,
        progress,
      }
    })
  }, [])
}
