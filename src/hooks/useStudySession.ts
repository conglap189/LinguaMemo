'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { addTodayExtraNewCards } from '@/src/db/deckRepo'
import { getStudyQueue } from '@/src/features/study/getStudyQueue'
import type { StudyQueueStats } from '@/src/features/study/getStudyQueue'
import { reviewCard } from '@/src/features/study/reviewCard'
import type { Rating } from '@/src/features/scheduler/simpleScheduler'
import type { Flashcard } from '@/src/types/card'

const emptyRatingCounts: Record<Rating, number> = { again: 0, hard: 0, good: 0, easy: 0 }

export function useStudySession(deckId: string | null | undefined) {
  const [queue, setQueue] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [ratingCounts, setRatingCounts] = useState<Record<Rating, number>>(emptyRatingCounts)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [queueStats, setQueueStats] = useState<StudyQueueStats | null>(null)

  const currentCard = queue[currentIndex]

  const loadQueue = useCallback(async () => {
    if (!deckId) {
      setQueue([])
      setCurrentIndex(0)
      setIsRevealed(false)
      setDone(false)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const nextQueue = await getStudyQueue(deckId)
      setQueue(nextQueue.cards)
      setQueueStats(nextQueue.stats)
      setCurrentIndex(0)
      setIsRevealed(false)
      setDone(nextQueue.cards.length === 0)
    } finally {
      setLoading(false)
    }
  }, [deckId])

  useEffect(() => {
    setReviewedCount(0)
    setRatingCounts(emptyRatingCounts)
    void loadQueue()
  }, [loadQueue])

  const reveal = useCallback(() => setIsRevealed(true), [])

  const answer = useCallback(async (rating: Rating) => {
    const card = queue[currentIndex]
    if (!card || !isRevealed) return

    await reviewCard({ card, rating })
    setReviewedCount((count) => count + 1)
    setRatingCounts((counts) => ({ ...counts, [rating]: counts[rating] + 1 }))
    setIsRevealed(false)

    if (currentIndex + 1 >= queue.length) {
      if (deckId) {
        const nextQueue = await getStudyQueue(deckId)
        setQueue(nextQueue.cards)
        setQueueStats(nextQueue.stats)
        setCurrentIndex(0)
        setDone(nextQueue.cards.length === 0)
      } else {
        setDone(true)
      }
    } else {
      setCurrentIndex((index) => index + 1)
    }
  }, [currentIndex, deckId, isRevealed, queue])

  const resetSession = useCallback(() => {
    setCurrentIndex(0)
    setIsRevealed(false)
    setReviewedCount(0)
    setRatingCounts(emptyRatingCounts)
    setDone(queue.length === 0)
  }, [queue.length])

  const studyMoreToday = useCallback(async (amount = 10) => {
    if (!deckId) return
    await addTodayExtraNewCards(deckId, amount)
    await loadQueue()
  }, [deckId, loadQueue])

  return useMemo(() => ({
    queue,
    currentIndex,
    currentCard,
    isRevealed,
    reviewedCount,
    ratingCounts,
    loading,
    done,
    queueStats,
    reveal,
    answer,
    resetSession,
    studyMoreToday,
    reloadQueue: loadQueue,
  }), [answer, currentCard, currentIndex, done, isRevealed, loadQueue, loading, queue, queueStats, ratingCounts, reveal, resetSession, reviewedCount, studyMoreToday])
}
