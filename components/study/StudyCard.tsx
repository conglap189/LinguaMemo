'use client'

import type { CSSProperties } from 'react'

import type { Flashcard } from '@/src/types/card'
import { selectCardFields } from '@/src/lib/ankiFieldSelection'
import { Card, CardContent } from '@/components/ui/card'
import { AnkiStyleCardContent, canRenderAsLanguageCard, getLanguageCardFront } from './AnkiStyleCardContent'
import { CardContentWithMedia } from './CardContentWithMedia'

type StudyCardProps = {
  card: Flashcard
  revealed: boolean
  onReveal: () => void
}

export function StudyCard({ card, revealed, onReveal }: StudyCardProps) {
  const displayFields = card.fields.length > 0 ? selectCardFields(card.fields) : { front: card.front, back: card.back }
  const useAnkiStyle = card.fields.length > 0 && canRenderAsLanguageCard(card.fields)
  const frontHtml = useAnkiStyle ? (getLanguageCardFront(card.fields) ?? displayFields.front) : displayFields.front
  const frontTextLength = stripMarkup(frontHtml).length
  const frontSize = frontTextLength > 24 ? 'clamp(22px, 3.4vw, 40px)' : 'clamp(28px, 4vw, 56px)'

  if (process.env.NODE_ENV !== 'production' && displayFields.front !== card.front) {
    console.debug('[LinguaMemo Study] corrected display fields', {
      cardId: card.id,
      storedFront: card.front,
      displayFront: displayFields.front,
      fields: card.fields,
    })
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onReveal}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onReveal()
        }
      }}
      className="block h-full min-h-0 w-full cursor-pointer text-left outline-none focus-visible:ring-3 focus-visible:ring-lime/40"
    >
      <Card className="study-card-container rounded-3xl border-0 bg-white shadow-sm transition-colors hover:bg-cream-dark/30">
        <CardContent className="flex h-full min-h-0 flex-col p-0">
          {!revealed ? (
            <div className="study-card-scroll flex flex-1 flex-col items-center justify-center text-center">
              <div className="mx-auto flex min-h-full w-full max-w-[760px] flex-col items-center justify-center rounded-3xl bg-cream px-5 py-6 md:px-10 md:py-8">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Front</p>
                {useAnkiStyle ? (
                  <AnkiStyleCardContent deckId={card.deckId} fields={card.fields} side="front" />
                ) : (
                  <CardContentWithMedia
                    deckId={card.deckId}
                    html={frontHtml}
                    className="study-front-content mx-auto font-extrabold tracking-tight text-forest"
                    style={{ fontSize: frontSize } as CSSProperties}
                  />
                )}
                <p className="mt-5 text-xs text-muted-foreground md:text-sm">Click the card or use Reveal to show the answer.</p>
              </div>
            </div>
          ) : (
            <div className="study-card-scroll flex flex-1 flex-col">
              <div className="mx-auto w-full max-w-[760px] rounded-3xl bg-cream px-5 py-5 md:px-9 md:py-7">
                {useAnkiStyle ? (
                  <AnkiStyleCardContent deckId={card.deckId} fields={card.fields} side="back" />
                ) : (
                  <>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Front</p>
                    <CardContentWithMedia deckId={card.deckId} html={displayFields.front} className="study-front-small font-semibold text-muted-foreground" />

                    <div className="my-4 border-t border-forest/20" />

                    <p className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-muted-foreground">Back</p>
                    <CardContentWithMedia deckId={card.deckId} html={displayFields.back} className="study-back-content text-forest" />
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function stripMarkup(value: string) {
  return value
    .replace(/\[sound:[^\]]+\]/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
