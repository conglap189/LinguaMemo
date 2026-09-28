'use client'

import { useState } from 'react'

import { AnalyticsPage } from '@/components/analytics/analytics-page'
import { DashboardPage } from '@/components/dashboard/dashboard-page'
import { DecksPage } from '@/components/decks/decks-page'
import { ImportPage } from '@/components/import/import-page'
import { AppShell } from '@/components/layout/app-shell'
import { SettingsPage } from '@/components/settings/settings-page'
import type { AppView } from '@/components/app/types'
import { LAST_DECK_ID_STORAGE_KEY, resolveStudyDeckId } from '@/src/features/study/resolveStudyDeckId'
import { useAppStartup } from '@/src/hooks/useAppStartup'
import { useDecks } from '@/src/hooks/useDecks'
import { useInstallPrompt } from '@/src/hooks/useInstallPrompt'
import { StudyView } from '@/src/views/StudyView'

export function LinguaMemoApp() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard')
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null)
  const [manageDeckId, setManageDeckId] = useState<string | null>(null)
  const decks = useDecks()
  const deckList = decks ?? []
  const install = useInstallPrompt()
  useAppStartup()

  function handleViewChange(view: AppView) {
    if (view === 'study') {
      const deckId = resolveStudyDeckId({
        selectedDeckId,
        decks: deckList,
        lastDeckId: typeof window === 'undefined' ? null : localStorage.getItem(LAST_DECK_ID_STORAGE_KEY),
      })
      setSelectedDeckId(deckId)
      if (deckId) localStorage.setItem(LAST_DECK_ID_STORAGE_KEY, deckId)
      setCurrentView('study')
      return
    }

    setCurrentView(view)
    setSelectedDeckId(null)
  }

  function handleStudyDeck(deckId: string) {
    setSelectedDeckId(deckId)
    localStorage.setItem(LAST_DECK_ID_STORAGE_KEY, deckId)
    setCurrentView('study')
  }

  function handleManageDeck(deckId: string) {
    setManageDeckId(deckId)
    setCurrentView('dashboard')
  }

  return (
    <AppShell currentView={currentView} onViewChange={handleViewChange}>
      {currentView === 'dashboard' && <DashboardPage install={install} onViewChange={handleViewChange} onStudyDeck={handleStudyDeck} initialManageDeckId={manageDeckId} onManageDeckClosed={() => setManageDeckId(null)} />}
      {currentView === 'study' && <StudyView deckId={selectedDeckId} onSelectDeck={setSelectedDeckId} onViewChange={handleViewChange} onManageDeck={handleManageDeck} />}
      {currentView === 'decks' && <DecksPage onStudyDeck={handleStudyDeck} />}
      {currentView === 'import' && <ImportPage onViewChange={handleViewChange} onStudyDeck={handleStudyDeck} />}
      {currentView === 'analytics' && <AnalyticsPage />}
      {currentView === 'settings' && <SettingsPage />}
    </AppShell>
  )
}
