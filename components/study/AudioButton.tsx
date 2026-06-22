'use client'

import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Play } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getMediaByFilename } from '@/src/db/mediaRepo'

type AudioButtonProps = {
  deckId: string
  filename: string
  index?: number
  total?: number
  variant?: 'inline' | 'block' | 'pill' | 'anki'
}

export function AudioButton({ deckId, filename, index = 1, total = 1, variant = 'inline' }: AudioButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'missing' | 'error'>('idle')
  const cleanupRef = useRef<() => void>(() => {})

  useEffect(() => () => cleanupRef.current(), [])

  async function playAudio(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    if (status === 'loading' || status === 'playing') return

    setStatus('loading')
    cleanupRef.current()

    try {
      const media = await getMediaByFilename(deckId, filename)
      if (!media) {
        setStatus('missing')
        return
      }

      if (!media.mimeType.startsWith('audio/')) {
        console.warn(`Media file is not marked as audio: ${filename} (${media.mimeType})`)
      }

      const url = URL.createObjectURL(media.blob)
      const audio = new Audio(url)
      const cleanup = () => {
        window.clearTimeout(timeout)
        audio.pause()
        URL.revokeObjectURL(url)
        cleanupRef.current = () => {}
      }

      const timeout = window.setTimeout(() => {
        cleanup()
        setStatus('idle')
      }, 120_000)

      cleanupRef.current = cleanup

      audio.addEventListener('ended', () => {
        cleanupRef.current()
        setStatus('idle')
      }, { once: true })
      audio.addEventListener('error', () => {
        cleanupRef.current()
        setStatus('error')
      }, { once: true })

      await audio.play()
      setStatus('playing')
    } catch (error) {
      console.warn(`Could not play audio: ${filename}`, error)
      cleanupRef.current()
      setStatus('error')
    }
  }

  const displayVariant = variant === 'pill' ? 'inline' : variant
  const disabled = status === 'loading' || status === 'playing' || status === 'missing'
  const baseLabel = displayVariant === 'inline' ? 'Play' : total > 1 ? `Play audio ${index}` : 'Play audio'
  const label = status === 'missing'
    ? 'Audio missing'
    : status === 'loading'
      ? 'Loading audio…'
      : status === 'playing'
        ? 'Playing audio…'
        : baseLabel

  if (displayVariant === 'anki') {
    return (
      <span className="anki-audio-button-wrap">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={playAudio}
          aria-label={label}
          title={status === 'idle' ? 'Play audio' : label}
          className={cn(
            'anki-audio-button',
            status === 'missing' && 'opacity-50',
            status === 'playing' && 'border-forest bg-lime/20 text-forest',
          )}
        >
          <Play className="size-5 fill-current" aria-hidden="true" />
        </Button>
        {status === 'error' && <span className="text-xs font-semibold text-red-600">Audio could not play</span>}
      </span>
    )
  }

  return (
    <span className={displayVariant === 'inline' ? 'mx-2 inline-flex flex-col items-start gap-1 align-middle' : 'inline-flex flex-col items-start gap-1 align-middle'}>
      <Button
        type="button"
        size={displayVariant === 'inline' ? 'sm' : 'lg'}
        variant="outline"
        disabled={disabled}
        onClick={playAudio}
        className={status === 'missing'
          ? displayVariant === 'inline'
            ? 'h-8 rounded-full border-forest/10 bg-cream-dark px-3 text-xs font-bold text-muted-foreground opacity-80'
            : 'h-11 rounded-full border-forest/10 bg-cream-dark px-5 text-sm font-bold text-muted-foreground opacity-80'
          : displayVariant === 'inline'
            ? 'h-8 rounded-full border-forest/20 bg-white px-3 text-xs font-extrabold text-forest shadow-sm hover:bg-cream hover:text-forest'
            : 'h-11 rounded-full border-forest/20 bg-white px-5 text-sm font-extrabold text-forest shadow-sm hover:bg-cream hover:text-forest'}
      >
        <span className={displayVariant === 'inline' ? 'mr-1 text-sm' : 'mr-2 text-base'} aria-hidden="true">🔊</span> {label}
      </Button>
      {status === 'error' && <span className="text-xs font-semibold text-red-600">Audio could not play</span>}
    </span>
  )
}
