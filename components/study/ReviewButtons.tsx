'use client'

import { Button } from '@/components/ui/button'
import { scheduleNextReview, type Rating } from '@/src/features/scheduler/simpleScheduler'
import type { Flashcard } from '@/src/types/card'

type ReviewButtonsProps = {
  card: Flashcard
  onAnswer: (rating: Rating) => void
}

const ratings: Array<{ rating: Rating; label: string }> = [
  { rating: 'again', label: 'Again' },
  { rating: 'hard', label: 'Hard' },
  { rating: 'good', label: 'Good' },
  { rating: 'easy', label: 'Easy' },
]

export function ReviewButtons({ card, onAnswer }: ReviewButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      {ratings.map((item) => {
        const preview = scheduleNextReview({
          rating: item.rating,
          card,
          intervalMinutes: card.intervalMinutes,
        })

        return (
          <Button
            key={item.rating}
            type="button"
            variant={item.rating === 'good' ? 'default' : 'outline'}
            className={item.rating === 'good'
              ? 'h-14 rounded-2xl bg-forest py-2 text-sm hover:bg-forest-dark sm:h-16 sm:text-base'
              : 'h-14 rounded-2xl bg-white py-2 text-sm font-bold text-forest sm:h-16 sm:text-base'}
            onClick={() => onAnswer(item.rating)}
          >
            <span className="flex flex-col items-center leading-tight">
              <span>{item.label}</span>
              <span className="mt-1 text-xs opacity-70">{preview.label}</span>
            </span>
          </Button>
        )
      })}
    </div>
  )
}
