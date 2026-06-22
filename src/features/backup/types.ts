import type { Flashcard } from '@/src/types/card'
import type { Deck } from '@/src/types/deck'
import type { MediaFile } from '@/src/types/media'
import type { Review } from '@/src/types/review'
import type { AppSettings } from '@/src/types/settings'

export type BackupMetadata = {
  app: 'LinguaMemo'
  version: 1
  exportedAt: string
  counts: {
    decks: number
    cards: number
    reviews: number
    media: number
  }
}

export type BackupData = {
  metadata: BackupMetadata
  decks: Deck[]
  cards: Flashcard[]
  reviews: Review[]
  settings: AppSettings[]
  media: MediaFile[]
}

export type ImportBackupResult = {
  decks: number
  cards: number
  reviews: number
  media: number
}
