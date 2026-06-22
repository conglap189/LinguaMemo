import { formatInterval } from './formatInterval'
import { normalizeCardState } from '@/src/lib/cardState'
import type { CardState, Flashcard } from '@/src/types/card'

export type Rating = 'again' | 'hard' | 'good' | 'easy'

export type ScheduleInput = {
  rating: Rating
  card?: Partial<Flashcard>
  state?: CardState
  learningStep?: number
  lapseCount?: number
  isNew?: boolean
  reviewCount?: number
  intervalMinutes?: number
  now?: Date | string | number
}

export type ScheduleResult = {
  rating: Rating
  intervalMinutes: number
  dueAt: string
  label: string
  state: CardState
  learningStep: number
  lapseCount: number
}

const minute = 60_000
const maxIntervalMinutes = 365 * 24 * 60

function toDate(input: ScheduleInput['now']) {
  return input === undefined ? new Date() : new Date(input)
}

function clampInterval(minutes: number) {
  return Math.min(maxIntervalMinutes, Math.max(1, Math.round(minutes)))
}

export function scheduleNextReview(input: ScheduleInput): ScheduleResult {
  const rating = input.rating
  const state = input.state ?? (input.card ? normalizeCardState(input.card) : (input.isNew === true || (input.reviewCount ?? 0) === 0 ? 'new' : 'review'))
  const learningStep = input.learningStep ?? input.card?.learningStep ?? 0
  const lapseCount = input.lapseCount ?? input.card?.lapseCount ?? 0
  const current = Math.max(0, input.intervalMinutes ?? 0)
  let nextInterval: number
  let nextState: CardState = state
  let nextLearningStep = learningStep
  let nextLapseCount = lapseCount

  if (state === 'new') {
    nextInterval = rating === 'again' ? 1 : rating === 'hard' ? 6 : rating === 'good' ? 10 : 4 * 24 * 60
    nextState = rating === 'easy' ? 'review' : 'learning'
    nextLearningStep = rating === 'again' ? 0 : rating === 'hard' ? 1 : rating === 'good' ? 2 : 0
  } else if (state === 'learning') {
    if (rating === 'again') {
      nextInterval = 1
      nextLearningStep = 0
    } else if (rating === 'hard') {
      nextInterval = 6
      nextLearningStep = Math.max(learningStep, 1)
    } else if (rating === 'good') {
      if (learningStep >= 2) {
        nextInterval = 24 * 60
        nextState = 'review'
        nextLearningStep = 0
      } else {
        nextLearningStep = learningStep + 1
        nextInterval = nextLearningStep === 1 ? 6 : 10
      }
    } else {
      nextInterval = 4 * 24 * 60
      nextState = 'review'
      nextLearningStep = 0
    }
  } else {
    nextInterval = rating === 'again'
      ? 5
      : rating === 'hard'
        ? Math.max(10, current * 1.2)
        : rating === 'good'
          ? Math.max(30, current * 2.5)
          : Math.max(60, current * 3.5)
    if (rating === 'again') {
      nextState = 'learning'
      nextLearningStep = 0
      nextLapseCount = lapseCount + 1
    } else {
      nextState = 'review'
      nextLearningStep = 0
    }
  }

  const intervalMinutes = clampInterval(nextInterval)
  const now = toDate(input.now)
  const dueAt = new Date(now.getTime() + intervalMinutes * minute).toISOString()

  return {
    rating,
    intervalMinutes,
    dueAt,
    label: formatInterval(intervalMinutes),
    state: nextState,
    learningStep: nextLearningStep,
    lapseCount: nextLapseCount,
  }
}
