'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Rating } from '@/src/features/scheduler/simpleScheduler'

type StudySummaryProps = {
  reviewedCount: number
  ratingCounts: Record<Rating, number>
  onBackToDashboard?: () => void
  onStudyAnotherDeck?: () => void
}

export function StudySummary({ reviewedCount, ratingCounts, onBackToDashboard, onStudyAnotherDeck }: StudySummaryProps) {
  return (
    <div className="mx-auto max-w-5xl bg-cream">
      <Card className="rounded-3xl border-0 bg-white shadow-sm">
        <CardContent className="space-y-6 py-12 text-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Study complete</p>
            <h1 className="mt-2 text-3xl font-extrabold text-forest">Done for today</h1>
            <p className="mt-2 text-muted-foreground">Reviewed cards: <span className="font-bold text-forest">{reviewedCount}</span></p>
          </div>
          <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Again" value={ratingCounts.again} />
            <Metric label="Hard" value={ratingCounts.hard} />
            <Metric label="Good" value={ratingCounts.good} />
            <Metric label="Easy" value={ratingCounts.easy} />
          </div>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" onClick={onBackToDashboard} className="rounded-2xl bg-forest hover:bg-forest-dark">Back to Dashboard</Button>
            <Button type="button" variant="outline" onClick={onStudyAnotherDeck} className="rounded-2xl bg-white">Study another deck</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl bg-cream p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-extrabold text-forest">{value}</p></div>
}
