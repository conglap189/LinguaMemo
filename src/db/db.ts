import Dexie, { type Table } from 'dexie'

import type { Flashcard } from '../types/card'
import type { Deck } from '../types/deck'
import type { MediaFile } from '../types/media'
import type { Review } from '../types/review'
import type { AppSettings } from '../types/settings'

export class AppDatabase extends Dexie {
  decks!: Table<Deck, string>
  cards!: Table<Flashcard, string>
  media!: Table<MediaFile, string>
  reviews!: Table<Review, string>
  settings!: Table<AppSettings, string>

  constructor() {
    super('LinguaMemo')
    this.version(1).stores({
      decks: 'id, name, language, source, createdAt, updatedAt',
      cards: 'id, deckId, noteId, dueAt, isNew, createdAt, updatedAt, [deckId+dueAt]',
      reviews: 'id, cardId, deckId, rating, reviewedAt, nextDueAt, [deckId+reviewedAt]',
      settings: 'id, updatedAt',
    })
    this.version(2).stores({
      decks: 'id, name, language, source, createdAt, updatedAt',
      cards: 'id, deckId, noteId, dueAt, isNew, createdAt, updatedAt, [deckId+dueAt]',
      media: 'id, deckId, filename, mimeType, createdAt',
      reviews: 'id, cardId, deckId, rating, reviewedAt, nextDueAt, [deckId+reviewedAt]',
      settings: 'id, updatedAt',
    })
    this.version(3).stores({
      decks: 'id, name, language, source, starterDeckId, createdAt, updatedAt',
      cards: 'id, deckId, noteId, dueAt, isNew, createdAt, updatedAt, [deckId+dueAt]',
      media: 'id, deckId, filename, mimeType, createdAt',
      reviews: 'id, cardId, deckId, rating, reviewedAt, nextDueAt, [deckId+reviewedAt]',
      settings: 'id, updatedAt',
    })
  }
}

export const db = new AppDatabase()
