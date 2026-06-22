'use client'

import { BackupRestore } from '@/components/settings/BackupRestore'
import { ClearDataButton } from '@/components/settings/ClearDataButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSettings } from '@/src/hooks/useSettings'
import type { AppSettings } from '@/src/types/settings'

export function SettingsView() {
  const { settings, updateSettings } = useSettings()

  if (!settings) {
    return <div className="space-y-6 overflow-x-hidden bg-cream pb-[calc(88px+env(safe-area-inset-bottom))] lg:pb-0"><div><h1 className="text-3xl font-extrabold tracking-tight text-forest">Settings</h1><p className="mt-2 text-sm text-muted-foreground">Loading local settings…</p></div></div>
  }

  const persistNumber = (key: keyof Pick<AppSettings, 'dailyGoal' | 'newCardsPerDay' | 'reviewsPerDay' | 'requestedRetention' | 'maximumIntervalDays'>) => (value: string) => {
    const numeric = Number(value)
    if (!Number.isNaN(numeric)) void updateSettings({ [key]: numeric })
  }

  return (
    <div className="space-y-6 overflow-x-hidden bg-cream pb-[calc(88px+env(safe-area-inset-bottom))] lg:pb-0">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-forest">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tune LinguaMemo to your study rhythm.</p>
      </div>

      <Section title="Appearance">
        <Field label="Theme">
          <Select value={settings.theme} onValueChange={(theme: AppSettings['theme']) => void updateSettings({ theme })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem><SelectItem value="system">System</SelectItem></SelectContent>
          </Select>
        </Field>
      </Section>

      <Section title="Study Settings">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Daily goal"><Input type="number" value={settings.dailyGoal} onChange={(event) => persistNumber('dailyGoal')(event.target.value)} /></Field>
          <Field label="New cards per day"><Input type="number" value={settings.newCardsPerDay} onChange={(event) => persistNumber('newCardsPerDay')(event.target.value)} /></Field>
          <Field label="Reviews per day"><Input type="number" value={settings.reviewsPerDay} onChange={(event) => persistNumber('reviewsPerDay')(event.target.value)} /></Field>
        </div>
      </Section>

      <Section title="Spaced Repetition">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Algorithm">
            <Select value={settings.algorithm} onValueChange={(algorithm: AppSettings['algorithm']) => void updateSettings({ algorithm })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="simple">Simple SRS</SelectItem><SelectItem value="fsrs">FSRS</SelectItem></SelectContent>
            </Select>
          </Field>
          <Field label="Requested retention"><Input type="number" step="0.01" min="0" max="1" value={settings.requestedRetention} onChange={(event) => persistNumber('requestedRetention')(event.target.value)} /></Field>
          <Field label="Maximum interval days"><Input type="number" value={settings.maximumIntervalDays} onChange={(event) => persistNumber('maximumIntervalDays')(event.target.value)} /></Field>
        </div>
      </Section>

      <BackupRestore />
      <ClearDataButton />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card className="rounded-3xl border-0 bg-white shadow-sm"><CardHeader><CardTitle className="text-forest">{title}</CardTitle></CardHeader><CardContent>{children}</CardContent></Card>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>
}
