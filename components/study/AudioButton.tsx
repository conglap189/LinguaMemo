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
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false

    function clearPlayTimeout() {
      if (playTimeoutRef.current !== null) {
        window.clearTimeout(playTimeoutRef.current)
        playTimeoutRef.current = null
      }
    }

    cleanupRef.current()
    setStatus('loading')

    async function prepareAudio() {
      try {
        const media = await getMediaByFilename(deckId, filename)
        if (cancelled) return

        if (!media) {
          setStatus('missing')
          return
        }

        const audioMimeType = getPlayableAudioMimeType(filename, media.mimeType)
        if (!audioMimeType.startsWith('audio/')) {
          console.warn(`Media file is not marked as audio: ${filename} (${media.mimeType})`)
        }

        const blob = media.blob.type === audioMimeType ? media.blob : new Blob([media.blob], { type: audioMimeType })
        const url = URL.createObjectURL(blob)
        const audio = new Audio()

        audio.preload = 'auto'
        audio.src = url
        audio.setAttribute('playsinline', 'true')
        audio.setAttribute('webkit-playsinline', 'true')

        const cleanup = () => {
          clearPlayTimeout()
          audio.pause()
          audio.removeAttribute('src')
          audio.load()
          URL.revokeObjectURL(url)
          if (audioRef.current === audio) audioRef.current = null
          cleanupRef.current = () => {}
        }

        audio.addEventListener('ended', () => {
          clearPlayTimeout()
          audio.currentTime = 0
          setStatus('idle')
        })
        audio.addEventListener('error', () => {
          clearPlayTimeout()
          setStatus('error')
        })

        audioRef.current = audio
        cleanupRef.current = cleanup
        audio.load()
        setStatus('idle')
      } catch (error) {
        if (cancelled) return
        console.warn(`Could not prepare audio: ${filename}`, error)
        setStatus('error')
      }
    }

    void prepareAudio()

    return () => {
      cancelled = true
      cleanupRef.current()
    }
  }, [deckId, filename])

  async function playAudio(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    if (status === 'loading' || status === 'playing') return

    try {
      const audio = audioRef.current
      if (!audio) {
        setStatus(status === 'missing' ? 'missing' : 'error')
        return
      }

      if (playTimeoutRef.current !== null) {
        window.clearTimeout(playTimeoutRef.current)
        playTimeoutRef.current = null
      }

      audio.pause()
      audio.currentTime = 0
      setStatus('playing')

      playTimeoutRef.current = window.setTimeout(() => {
        audio.pause()
        audio.currentTime = 0
        playTimeoutRef.current = null
        setStatus('idle')
      }, 120_000)

      await audio.play()
    } catch (error) {
      console.warn(`Could not play audio: ${filename}`, error)
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

function getPlayableAudioMimeType(filename: string, storedMimeType: string) {
  const extension = filename.split('?')[0]?.split('#')[0]?.toLowerCase().split('.').pop()

  switch (extension) {
    case 'mp3':
      return 'audio/mpeg'
    case 'm4a':
    case 'mp4':
      return 'audio/mp4'
    case 'aac':
      return 'audio/aac'
    case 'wav':
      return 'audio/wav'
    case 'ogg':
      return 'audio/ogg'
    case '3gp':
    case '3gpp':
      return 'audio/3gpp'
    case '3g2':
      return 'audio/3gpp2'
    default:
      return storedMimeType.startsWith('audio/') ? storedMimeType : 'audio/mpeg'
  }
}
