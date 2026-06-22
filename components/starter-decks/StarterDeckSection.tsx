'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Download, Loader2, PackagePlus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LAST_DECK_ID_STORAGE_KEY } from '@/src/features/study/resolveStudyDeckId'
import { importStarterDeck, loadStarterDeckManifest, type StarterDeckManifestItem } from '@/src/features/starter-decks/starterDecks'
import type { Deck } from '@/src/types/deck'

type StarterDeckSectionProps = {
  decks: Deck[]
  compact?: boolean
}

type ImportState = {
  activeId: string | null
  allActive: boolean
  progress: string | null
  status: string | null
  success: string | null
  error: string | null
}

const initialImportState: ImportState = {
  activeId: null,
  allActive: false,
  progress: null,
  status: null,
  success: null,
  error: null,
}

export function StarterDeckSection({ decks, compact = false }: StarterDeckSectionProps) {
  const [starterDecks, setStarterDecks] = useState<StarterDeckManifestItem[]>([])
  const [loadingManifest, setLoadingManifest] = useState(true)
  const [manifestError, setManifestError] = useState<string | null>(null)
  const [importState, setImportState] = useState<ImportState>(initialImportState)
  const importedIds = useMemo(() => new Set(decks.map((deck) => deck.starterDeckId).filter(Boolean)), [decks])
  const remainingDecks = starterDecks.filter((deck) => !importedIds.has(deck.id))

  useEffect(() => {
    let cancelled = false

    async function loadManifest() {
      setLoadingManifest(true)
      setManifestError(null)
      try {
        const manifest = await loadStarterDeckManifest()
        if (!cancelled) setStarterDecks(manifest)
      } catch (error) {
        if (!cancelled) setManifestError(error instanceof Error ? error.message : 'Could not load starter deck list.')
      } finally {
        if (!cancelled) setLoadingManifest(false)
      }
    }

    void loadManifest()
    return () => { cancelled = true }
  }, [])

  async function handleImport(deck: StarterDeckManifestItem) {
    if (importedIds.has(deck.id) || importState.activeId || importState.allActive) return

    setImportState({ ...initialImportState, activeId: deck.id, progress: `Importing ${deck.name}...` })
    try {
      const result = await importStarterDeck(deck, {
        onStatus: (status) => setImportState((current) => ({ ...current, status: status.message })),
      })
      localStorage.setItem(LAST_DECK_ID_STORAGE_KEY, result.deckId)
      setImportState({ ...initialImportState, success: `Imported ${result.deckName}.` })
    } catch (error) {
      setImportState({ ...initialImportState, error: error instanceof Error ? error.message : 'Could not import starter deck.' })
    }
  }

  async function handleImportAll() {
    if (importState.activeId || importState.allActive || remainingDecks.length === 0) return

    setImportState({ ...initialImportState, allActive: true })
    let lastDeckId: string | null = null
    const failedDecks: string[] = []

    for (let index = 0; index < remainingDecks.length; index += 1) {
      const deck = remainingDecks[index]
      setImportState({ ...initialImportState, allActive: true, activeId: deck.id, progress: `Importing ${index + 1} of ${remainingDecks.length}...` })

      try {
        const result = await importStarterDeck(deck, {
          onStatus: (status) => setImportState((current) => ({ ...current, status: status.message })),
        })
        lastDeckId = result.deckId
      } catch (error) {
        if (error instanceof Error && error.message === 'Already imported') continue
        failedDecks.push(deck.name)
      }
    }

    if (lastDeckId) localStorage.setItem(LAST_DECK_ID_STORAGE_KEY, lastDeckId)
    setImportState(failedDecks.length > 0
      ? { ...initialImportState, error: `Could not import: ${failedDecks.join(', ')}.` }
      : { ...initialImportState, success: 'Starter decks imported.' })
  }

  return (
    <section className={compact ? 'space-y-4' : 'mt-5 space-y-5'}>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-forest">Start with a deck</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Choose a starter deck and import it into your browser. Your study data stays local.</p>
        </div>
        <Button type="button" variant="outline" disabled={loadingManifest || remainingDecks.length === 0 || importState.allActive || Boolean(importState.activeId)} onClick={handleImportAll} className="rounded-2xl bg-white">
          {importState.allActive ? <Loader2 className="animate-spin" /> : <PackagePlus />}
          {remainingDecks.length === 0 ? 'All starter decks imported' : 'Import all starter decks'}
        </Button>
      </div>

      {manifestError && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{manifestError}</p>}
      {importState.progress && <p className="rounded-2xl bg-cream-dark px-4 py-3 text-sm font-bold text-forest">{importState.progress}</p>}
      {importState.status && <p className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-muted-foreground shadow-sm">{importState.status}</p>}
      {importState.success && <p className="rounded-2xl bg-lime/30 px-4 py-3 text-sm font-bold text-forest">{importState.success}</p>}
      {importState.error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{importState.error}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        {(loadingManifest ? skeletonDecks : starterDecks).map((deck) => {
          const starterDeck = deck as StarterDeckManifestItem
          const imported = importedIds.has(starterDeck.id)
          const importing = importState.activeId === starterDeck.id
          return (
            <Card key={starterDeck.id} className="rounded-3xl border-0 bg-white shadow-sm">
              <CardContent className="flex h-full flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold text-forest">{starterDeck.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{starterDeck.language}</p>
                  </div>
                  {imported ? <CheckCircle2 className="size-5 shrink-0 text-forest" /> : <Download className="size-5 shrink-0 text-muted-foreground" />}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="rounded-xl border-forest/20 text-forest">{starterDeck.language}</Badge>
                  <Badge variant="outline" className="rounded-xl border-forest/20 text-forest">Starter deck</Badge>
                </div>
                <Button type="button" disabled={loadingManifest || imported || importing || importState.allActive || Boolean(importState.activeId && !importing)} onClick={() => void handleImport(starterDeck)} className="mt-auto rounded-2xl bg-forest hover:bg-forest-dark">
                  {importing ? <Loader2 className="animate-spin" /> : null}
                  {imported ? 'Already imported' : importing ? 'Importing...' : 'Import'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

const skeletonDecks: StarterDeckManifestItem[] = [
  { id: 'english', name: 'English Vocabulary', language: 'English', file: '/deck/english.apkg' },
  { id: 'portuguese', name: 'Portuguese Vocabulary', language: 'Portuguese', file: '/deck/portuguese.apkg' },
  { id: 'spanish', name: 'Spanish Vocabulary', language: 'Spanish', file: '/deck/spanish.apkg' },
]
