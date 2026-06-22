import JSZip from 'jszip'

import { normalizeDeck } from '@/src/db/deckRepo'
import { db } from '@/src/db/db'
import { defaultSettings } from '@/src/db/settingsRepo'
import { normalizeFlashcard } from '@/src/lib/cardState'
import type { Flashcard } from '@/src/types/card'
import type { Deck } from '@/src/types/deck'
import type { MediaFile } from '@/src/types/media'
import type { Review } from '@/src/types/review'
import type { AppSettings } from '@/src/types/settings'
import type { BackupMetadata, ImportBackupResult } from './types'

type ImportBackupOptions = { mode: 'replace' | 'merge' }
const seedMarkerKey = 'linguamemo-demo-seeded'

export async function importBackup(file: File, options: ImportBackupOptions = { mode: 'replace' }): Promise<ImportBackupResult> {
  if (!file.name.toLowerCase().endsWith('.zip')) {
    throw new Error('Please choose a LinguaMemo backup .zip file.')
  }

  if (options.mode !== 'replace') {
    throw new Error('Merge backup restore is not implemented yet.')
  }

  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(file)
  } catch {
    throw new Error('Unable to read backup zip file.')
  }

  const metadata = await readJson<BackupMetadata>(zip, 'metadata.json', true)
  if (!metadata || metadata.app !== 'LinguaMemo') {
    throw new Error('This is not a valid LinguaMemo backup.')
  }

  const decks = await readJson<Deck[]>(zip, 'decks.json')
  const cards = await readJson<Flashcard[]>(zip, 'cards.json')
  const reviews = await readJson<Review[]>(zip, 'reviews.json')
  const settings = await readJson<AppSettings[]>(zip, 'settings.json')
  const media = await readMedia(zip)
  const safeDecks = decks.map(normalizeDeck)
  const safeCards = cards.map(normalizeFlashcard)

  validateArray(decks, 'decks.json')
  validateArray(cards, 'cards.json')
  validateArray(reviews, 'reviews.json')
  validateArray(settings, 'settings.json')

  await db.transaction('rw', db.decks, db.cards, db.reviews, db.settings, db.media, async () => {
    await Promise.all([db.decks.clear(), db.cards.clear(), db.reviews.clear(), db.settings.clear(), db.media.clear()])
    if (safeDecks.length > 0) await db.decks.bulkPut(safeDecks)
    if (safeCards.length > 0) await db.cards.bulkPut(safeCards)
    if (reviews.length > 0) await db.reviews.bulkPut(reviews)
    if (media.length > 0) await db.media.bulkPut(media)
    if (settings.length > 0) await db.settings.bulkPut(settings)
    else await db.settings.put({ ...defaultSettings, updatedAt: new Date().toISOString() })
  })
  markDemoSeeded()

  return { decks: safeDecks.length, cards: safeCards.length, reviews: reviews.length, media: media.length }
}

async function readJson<T>(zip: JSZip, path: string, required = false): Promise<T> {
  const entry = zip.file(path)
  if (!entry) {
    if (path === 'metadata.json') throw new Error('Invalid backup file: metadata.json not found.')
    if (required) throw new Error(`Backup is missing ${path}.`)
    return [] as T
  }

  try {
    return JSON.parse(await entry.async('string')) as T
  } catch {
    throw new Error(`Backup contains invalid JSON in ${path}.`)
  }
}

function markDemoSeeded() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(seedMarkerKey, 'true')
}

function validateArray(value: unknown, path: string): asserts value is unknown[] {
  if (!Array.isArray(value)) throw new Error(`Backup file ${path} must contain an array.`)
}

async function readMedia(zip: JSZip): Promise<MediaFile[]> {
  const mediaFiles: MediaFile[] = []

  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir || !path.startsWith('media/')) continue

    const parts = path.split('/')
    if (parts.length < 3 || !parts[1]) continue

    const deckId = safeDecode(parts[1])
    const filename = safeDecode(parts.slice(2).join('/'))
    const bytes = await entry.async('uint8array')
    const mimeType = detectMimeType(filename)

    mediaFiles.push({
      id: crypto.randomUUID(),
      deckId,
      filename,
      mimeType,
      blob: new Blob([bytes], { type: mimeType }),
      size: bytes.byteLength,
      createdAt: new Date().toISOString(),
    })
  }

  return mediaFiles
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function detectMimeType(filename: string) {
  const extension = filename.split('?')[0]?.split('#')[0]?.toLowerCase().split('.').pop()

  switch (extension) {
    case 'mp3':
      return 'audio/mpeg'
    case 'wav':
      return 'audio/wav'
    case 'ogg':
      return 'audio/ogg'
    case 'm4a':
      return 'audio/mp4'
    case 'aac':
      return 'audio/aac'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    case 'svg':
      return 'image/svg+xml'
    default:
      return 'application/octet-stream'
  }
}
