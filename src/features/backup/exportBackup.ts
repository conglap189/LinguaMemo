import { saveAs } from 'file-saver'
import JSZip from 'jszip'

import { normalizeDeck } from '@/src/db/deckRepo'
import { db } from '@/src/db/db'
import type { BackupMetadata } from './types'

export async function exportBackup(): Promise<void> {
  try {
    const [decks, cards, reviews, settings, media] = await Promise.all([
      db.decks.toArray(),
      db.cards.toArray(),
      db.reviews.toArray(),
      db.settings.toArray(),
      db.media.toArray(),
    ])

    const metadata: BackupMetadata = {
      app: 'LinguaMemo',
      version: 1,
      exportedAt: new Date().toISOString(),
      counts: {
        decks: decks.length,
        cards: cards.length,
        reviews: reviews.length,
        media: media.length,
      },
    }

    const zip = new JSZip()
    zip.file('metadata.json', JSON.stringify(metadata, null, 2))
    zip.file('decks.json', JSON.stringify(decks.map(normalizeDeck), null, 2))
    zip.file('cards.json', JSON.stringify(cards, null, 2))
    zip.file('reviews.json', JSON.stringify(reviews, null, 2))
    zip.file('settings.json', JSON.stringify(settings, null, 2))

    for (const file of media) {
      const deckFolder = encodeURIComponent(file.deckId)
      const filename = encodeURIComponent(file.filename)
      zip.file(`media/${deckFolder}/${filename}`, file.blob)
    }

    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
    saveAs(blob, `linguamemo-backup-${formatBackupTimestamp(new Date())}.zip`)
  } catch (error) {
    throw new Error(error instanceof Error ? `Unable to create backup: ${error.message}` : 'Unable to create backup.')
  }
}

function formatBackupTimestamp(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}-${pad(date.getMinutes())}`
}
