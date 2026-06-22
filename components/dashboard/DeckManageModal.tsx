'use client'

import { useEffect, useMemo, useState } from 'react'

import { addTodayExtraNewCards, resetTodayExtraNewCards, updateDeck } from '@/src/db/deckRepo'
import type { Deck } from '@/src/types/deck'
import { DeckCountTiles } from '@/components/decks/deck-counts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

type DeckWithStudyStats = Deck & {
  dueReviewsCount?: number
  learningCount?: number
  dueLearningCount?: number
  introducedNewToday?: number
  newCardsDailyLimit?: number
  newCardsRemainingToday?: number
  newAvailableCount?: number
}

type DeckManageModalProps = {
  deck: DeckWithStudyStats | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStudyDeck?: (deckId: string) => void
}

export function DeckManageModal({ deck, open, onOpenChange, onStudyDeck }: DeckManageModalProps) {
  const [newCardsPerDay, setNewCardsPerDay] = useState(20)
  const [reviewsPerDay, setReviewsPerDay] = useState(120)
  const [reviewsUnlimited, setReviewsUnlimited] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    if (!deck) return
    setNewCardsPerDay(deck.newCardsPerDay)
    setReviewsPerDay(deck.reviewsPerDay ?? 120)
    setReviewsUnlimited(deck.reviewsPerDay === null)
    setStatusMessage('')
  }, [deck])

  const todayStats = useMemo(() => {
    const studied = deck?.introducedNewToday ?? 0
    const limit = deck?.newCardsDailyLimit ?? deck?.newCardsPerDay ?? 0
    const remainingAllowance = deck?.newCardsRemainingToday ?? Math.max(0, limit - studied)
    const remainingInDeck = deck?.newCount ?? 0
    return { studied, limit, remainingAllowance, remainingInDeck }
  }, [deck])

  if (!deck) return null

  async function handleSave() {
    if (!deck) return
    setSaving(true)
    try {
      await updateDeck(deck.id, {
        newCardsPerDay: Math.max(0, Math.floor(newCardsPerDay || 0)),
        reviewsPerDay: reviewsUnlimited ? null : Math.max(0, Math.floor(reviewsPerDay || 0)),
      })
      setStatusMessage('Study limits saved.')
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleStudyMore() {
    if (!deck) return
    await addTodayExtraNewCards(deck.id, 10)
    setStatusMessage('Added 10 extra new cards for today.')
  }

  async function handleResetExtra() {
    if (!deck) return
    await resetTodayExtraNewCards(deck.id)
    setStatusMessage('Today extra limit reset.')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl bg-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-forest">Manage Deck</DialogTitle>
          <DialogDescription>{deck.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-xl border-forest/20 text-forest">{deck.source}</Badge>
            {deck.language && <Badge className="bg-lime text-forest hover:bg-lime">{deck.language}</Badge>}
          </div>

          <DeckCountTiles total={deck.cardCount} newCount={deck.newAvailableCount ?? deck.newCount} learningCount={deck.learningCount ?? 0} dueCount={deck.dueCount} />
          <Progress value={deck.progress} className="h-2.5" />

          <section className="space-y-3 rounded-3xl bg-cream p-4">
            <h3 className="font-extrabold text-forest">Study Limits</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="manage-new-limit">New cards per day</Label>
                <Input id="manage-new-limit" type="number" min={0} value={newCardsPerDay} onChange={(event) => setNewCardsPerDay(Number(event.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manage-review-limit">Reviews per day</Label>
                <Input id="manage-review-limit" type="number" min={0} disabled={reviewsUnlimited} value={reviewsPerDay} onChange={(event) => setReviewsPerDay(Number(event.target.value))} />
                <label className="flex items-center gap-2 text-sm font-semibold text-forest">
                  <Checkbox checked={reviewsUnlimited} onCheckedChange={(checked) => setReviewsUnlimited(checked === true)} />
                  Unlimited
                </label>
              </div>
            </div>
          </section>

          <section className="space-y-3 rounded-3xl bg-cream p-4">
            <h3 className="font-extrabold text-forest">Today</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="New studied" value={`${todayStats.studied} / ${todayStats.limit}`} />
              <Metric label="Extra new cards" value={deck.todayExtraNewCards} />
              <Metric label="Remaining in deck" value={todayStats.remainingInDeck} />
            </div>
            <p className="text-xs font-semibold text-muted-foreground">Available today: {todayStats.remainingAllowance} new cards</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="rounded-2xl bg-white" onClick={handleStudyMore}>Study 10 more new cards</Button>
              <Button type="button" variant="outline" className="rounded-2xl bg-white" onClick={handleResetExtra}>Reset today extra limit</Button>
              {onStudyDeck && <Button type="button" className="rounded-2xl bg-forest hover:bg-forest-dark" onClick={() => onStudyDeck(deck.id)}>Start studying</Button>}
            </div>
            {statusMessage && <p className="text-sm font-semibold text-forest">{statusMessage}</p>}
          </section>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" className="rounded-2xl bg-white" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" disabled={saving} className="rounded-2xl bg-forest hover:bg-forest-dark" onClick={handleSave}>{saving ? 'Saving…' : 'Save Changes'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl bg-white p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-extrabold text-forest">{value}</p></div>
}
