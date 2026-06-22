'use client'

import { StudyView } from '@/src/views/StudyView'

export function StudyPage({ deckId }: { deckId?: string }) {
  return <StudyView deckId={deckId} />
}
