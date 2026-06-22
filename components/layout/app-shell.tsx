'use client'

import type { ReactNode } from 'react'
import { BarChart3, BookOpen, Download, GraduationCap, LayoutDashboard, Settings } from 'lucide-react'

import type { AppView } from '@/components/app/types'
import { cn } from '@/lib/utils'
import { useDecks } from '@/src/hooks/useDecks'

const navItems = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'study', label: 'Study', icon: GraduationCap },
  { view: 'decks', label: 'Decks', icon: BookOpen },
  { view: 'import', label: 'Import', icon: Download },
  { view: 'analytics', label: 'Analytics', icon: BarChart3 },
  { view: 'settings', label: 'Settings', icon: Settings },
] as const

const mobileNavItems = [
  { view: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { view: 'study', label: 'Study', icon: GraduationCap },
  { view: 'decks', label: 'Decks', icon: BookOpen },
  { view: 'settings', label: 'Settings', icon: Settings },
] as const

type AppShellProps = {
  currentView?: AppView
  onViewChange?: (view: AppView) => void
  children: ReactNode
}

export function AppShell({ currentView = 'dashboard', onViewChange = () => {}, children }: AppShellProps) {
  const decks = useDecks()
  const deckList = decks ?? []
  const totalCards = deckList.reduce((sum, deck) => sum + deck.cardCount, 0)

  return (
    <div className="flex h-dvh w-full max-w-full flex-col overflow-hidden bg-cream text-forest">
      <aside className="fixed left-0 top-0 hidden h-screen w-56 flex-col border-r bg-white lg:flex" style={{ borderColor: 'var(--border)' }}>
        <button type="button" onClick={() => onViewChange('dashboard')} className="flex items-center gap-2.5 border-b px-5 py-5 text-left" style={{ borderColor: 'var(--border)' }}>
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-lime">
            <span className="text-xs font-black text-forest">LM</span>
          </span>
          <span>
            <span className="block text-base font-extrabold text-forest">LinguaMemo</span>
            <span className="block text-[10px] font-medium leading-none text-muted-foreground">Local-first SRS</span>
          </span>
        </button>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = currentView === item.view
            const Icon = item.icon
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => onViewChange(item.view)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-all duration-150 hover:bg-cream hover:text-forest',
                  active && 'bg-forest text-white hover:bg-forest hover:text-white',
                )}
              >
                <Icon className="size-[17px]" />
                {item.label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-lime" />}
              </button>
            )
          })}
        </nav>

        <div className="px-3 pb-4">
          <div className="space-y-2 rounded-2xl p-3" style={{ background: 'var(--cream)' }}>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-lime text-[10px] font-black text-forest">{decks === undefined ? '…' : deckList.length}</div>
              <div>
                <p className="text-xs font-bold leading-none text-forest">Local decks</p>
                <p className="text-[10px] text-muted-foreground">Private local decks</p>
              </div>
              <BookOpen className="ml-auto size-[15px] text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Library</span>
              <span className="text-xs font-extrabold text-forest">{decks === undefined ? 'Loading…' : `${deckList.length} decks · ${totalCards} cards`}</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-h-0 flex-1 overflow-hidden lg:h-dvh lg:pl-56">
        <div className={cn(
          'h-full w-full max-w-full scrollbar-hide',
          currentView === 'study'
            ? 'overflow-hidden p-0'
            : 'overflow-y-auto px-4 pb-[calc(88px+env(safe-area-inset-bottom))] pt-4 sm:px-5 lg:p-6',
        )}>{children}</div>
      </main>

      {currentView !== 'study' && <MobileBottomNav currentView={currentView} onViewChange={onViewChange} />}
    </div>
  )
}

function MobileBottomNav({ currentView, onViewChange }: { currentView: AppView; onViewChange: (view: AppView) => void }) {
  const importActive = currentView === 'import'

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 h-[calc(72px+env(safe-area-inset-bottom))] border-t border-border bg-white px-4 pb-[env(safe-area-inset-bottom)] pt-3 shadow-[0_-10px_30px_rgba(23,55,44,0.08)] lg:hidden">
      <button
        type="button"
        onClick={() => onViewChange('import')}
        className="absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-2xl bg-lime text-forest shadow-lg shadow-forest/15"
        aria-label="Import"
      >
        <Download className="size-[22px]" />
      </button>

      <div className="grid grid-cols-5 items-end gap-1">
        {mobileNavItems.slice(0, 2).map((item) => (
          <MobileNavItem key={item.view} item={item} active={currentView === item.view} onViewChange={onViewChange} />
        ))}
        <button
          type="button"
          onClick={() => onViewChange('import')}
          aria-current={importActive ? 'page' : undefined}
          className={cn('flex min-w-[44px] flex-col items-center gap-0.5 text-[10px] font-medium', importActive ? 'font-bold text-forest' : 'text-muted-foreground')}
        >
          <span className="h-5" />
          Import
        </button>
        {mobileNavItems.slice(2).map((item) => (
          <MobileNavItem key={item.view} item={item} active={currentView === item.view} onViewChange={onViewChange} />
        ))}
      </div>
    </nav>
  )
}

function MobileNavItem({ item, active, onViewChange }: { item: (typeof mobileNavItems)[number]; active: boolean; onViewChange: (view: AppView) => void }) {
  const Icon = item.icon

  return (
    <button type="button" onClick={() => onViewChange(item.view)} aria-current={active ? 'page' : undefined} className="flex min-w-[44px] flex-col items-center gap-0.5">
      <Icon className={cn('size-5', active ? 'text-forest' : 'text-muted-foreground')} />
      <span className={cn('text-[10px] font-medium', active ? 'font-bold text-forest' : 'text-muted-foreground')}>
        {item.label}
      </span>
    </button>
  )
}
