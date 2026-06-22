'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, MoreHorizontal, Plus, Trash2, Upload } from 'lucide-react'

import type { AppView } from '@/components/app/types'
import { DeckManageModal } from '@/components/dashboard/DeckManageModal'
import { DeckCountPills } from '@/components/decks/deck-counts'
import { StarterDeckSection } from '@/components/starter-decks/StarterDeckSection'
import { createDeck, deleteDeck } from '@/src/db/deckRepo'
import { LAST_DECK_ID_STORAGE_KEY } from '@/src/features/study/resolveStudyDeckId'
import { useDecks } from '@/src/hooks/useDecks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'

type DashboardPageProps = {
  onViewChange?: (view: AppView) => void
  onStudyDeck?: (deckId: string) => void
  initialManageDeckId?: string | null
  onManageDeckClosed?: () => void
}

export function DashboardPage({ onViewChange, onStudyDeck, initialManageDeckId, onManageDeckClosed }: DashboardPageProps = {}) {
  const decks = useDecks()
  const deckList = decks ?? []
  const [newDeckOpen, setNewDeckOpen] = useState(false)
  const [manageDeckId, setManageDeckId] = useState<string | null>(initialManageDeckId ?? null)
  const [pendingDeleteDeckId, setPendingDeleteDeckId] = useState<string | null>(null)
  const manageDeck = deckList.find((deck) => deck.id === manageDeckId) ?? null
  const pendingDeleteDeck = deckList.find((deck) => deck.id === pendingDeleteDeckId) ?? null

  async function handleDeleteDeck() {
    if (!pendingDeleteDeck) return

    const deckId = pendingDeleteDeck.id
    await deleteDeck(deckId)
    if (manageDeckId === deckId) setManageDeckId(null)
    if (localStorage.getItem(LAST_DECK_ID_STORAGE_KEY) === deckId) {
      localStorage.removeItem(LAST_DECK_ID_STORAGE_KEY)
    }
    setPendingDeleteDeckId(null)
  }

  return (
    <div className="mx-auto h-full max-w-6xl overflow-y-auto overflow-x-hidden bg-cream pb-[calc(88px+env(safe-area-inset-bottom))] lg:pb-0">
      <div className="mb-4 flex items-center justify-between py-1 lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime text-xs font-black text-forest" style={{ outline: '2px solid var(--lime)', outlineOffset: '2px' }}>LM</div>
          <div>
            <p className="text-[10px] text-muted-foreground">Welcome back</p>
            <span className="font-bold text-forest text-sm">LinguaMemo</span>
          </div>
        </div>
        <button type="button" onClick={() => onViewChange?.('import')} className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white shadow-sm">
          <Upload size={16} className="text-forest" />
        </button>
      </div>

      <section className="mb-4 flex flex-col gap-3 md:mb-5 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-forest md:text-4xl">Your Decks</h1>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:flex md:flex-wrap">
          <Button type="button" onClick={() => onViewChange?.('import')} className="rounded-2xl bg-forest text-white hover:bg-forest-dark"><Upload />Import .apkg</Button>
          <Button type="button" variant="outline" onClick={() => setNewDeckOpen(true)} className="rounded-2xl bg-white"><Plus />New Deck</Button>
        </div>
      </section>

      <section>
        {decks === undefined ? (
          <Card className="rounded-3xl border-dashed border-forest/20 bg-white">
            <CardContent className="py-16 text-center">
              <h2 className="text-2xl font-extrabold text-forest">Loading local library...</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Reading decks and cards from IndexedDB.</p>
            </CardContent>
          </Card>
        ) : deckList.length === 0 ? (
          <Card className="rounded-3xl border-dashed border-forest/20 bg-white">
            <CardContent className="py-16 text-center">
              <h2 className="text-2xl font-extrabold text-forest">No decks yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Import a starter deck, choose an Anki .apkg file, or create a new deck to start studying.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button type="button" onClick={() => onViewChange?.('import')} className="rounded-2xl bg-forest hover:bg-forest-dark"><Upload />Import .apkg</Button>
                <Button type="button" variant="outline" onClick={() => setNewDeckOpen(true)} className="rounded-2xl bg-white"><Plus />New Deck</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {deckList.map((deck) => (
            <Card key={deck.id} className="rounded-3xl border-0 bg-white shadow-sm transition-colors hover:bg-cream-dark/30">
              <CardContent className="flex h-full flex-col gap-5 p-5 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-extrabold tracking-tight text-forest">{deck.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{deck.source === 'apkg' ? 'Imported from .apkg' : deck.language ?? 'Manual deck'}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline" className="rounded-xl border-forest/20 text-forest">{deck.source}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-full bg-white" aria-label={`Deck actions for ${deck.name}`}>
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 rounded-2xl bg-white p-1.5">
                        <DropdownMenuItem className="rounded-xl" onClick={() => setManageDeckId(deck.id)}>
                          <MoreHorizontal className="size-4" />
                          Manage
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" className="rounded-xl" onClick={() => setPendingDeleteDeckId(deck.id)}>
                          <Trash2 className="size-4" />
                          Delete deck
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <DeckCountPills total={deck.cardCount} newCount={deck.newAvailableCount ?? deck.newCount} learningCount={deck.learningCount ?? 0} dueCount={deck.dueCount} />
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-forest/80">
                  <span>New today: {deck.introducedNewToday} / {deck.newCardsDailyLimit}</span>
                  {deck.doneToday && <Badge className="rounded-xl bg-lime text-forest hover:bg-lime">Done today</Badge>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>Progress</span>
                    <span>{deck.progress}%</span>
                  </div>
                  <Progress value={deck.progress} className="h-2.5" />
                </div>

                <div className="mt-auto flex gap-2 md:gap-3">
                  <Button type="button" onClick={() => onStudyDeck?.(deck.id)} className="flex-1 rounded-2xl bg-forest hover:bg-forest-dark">Study <ArrowRight className="size-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </section>

      {decks !== undefined && <StarterDeckSection decks={deckList} />}

      <NewDeckDialog open={newDeckOpen} onOpenChange={setNewDeckOpen} existingNames={deckList.map((deck) => deck.name)} />
      <DeckManageModal deck={manageDeck} open={manageDeck !== null} onOpenChange={(open) => { if (!open) { setManageDeckId(null); onManageDeckClosed?.() } }} onStudyDeck={onStudyDeck} />
      <ConfirmModal
        open={pendingDeleteDeck !== null}
        title="Delete deck?"
        description={pendingDeleteDeck ? `Delete “${pendingDeleteDeck.name}” and all of its cards, media, and review history from this browser. If this was a starter deck, it will become available to import again.` : ''}
        confirmLabel="Delete deck"
        destructive
        onCancel={() => setPendingDeleteDeckId(null)}
        onConfirm={handleDeleteDeck}
      />
    </div>
  )
}

function NewDeckDialog({ open, onOpenChange, existingNames }: { open: boolean; onOpenChange: (open: boolean) => void; existingNames: string[] }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const trimmedName = name.trim()
  const duplicateName = useMemo(() => existingNames.some((item) => item.trim().toLowerCase() === trimmedName.toLowerCase()), [existingNames, trimmedName])
  const canCreate = trimmedName.length > 0 && !duplicateName && !submitting

  async function handleCreate() {
    if (!canCreate) return

    setSubmitting(true)
    try {
      await createDeck({
        id: crypto.randomUUID(),
        name: trimmedName,
        description: description.trim() || undefined,
        language: language.trim() || undefined,
        source: 'manual',
        cardCount: 0,
        dueCount: 0,
        newCount: 0,
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      setName('')
      setDescription('')
      setLanguage('')
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl bg-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-forest">New Deck</DialogTitle>
          <DialogDescription>Create a local manual deck. You can add cards in a later step.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deck-name">Deck name</Label>
            <Input id="deck-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="English Vocabulary" autoFocus />
            {duplicateName && <p className="text-xs font-semibold text-red-600">A deck with this name already exists.</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="deck-description">Description optional</Label>
            <Textarea id="deck-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short notes about this deck" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deck-language">Language optional</Label>
            <Input id="deck-language" value={language} onChange={(event) => setLanguage(event.target.value)} placeholder="Japanese, Korean, English..." />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" className="rounded-2xl bg-white" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" disabled={!canCreate} className="rounded-2xl bg-forest hover:bg-forest-dark" onClick={handleCreate}>{submitting ? 'Creating…' : 'Create Deck'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
