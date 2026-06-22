'use client'

import { BarChart3, CalendarClock, Flame, Target } from 'lucide-react'

import { useStats } from '@/src/hooks/useStats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function AnalyticsPage() {
  const stats = useStats()
  const activity = stats.activity.map((day) => ({
    ...day,
    reviewed: sanitizeChartValue(day.reviewed),
  }))
  const maxActivityValue = Math.max(0, ...activity.map((day) => day.reviewed))

  return (
    <div className="space-y-6 overflow-x-hidden bg-cream pb-[calc(88px+env(safe-area-inset-bottom))] lg:pb-0">
      <div><h1 className="text-3xl font-extrabold tracking-tight text-forest">Analytics</h1><p className="mt-2 text-sm text-muted-foreground">A preview of your learning momentum and review load.</p></div>
      <div className="grid gap-4 md:grid-cols-4"><Stat icon={BarChart3} label="Cards reviewed" value={stats.reviewed} /><Stat icon={Target} label="Accuracy" value={`${stats.accuracy}%`} /><Stat icon={Flame} label="Streak" value={`${stats.studyStreak} days`} /><Stat icon={CalendarClock} label="Due forecast" value={`${stats.dueToday} cards`} /></div>
      <Card className="overflow-hidden rounded-3xl border-0 bg-white shadow-sm">
        <CardHeader><CardTitle className="text-forest">Study activity</CardTitle></CardHeader>
        <CardContent>
          <div className="flex h-[180px] max-h-[180px] items-end gap-3 overflow-hidden rounded-[2rem] bg-cream p-4 sm:h-[260px] sm:max-h-[260px] sm:p-6">
            {activity.map((day) => {
              const barHeightPercent = maxActivityValue > 0 ? (day.reviewed / maxActivityValue) * 100 : 0
              const clampedPercent = Math.min(100, Math.max(0, barHeightPercent))

              return (
                <div key={day.day} className="flex h-full flex-1 flex-col items-center gap-3">
                  <div className="flex min-h-0 w-full flex-1 items-end overflow-hidden">
                    <div className="w-full rounded-t-2xl bg-gradient-to-t from-forest to-lime" style={{ height: `${clampedPercent}%` }} />
                  </div>
                  <span className="shrink-0 text-xs font-bold text-muted-foreground">{day.day}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-3xl border-0 bg-white shadow-sm"><CardHeader><CardTitle className="text-forest">Due forecast</CardTitle></CardHeader><CardContent className="space-y-4">{stats.dueForecast.map((item) => <div key={item.label}><div className="mb-2 flex justify-between text-sm"><span>{item.label}</span><span className="font-bold text-forest">{item.cards} cards</span></div><Progress value={item.progress} /></div>)}</CardContent></Card>
    </div>
  )
}

function sanitizeChartValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return <Card className="rounded-3xl border-0 bg-white shadow-sm"><CardContent className="flex items-center gap-4 pt-0"><div className="rounded-2xl bg-cream p-3 text-forest"><Icon className="size-5" /></div><div><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-extrabold text-forest">{value}</p></div></CardContent></Card>
}
