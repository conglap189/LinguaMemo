'use client'

import { useRef, useState } from 'react'

import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { exportBackup } from '@/src/features/backup/exportBackup'
import { importBackup } from '@/src/features/backup/importBackup'

export function BackupRestore() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  async function handleExport() {
    setError(null)
    setMessage(null)
    setExporting(true)
    try {
      await exportBackup()
      setMessage('Backup created successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create backup.')
    } finally {
      setExporting(false)
    }
  }

  async function handleImport() {
    if (!pendingFile) return
    setError(null)
    setMessage(null)
    setImporting(true)
    try {
      const result = await importBackup(pendingFile, { mode: 'replace' })
      setMessage(`Restored ${result.decks} decks, ${result.cards} cards, ${result.reviews} reviews, ${result.media} media files.`)
      setPendingFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to restore backup.')
    } finally {
      setImporting(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <Card className="rounded-3xl border-0 bg-white shadow-sm">
      <CardHeader><CardTitle className="text-forest">Backup &amp; Recovery</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">Backups are created and restored locally in your browser.</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-2xl bg-white" onClick={() => void handleExport()} disabled={exporting || importing}>{exporting ? 'Creating backup...' : 'Export Backup'}</Button>
          <Button variant="outline" className="rounded-2xl bg-white" onClick={() => inputRef.current?.click()} disabled={exporting || importing}>{importing ? 'Restoring backup...' : 'Import Backup'}</Button>
          <input
            ref={inputRef}
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) setPendingFile(file)
            }}
          />
        </div>
        {message && <p className="text-sm font-medium text-forest">{message}</p>}
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      </CardContent>

      <ConfirmModal
        open={Boolean(pendingFile)}
        title="Restore backup?"
        description="Importing a backup will replace your current local data. Continue?"
        confirmLabel="Restore backup"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleImport}
        onCancel={() => {
          setPendingFile(null)
          if (inputRef.current) inputRef.current.value = ''
        }}
      />
    </Card>
  )
}
