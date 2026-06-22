'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'

import { useDecks } from '@/src/hooks/useDecks'
import { DeckCountTiles } from '@/components/decks/deck-counts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type DecksPageProps = {
  onStudyDeck?: (deckId: string) => void
}

export function DecksPage({ onStudyDeck }: DecksPageProps = {}) {
  const decks = useDecks()
  const deckList = decks ?? []
  const [query, setQuery] = useState('')
  const [language, setLanguage] = useState('all')
  const languages = ['all', ...Array.from(new Set(deckList.map((deck) => deck.language).filter((item): item is string => Boolean(item))))]
  const filteredDecks = useMemo(() => deckList.filter((deck) => {
    const matchesQuery = `${deck.name} ${deck.description} ${deck.language}`.toLowerCase().includes(query.toLowerCase())
    const matchesLanguage = language === 'all' || deck.language === language
    return matchesQuery && matchesLanguage
  }), [deckList, query, language])

  return (
    <div className="space-y-6 overflow-x-hidden bg-cream pb-[calc(88px+env(safe-area-inset-bottom))] lg:pb-0">
      <div><h1 className="text-3xl font-extrabold tracking-tight text-forest">All decks</h1><p className="mt-2 text-sm text-muted-foreground">Search, filter, and manage your local study collection.</p></div>
      <div className="flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-sm md:flex-row">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search decks" className="pl-9" /></div>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-full md:w-56"><SelectValue placeholder="Language" /></SelectTrigger>
          <SelectContent>{languages.map((item) => <SelectItem key={item} value={item}>{item === 'all' ? 'All languages' : item}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {decks === undefined ? (
        <Card className="rounded-3xl border-dashed border-forest/20 bg-white"><CardContent className="py-16 text-center"><h2 className="text-2xl font-bold text-forest">Loading local library...</h2><p className="mt-2 text-muted-foreground">Reading decks from IndexedDB.</p></CardContent></Card>
      ) : filteredDecks.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-forest/20 bg-white"><CardContent className="py-16 text-center"><h2 className="text-2xl font-bold text-forest">No decks found</h2><p className="mt-2 text-muted-foreground">Try another search or language filter.</p></CardContent></Card>
      ) : (
        <div className="grid gap-5">
          {filteredDecks.map((deck) => (
            <Card key={deck.id} className="rounded-3xl border-0 bg-white shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div><CardTitle className="text-2xl text-forest">{deck.name}</CardTitle><p className="mt-2 max-w-3xl text-muted-foreground">{deck.description}</p></div>
                  <div className="flex gap-2"><Badge className="bg-lime text-forest hover:bg-lime">{deck.language ?? 'Language'}</Badge><Badge variant="outline" className="border-forest/20 text-forest">{deck.source}</Badge></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <DeckCountTiles total={deck.cardCount} newCount={deck.newAvailableCount ?? deck.newCount} learningCount={deck.learningCount ?? 0} dueCount={deck.dueCount} />
                <div><div className="mb-2 flex justify-between text-sm"><span className="font-medium text-slate-600">Progress</span><span className="font-bold">{deck.progress}%</span></div><Progress value={deck.progress} /></div>
                <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2"><Badge variant="outline" className="bg-cream">{deck.source}</Badge></div><div className="flex gap-2"><Button type="button" onClick={() => onStudyDeck?.(deck.id)} className="rounded-2xl bg-forest hover:bg-forest-dark">Study</Button><Button variant="outline" className="rounded-2xl bg-white">Manage</Button></div></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
