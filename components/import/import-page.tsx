'use client'

import { useRef, useState, type DragEvent } from 'react'
import { CheckCircle2, FileUp, Loader2, ShieldCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StarterDeckSection } from '@/components/starter-decks/StarterDeckSection'
import type { AppView } from '@/components/app/types'
import { importApkg } from '@/src/features/import-apkg/importApkg'
import type { ImportApkgResult, ImportStatus } from '@/src/features/import-apkg/types'
import { LAST_DECK_ID_STORAGE_KEY } from '@/src/features/study/resolveStudyDeckId'
import { hasApkgExtension } from '@/src/lib/fileUtils'
import { useDecks } from '@/src/hooks/useDecks'

type ImportPageProps = {
  onViewChange?: (view: AppView) => void
  onStudyDeck?: (deckId: string) => void
}

const statusLabels: Record<ImportStatus['step'], string> = {
  'reading-package': 'Reading package',
  'extracting-database': 'Extracting database',
  'parsing-notes': 'Parsing notes',
  'extracting-media': 'Extracting media',
  'creating-cards': 'Creating cards',
  done: 'Done',
}

export function ImportPage({ onViewChange, onStudyDeck }: ImportPageProps) {
  const decks = useDecks()
  const deckList = decks ?? []
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [status, setStatus] = useState<ImportStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportApkgResult | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return

    setError(null)
    setResult(null)
    setStatus(null)

    if (!hasApkgExtension(file.name)) {
      setError('Please choose a valid .apkg file.')
      return
    }

    setIsImporting(true)
    try {
      const importResult = await importApkg(file, { onStatus: setStatus })
      localStorage.setItem(LAST_DECK_ID_STORAGE_KEY, importResult.deckId)
      setResult(importResult)
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'Import failed. Please try another .apkg file.')
    } finally {
      setIsImporting(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    void handleFile(event.dataTransfer.files[0])
  }

  return (
    <div className="space-y-6 overflow-x-hidden bg-cream pb-[calc(88px+env(safe-area-inset-bottom))] lg:pb-0">
      <div><h1 className="text-3xl font-extrabold tracking-tight text-forest">Import</h1><p className="mt-2 text-sm text-muted-foreground">Bring your Anki deck into a private browser-first workspace.</p></div>
      <Card className="rounded-3xl border-0 bg-white shadow-sm">
        <CardContent className="p-6 md:p-10">
          <div
            className={`flex min-h-[300px] flex-col items-center justify-center rounded-[2rem] border-2 border-dashed p-5 text-center transition sm:min-h-[360px] sm:p-8 ${isDragging ? 'border-forest bg-forest/5' : 'border-forest/20 bg-cream'}`}
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input ref={inputRef} type="file" accept=".apkg" className="hidden" onChange={(event) => void handleFile(event.target.files?.[0])} />
            <div className="mb-6 rounded-3xl bg-white p-5 text-forest shadow-sm">{isImporting ? <Loader2 className="size-10 animate-spin" /> : <FileUp className="size-10" />}</div>
            <h2 className="text-2xl font-extrabold text-forest sm:text-3xl">Drop your .apkg file here</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">Your deck is processed locally in your browser.</p>
            <p className="mt-1 max-w-xl text-muted-foreground">No file is uploaded to any server.</p>
            <Button size="lg" className="mt-7 rounded-2xl bg-forest hover:bg-forest-dark" disabled={isImporting} onClick={() => inputRef.current?.click()}>
              {isImporting ? 'Importing...' : 'Choose File'}
            </Button>

            {status && (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {Object.entries(statusLabels).map(([step, label]) => {
                  const isActive = status.step === step
                  const isDone = status.step === 'done' || Object.keys(statusLabels).indexOf(step) < Object.keys(statusLabels).indexOf(status.step)
                  return <Badge key={step} variant={isActive || isDone ? 'default' : 'outline'} className={isActive || isDone ? 'bg-forest' : 'border-forest/20 text-forest'}>{label}</Badge>
                })}
              </div>
            )}

            {error && <p className="mt-5 max-w-xl rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
            {result && (
              <div className="mt-6 space-y-4 rounded-3xl bg-white p-5 shadow-sm">
                <div className="text-center font-semibold text-forest">
                  <p className="flex items-center justify-center gap-2"><CheckCircle2 className="size-5" /> Imported {result.cardCount} cards into {result.deckName} deck.</p>
                  <p className="mt-1 text-sm text-muted-foreground">Imported {result.mediaCount} media files.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="outline" className="rounded-2xl border-forest/20 text-forest" onClick={() => onViewChange?.('dashboard')}>Go to Dashboard</Button>
                  <Button className="rounded-2xl bg-forest hover:bg-forest-dark" onClick={() => onStudyDeck?.(result.deckId)}>Study Now</Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-3xl border-0 bg-white shadow-sm">
        <CardContent className="p-5 md:p-6">
          <StarterDeckSection decks={deckList} compact />
        </CardContent>
      </Card>
      <div className="grid gap-5 md:grid-cols-2">
        <Capability title="Supported now" items={['Basic text cards', 'Audio/images', 'Anki .apkg', 'Local IndexedDB']} />
        <Capability title="Coming soon" items={['Cloze cards', 'Templates', 'Cloud sync']} muted />
      </div>
      <div className="flex items-center gap-3 rounded-3xl bg-white p-5 text-sm text-muted-foreground shadow-sm"><ShieldCheck className="size-5 text-forest" /> Browser-only import. Your .apkg is parsed locally and saved to IndexedDB.</div>
    </div>
  )
}

function Capability({ title, items, muted = false }: { title: string; items: string[]; muted?: boolean }) {
  return <Card className="rounded-3xl border-0 bg-white shadow-sm"><CardHeader><CardTitle className="text-forest">{title}</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{items.map((item) => <Badge key={item} variant={muted ? 'outline' : 'default'} className={muted ? 'border-forest/20 text-forest' : 'bg-forest'}>{item}</Badge>)}</CardContent></Card>
}
