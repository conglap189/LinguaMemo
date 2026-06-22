import { getDeckByStarterDeckId } from '@/src/db/deckRepo'
import { importApkg } from '@/src/features/import-apkg/importApkg'
import type { ImportApkgResult, ImportStatus } from '@/src/features/import-apkg/types'

export type StarterDeckManifestItem = {
  id: string
  name: string
  language: string
  description?: string
  url?: string
  file?: string
}

export const starterDeckManifestPath = '/deck/decks.json'
export const starterDeckLoadError = 'Could not load starter deck. Please check that the .apkg file exists in public/deck.'

export async function loadStarterDeckManifest() {
  const response = await fetch(starterDeckManifestPath)
  if (!response.ok) throw new Error('Could not load starter deck list.')
  return response.json() as Promise<StarterDeckManifestItem[]>
}

export async function importStarterDeck(deck: StarterDeckManifestItem, options: { onStatus?: (status: ImportStatus) => void } = {}): Promise<ImportApkgResult> {
  const existingDeck = await getDeckByStarterDeckId(deck.id)
  if (existingDeck) {
    throw new Error('Already imported')
  }

  const deckUrl = deck.url || deck.file
  if (!deckUrl) throw new Error(starterDeckLoadError)

  let response: Response
  try {
    response = await fetch(deckUrl)
  } catch {
    throw new Error(starterDeckLoadError)
  }

  if (!response.ok) throw new Error(starterDeckLoadError)

  const blob = await response.blob()
  const filename = deckUrl.split('/').pop() || `${deck.id}.apkg`
  const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' })

  return importApkg(file, {
    onStatus: options.onStatus,
    starterDeckId: deck.id,
    language: deck.language,
    source: 'starter',
    deckName: deck.name,
    description: `Starter deck: ${deck.name}`,
  })
}
