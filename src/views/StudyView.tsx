'use client'

import { useEffect } from 'react'
import { ArrowLeft, RotateCcw } from 'lucide-react'

import type { AppView } from '@/components/app/types'
import { DeckCountPills } from '@/components/decks/deck-counts'
import { ReviewButtons } from '@/components/study/ReviewButtons'
import { StudyCard } from '@/components/study/StudyCard'
import { StudySummary } from '@/components/study/StudySummary'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { LAST_DECK_ID_STORAGE_KEY } from '@/src/features/study/resolveStudyDeckId'
import { useDecks } from '@/src/hooks/useDecks'
import { useStudySession } from '@/src/hooks/useStudySession'

type StudyViewProps = {
  deckId?: string | null
  onSelectDeck?: (deckId: string | null) => void
  onViewChange?: (view: AppView) => void
  onManageDeck?: (deckId: string) => void
}

export function StudyView({ deckId, onSelectDeck, onViewChange, onManageDeck }: StudyViewProps) {
  const decks = useDecks()
  const deckList = decks ?? []
  const deck = deckList.find((item) => item.id === deckId)
  const session = useStudySession(deckId)
  const progress = session.queue.length === 0 ? 0 : ((session.currentIndex + 1) / session.queue.length) * 100

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, button, [contenteditable="true"]')) return

      if (event.key === ' ' && !session.isRevealed && session.currentCard) {
        event.preventDefault()
        session.reveal()
      }

      if (session.isRevealed) {
        const rating = event.key === '1' ? 'again' : event.key === '2' ? 'hard' : event.key === '3' ? 'good' : event.key === '4' ? 'easy' : null
        if (rating) {
          event.preventDefault()
          void session.answer(rating)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [session])

  useEffect(() => {
    if (decks === undefined || deckList.length === 0) return

    if (deckId && !deckList.some((item) => item.id === deckId)) {
      onSelectDeck?.(null)
      localStorage.removeItem(LAST_DECK_ID_STORAGE_KEY)
      return
    }

    if (!deckId && deckList.length === 1) {
      const onlyDeckId = deckList[0].id
      onSelectDeck?.(onlyDeckId)
      localStorage.setItem(LAST_DECK_ID_STORAGE_KEY, onlyDeckId)
    }
  }, [deckId, decks, deckList, onSelectDeck])

  function selectDeckForStudy(nextDeckId: string) {
    onSelectDeck?.(nextDeckId)
    localStorage.setItem(LAST_DECK_ID_STORAGE_KEY, nextDeckId)
  }

  if (!deckId) {
    if (decks === undefined) {
      return <EmptyStudy title="Loading local library..." message="Reading decks and cards from IndexedDB." />
    }

    if (deckList.length === 0) {
      return <EmptyStudy title="No decks yet" message="Import an .apkg file to start studying." onImport={onViewChange ? () => onViewChange('import') : undefined} />
    }

    if (deckList.length > 1) {
      return <DeckPicker decks={deckList} onStudyDeck={selectDeckForStudy} onBackToDashboard={onViewChange ? () => onViewChange('dashboard') : undefined} />
    }

    return <EmptyStudy title="Loading study session…" message="Opening your deck." />
  }

  if (session.loading) {
    return <EmptyStudy title="Loading study session…" message="Finding reviews and new cards for this deck." />
  }

  if (!deck) {
    return <EmptyStudy title="This deck no longer exists." message="Choose another deck." onBackToDashboard={onViewChange ? () => onViewChange('dashboard') : undefined} onChooseDeck={deckList.length > 0 ? () => onSelectDeck?.(null) : undefined} />
  }

  if (!session.currentCard) {
    if (session.queueStats?.emptyReason === 'review-limit-reached') {
      return (
        <EmptyStudy
          title="Done for today"
          message="You reached your review limit for this deck."
          details={`New studied today ${session.queueStats.introducedNewToday} / ${session.queueStats.newCardsLimit} · Learning remaining ${session.queueStats.dueLearningTotal} · Due reviews ${session.queueStats.dueReviewsTotal} · New cards remaining ${session.queueStats.newCardsRemainingInDeck}`}
          onManageDeck={deckId && onManageDeck ? () => onManageDeck(deckId) : undefined}
          onBackToDashboard={onViewChange ? () => onViewChange('dashboard') : undefined}
        />
      )
    }
    if (session.queueStats?.emptyReason === 'new-limit-reached') {
      return (
        <EmptyStudy
          title="Done for today"
          message="You reached your new card limit for this deck."
          details={`New studied today ${session.queueStats.introducedNewToday} / ${session.queueStats.newCardsLimit} · Learning remaining ${session.queueStats.dueLearningTotal} · Due reviews ${session.queueStats.dueReviewsTotal} · New cards remaining ${session.queueStats.newCardsRemainingInDeck}`}
          onStudyMore={() => void session.studyMoreToday(10)}
          onManageDeck={deckId && onManageDeck ? () => onManageDeck(deckId) : undefined}
          onBackToDashboard={onViewChange ? () => onViewChange('dashboard') : undefined}
        />
      )
    }
    if (session.done && session.reviewedCount > 0) {
      return (
        <StudySummary
          reviewedCount={session.reviewedCount}
          ratingCounts={session.ratingCounts}
          onBackToDashboard={onViewChange ? () => onViewChange('dashboard') : undefined}
          onStudyAnotherDeck={onViewChange ? () => onViewChange('decks') : undefined}
        />
      )
    }
    return <EmptyStudy title="No cards due right now." message="You are caught up for this deck today." onBackToDashboard={onViewChange ? () => onViewChange('dashboard') : undefined} />
  }

  return (
    <div className="study-layout-compact flex bg-cream">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col px-4 py-2 sm:px-5 sm:py-3 lg:px-6 lg:py-4">
        <div className="study-compact-header flex shrink-0 flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground md:text-xs">Study session</p>
              <h1 className="mt-1 truncate text-2xl font-extrabold tracking-tight text-forest md:text-3xl">{deck?.name ?? 'Study'}</h1>
              <p className="mt-1 text-xs text-muted-foreground md:text-sm">Card {session.currentIndex + 1} of {session.queue.length}</p>
            </div>
            <div className="flex shrink-0 flex-row gap-2">
              {onViewChange && (
                <Button
                  size="sm"
                  className="rounded-2xl bg-lime px-3 text-forest shadow-sm shadow-forest/10 hover:bg-lime-dark"
                  onClick={() => onViewChange('dashboard')}
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
              )}
              <Button variant="outline" size="sm" className="rounded-2xl bg-white" onClick={session.resetSession}><RotateCcw className="size-4" />Restart</Button>
            </div>
          </div>
          <Progress value={progress} className="h-2.5" />
        </div>

        <div className="study-card-region min-h-0 flex-1 overflow-hidden py-2 sm:py-3">
          <StudyCard card={session.currentCard} revealed={session.isRevealed} onReveal={session.reveal} />
        </div>

        <div className="review-buttons-wrapper">
          {!session.isRevealed ? (
            <div className="flex justify-center">
              <Button
                type="button"
                size="lg"
                className="h-12 rounded-2xl bg-forest px-10 hover:bg-forest-dark"
                onPointerDown={session.reveal}
                onClick={session.reveal}
              >
                Reveal
              </Button>
            </div>
          ) : (
            <ReviewButtons card={session.currentCard} onAnswer={session.answer} />
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyStudy({ title, message, details, onBackToDashboard, onChooseDeck, onStudyMore, onManageDeck, onImport }: { title: string; message: string; details?: string; onBackToDashboard?: () => void; onChooseDeck?: () => void; onStudyMore?: () => void; onManageDeck?: () => void; onImport?: () => void }) {
  return (
    <div className="mx-auto max-w-5xl bg-cream">
      <Card className="rounded-3xl border-dashed border-forest/20 bg-white">
        <CardContent className="py-16 text-center">
          <h1 className="text-3xl font-extrabold text-forest">{title}</h1>
          <p className="mt-2 text-muted-foreground">{message}</p>
          {details && <p className="mt-3 text-sm font-semibold text-forest">{details}</p>}
          {(onBackToDashboard || onChooseDeck || onStudyMore || onManageDeck || onImport) && (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {onStudyMore && <Button type="button" onClick={onStudyMore} className="rounded-2xl bg-forest hover:bg-forest-dark">Study 10 more new cards</Button>}
              {onManageDeck && <Button type="button" variant="outline" onClick={onManageDeck} className="rounded-2xl bg-white">Manage deck</Button>}
              {onImport && <Button type="button" onClick={onImport} className="rounded-2xl bg-forest hover:bg-forest-dark">Import .apkg</Button>}
              {onBackToDashboard && <Button type="button" onClick={onBackToDashboard} className="rounded-2xl bg-forest hover:bg-forest-dark">Back to Dashboard</Button>}
              {onChooseDeck && <Button type="button" variant="outline" onClick={onChooseDeck} className="rounded-2xl bg-white">Choose Deck</Button>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

type StudyDeck = NonNullable<ReturnType<typeof useDecks>>[number]

function DeckPicker({ decks, onStudyDeck, onBackToDashboard }: { decks: StudyDeck[]; onStudyDeck: (deckId: string) => void; onBackToDashboard?: () => void }) {
  return (
    <div className="mx-auto max-w-5xl bg-cream">
      <Card className="rounded-3xl border-0 bg-white shadow-sm">
        <CardContent className="p-6 md:p-8">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-forest">Choose a deck</h1>
              <p className="mt-2 text-sm text-muted-foreground">Pick which local deck you want to continue studying.</p>
            </div>
            {onBackToDashboard && <Button type="button" variant="outline" className="rounded-2xl bg-white" onClick={onBackToDashboard}>Back to Dashboard</Button>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {decks.map((deck) => (
              <div key={deck.id} className="rounded-3xl bg-cream p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-extrabold text-forest">{deck.name}</h2>
                    <DeckCountPills className="mt-3" total={deck.cardCount} newCount={deck.newAvailableCount ?? deck.newCount} learningCount={deck.learningCount ?? 0} dueCount={deck.dueCount} />
                    <p className="mt-1 text-xs font-semibold text-forest/80">New today: {deck.introducedNewToday} / {deck.newCardsDailyLimit}</p>
                  </div>
                  {deck.doneToday && <span className="rounded-xl bg-lime px-2 py-1 text-[10px] font-bold text-forest">Done today</span>}
                </div>
                <Button type="button" className="mt-4 w-full rounded-2xl bg-forest hover:bg-forest-dark" onClick={() => onStudyDeck(deck.id)}>Study</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
