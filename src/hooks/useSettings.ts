'use client'

import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '../db/db'
import { defaultSettings, getSettings, updateSettings } from '../db/settingsRepo'

export function useSettings() {
  useEffect(() => {
    void getSettings()
  }, [])

  const settings = useLiveQuery(() => db.settings.get('app-settings'), [], undefined)
  return { settings: settings ?? defaultSettings, updateSettings }
}
