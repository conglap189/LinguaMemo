'use client'

import { cn } from '@/lib/utils'

type DeckCountsProps = {
  total: number
  newCount: number
  learningCount: number
  dueCount: number
  className?: string
}

const countStyles = {
  total: 'bg-forest text-white border-forest/10',
  new: 'bg-lime text-forest border-lime/60',
  learning: 'bg-amber-100 text-amber-900 border-amber-200',
  due: 'bg-rose-100 text-rose-900 border-rose-200',
}

export function DeckCountPills({ total, newCount, learningCount, dueCount, className }: DeckCountsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <CountPill label="Total" value={total} className={countStyles.total} />
      <CountPill label="New" value={newCount} className={countStyles.new} />
      <CountPill label="Learning" value={learningCount} className={countStyles.learning} />
      <CountPill label="Due" value={dueCount} className={countStyles.due} />
    </div>
  )
}

export function DeckCountTiles({ total, newCount, learningCount, dueCount, className }: DeckCountsProps) {
  return (
    <div className={cn('grid gap-3 sm:grid-cols-4', className)}>
      <CountTile label="Total" value={total} className={countStyles.total} />
      <CountTile label="New" value={newCount} className={countStyles.new} />
      <CountTile label="Learning" value={learningCount} className={countStyles.learning} />
      <CountTile label="Due" value={dueCount} className={countStyles.due} />
    </div>
  )
}

function CountPill({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-extrabold shadow-sm', className)}>
      <span className="opacity-75">{label}</span>
      <span>{value.toLocaleString()}</span>
    </span>
  )
}

function CountTile({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className={cn('rounded-2xl border p-3 shadow-sm', className)}>
      <p className="text-xs font-bold opacity-75">{label}</p>
      <p className="mt-1 text-xl font-black">{value.toLocaleString()}</p>
    </div>
  )
}
