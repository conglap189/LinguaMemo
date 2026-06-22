'use client'

import { useState } from 'react'

import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { clearAllLocalData, resetDemoData } from '@/src/db/dbMaintenance'

const clearDescription = 'This will permanently delete all decks, cards, reviews, media, and settings stored in this browser.'

export function ClearDataButton() {
  const [clearOpen, setClearOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleClear() {
    setError(null)
    setMessage(null)
    try {
      await clearAllLocalData()
      setMessage('Local data cleared.')
      setClearOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to clear local data.')
    }
  }

  async function handleResetDemo() {
    setError(null)
    setMessage(null)
    try {
      await resetDemoData()
      setMessage('Demo data reset.')
      setResetOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset demo data.')
    }
  }

  return (
    <Card className="rounded-3xl border-0 bg-white shadow-sm">
      <CardHeader><CardTitle className="text-forest">Data Management</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-2xl bg-white" onClick={() => setResetOpen(true)}>Reset Demo Data</Button>
          <Button variant="destructive" className="rounded-2xl" onClick={() => setClearOpen(true)}>Clear Local Data</Button>
        </div>
        {message && <p className="text-sm font-medium text-forest">{message}</p>}
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      </CardContent>

      <ConfirmModal open={clearOpen} title="Clear all local data?" description={clearDescription} confirmLabel="Clear data" cancelLabel="Cancel" destructive requireText="DELETE" onConfirm={handleClear} onCancel={() => setClearOpen(false)} />
      <ConfirmModal open={resetOpen} title="Reset demo data?" description="This will replace your current local data with the built-in demo decks." confirmLabel="Reset demo data" cancelLabel="Cancel" onConfirm={handleResetDemo} onCancel={() => setResetOpen(false)} />
    </Card>
  )
}
