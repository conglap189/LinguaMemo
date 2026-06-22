import JSZip from 'jszip'

import { defaultDeckStudyLimits } from '@/src/db/deckRepo'
import { db } from '@/src/db/db'
import { extractImageRefs, extractSoundRefs } from '@/src/lib/ankiHtmlUtils'
import { selectCardFields } from '@/src/lib/ankiFieldSelection'
import { getLocalDateKey } from '@/src/lib/dateUtils'
import { getFileBaseName, hasApkgExtension } from '@/src/lib/fileUtils'
import type { Flashcard } from '@/src/types/card'
import type { Deck } from '@/src/types/deck'

import { extractMedia } from './extractMedia'
import { parseAnkiCards } from './parseAnkiCards'
import { parseAnkiDecks } from './parseAnkiDecks'
import { parseAnkiNotes } from './parseAnkiNotes'
import { parseMediaMap } from './parseMediaMap'
import type { ImportApkgResult, ImportStatus } from './types'

type ImportApkgOptions = {
  onStatus?: (status: ImportStatus) => void
  starterDeckId?: string
  language?: string
  source?: 'apkg' | 'starter'
  deckName?: string
  description?: string
}

export async function importApkg(file: File, options: ImportApkgOptions = {}): Promise<ImportApkgResult> {
  const { onStatus } = options

  if (!hasApkgExtension(file.name)) {
    throw new Error('Please choose a valid .apkg file.')
  }

  onStatus?.({ step: 'reading-package', message: 'Reading package' })
  const zip = await JSZip.loadAsync(file)
  const collectionFile = zip.file('collection.anki21') ?? zip.file('collection.anki2')

  if (!collectionFile) {
    throw new Error('Cannot find Anki collection database in this .apkg file.')
  }

  onStatus?.({ step: 'extracting-database', message: 'Extracting database' })
  const databaseBytes = await collectionFile.async('uint8array')
  const initSqlJs = (await import('sql.js')).default
  const SQL = await initSqlJs({ locateFile: () => '/sql-wasm.wasm' })
  const ankiDb = new SQL.Database(databaseBytes)

  try {
    onStatus?.({ step: 'parsing-notes', message: 'Parsing notes' })
    const decks = parseAnkiDecks(ankiDb)
    const notes = parseAnkiNotes(ankiDb)
    const cards = parseAnkiCards(ankiDb)

    if (notes.length === 0 || cards.length === 0) {
      throw new Error('No parseable Anki notes or cards were found in this .apkg file.')
    }

    const notesById = new Map(notes.map((note) => [note.id, note]))
    const now = new Date().toISOString()
    const deckId = crypto.randomUUID()
    const deckName = options.deckName ?? decks[0]?.name ?? getFileBaseName(file.name)

    onStatus?.({ step: 'extracting-media', message: 'Extracting media' })
    const mediaMap = await parseMediaMap(zip)
    const mediaFiles = await extractMedia(zip, mediaMap, deckId)

    const flashcards: Flashcard[] = cards.flatMap((card) => {
      const note = notesById.get(card.nid)
      if (!note) return []

      const { front, back } = selectCardFields(note.fields)
      const mediaRefs = getUniqueMediaRefs(front, back)

      if (process.env.NODE_ENV !== 'production') {
        console.debug('[LinguaMemo APKG import] field selection', {
          noteId: note.id,
          fields: note.fields,
          front,
          back,
        })
      }

      return [{
        id: crypto.randomUUID(),
        deckId,
        noteId: note.id,
        front,
        back,
        fields: note.fields,
        mediaRefs,
        state: 'new',
        learningStep: 0,
        dueAt: null,
        intervalMinutes: 0,
        reviewCount: 0,
        lapseCount: 0,
        isNew: true,
        createdAt: now,
        updatedAt: now,
      }]
    })

    if (flashcards.length === 0) {
      throw new Error('No parseable Anki cards could be matched to notes in this .apkg file.')
    }

    const deck: Deck = {
      id: deckId,
      name: deckName,
      description: options.description ?? `Imported from ${file.name}`,
      starterDeckId: options.starterDeckId,
      language: options.language,
      source: options.source ?? 'apkg',
      cardCount: flashcards.length,
      dueCount: flashcards.length,
      newCount: flashcards.length,
      progress: 0,
      newCardsPerDay: defaultDeckStudyLimits.newCardsPerDay,
      reviewsPerDay: defaultDeckStudyLimits.reviewsPerDay,
      todayExtraNewCards: 0,
      todayLimitDate: getLocalDateKey(),
      createdAt: now,
      updatedAt: now,
    }

    onStatus?.({ step: 'creating-cards', message: 'Creating cards' })
    await db.transaction('rw', db.decks, db.cards, db.media, async () => {
      if (options.starterDeckId) {
        const existingStarterDeck = await db.decks.where('starterDeckId').equals(options.starterDeckId).first()
        if (existingStarterDeck) throw new Error('This starter deck is already imported.')
      }
      await db.decks.add(deck)
      await db.cards.bulkAdd(flashcards)
      if (mediaFiles.length > 0) await db.media.bulkAdd(mediaFiles)
    })
    onStatus?.({ step: 'done', message: 'Done' })

    return { deckId: deck.id, deckName, cardCount: flashcards.length, mediaCount: mediaFiles.length, starterDeckId: options.starterDeckId, language: options.language }
  } finally {
    ankiDb.close()
  }
}

function getUniqueMediaRefs(front: string, back: string) {
  return Array.from(new Set([
    ...extractSoundRefs(front),
    ...extractSoundRefs(back),
    ...extractImageRefs(front),
    ...extractImageRefs(back),
  ]))
}
