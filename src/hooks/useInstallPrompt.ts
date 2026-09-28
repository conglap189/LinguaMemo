'use client'

import { useEffect, useState } from 'react'

type InstallPromptEvent = Event & {
  prompt: () => void | Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export type InstallEnvironment = 'ios' | 'desktop-safari' | 'browser' | 'unsupported'

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [environment, setEnvironment] = useState<InstallEnvironment>('unsupported')
  const [secureContext, setSecureContext] = useState(true)
  const [promptFailed, setPromptFailed] = useState(false)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    const iPadDesktopMode = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || iPadDesktopMode
    const safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    const desktopSafari = safari && /Macintosh|Mac OS X/i.test(navigator.userAgent) && !iPadDesktopMode
    const canPrompt = 'BeforeInstallPromptEvent' in window || 'onbeforeinstallprompt' in window

    setInstalled(standalone)
    setEnvironment(ios ? 'ios' : desktopSafari ? 'desktop-safari' : canPrompt ? 'browser' : 'unsupported')
    setSecureContext(window.isSecureContext || ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname))

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as InstallPromptEvent)
      setEnvironment('browser')
      setPromptFailed(false)
    }
    const handleAppInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  function promptInstall() {
    // Keep prompt() in the click call stack: browsers reject delayed prompts.
    if (!deferredPrompt) return false
    const promptEvent = deferredPrompt
    setDeferredPrompt(null)
    try {
      // Keep prompt() in the click call stack; only observe a returned rejection.
      const result = promptEvent.prompt()
      if (result && typeof result.then === 'function') void result.catch(() => setPromptFailed(true))
    } catch {
      setPromptFailed(true)
    }
    void promptEvent.userChoice
      .then(({ outcome }) => {
        if (outcome === 'accepted') setInstalled(true)
      })
      .catch(() => setPromptFailed(true))
    return true
  }

  function clearPromptFailure() {
    setPromptFailed(false)
  }

  return { installed, environment, secureContext, canPrompt: deferredPrompt !== null, promptInstall, promptFailed, clearPromptFailure }
}
