'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ConfirmModalProps = {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  requireText?: string
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function ConfirmModal({ open, title, description, confirmLabel, cancelLabel, destructive, requireText, onConfirm, onCancel }: ConfirmModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setConfirmText('')
      setLoading(false)
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !loading) onCancel()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [loading, onCancel, open])

  if (!open) return null

  const confirmDisabled = loading || (requireText ? confirmText !== requireText : false)

  async function handleConfirm() {
    if (confirmDisabled) return
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest/35 px-4" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <h2 id="confirm-modal-title" className="text-xl font-extrabold text-forest">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>

        {requireText && (
          <div className="mt-5 space-y-2">
            <p className="text-sm text-muted-foreground">Type <span className="font-bold text-forest">{requireText}</span> to confirm.</p>
            <Input value={confirmText} onChange={(event) => setConfirmText(event.target.value)} disabled={loading} autoFocus />
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" className="rounded-2xl bg-white" onClick={onCancel} disabled={loading}>{cancelLabel ?? 'Cancel'}</Button>
          <Button variant={destructive ? 'destructive' : 'default'} className={destructive ? 'rounded-2xl' : 'rounded-2xl bg-forest hover:bg-forest-dark'} onClick={() => void handleConfirm()} disabled={confirmDisabled}>
            {loading ? 'Working…' : confirmLabel ?? 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  )
}
