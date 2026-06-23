'use client'

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
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
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'missing' | 'unsupported' | 'error'>('idle')
  const cleanupRef = useRef<() => void>(() => {})
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioBlobRef = useRef<Blob | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const playTimeoutRef = useRef<number | null>(null)

  function clearPlayTimeout() {
    if (playTimeoutRef.current !== null) {
      window.clearTimeout(playTimeoutRef.current)
      playTimeoutRef.current = null
    }
  }

  function revokeCurrentObjectUrl() {
    if (!objectUrlRef.current) return
    URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = null
  }

  useEffect(() => {
    let cancelled = false
    const audio = audioRef.current

    cleanupRef.current()
    audioBlobRef.current = null
    if (!audio) return
    const audioElement = audio
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

        if (!canBrowserPlayAudioType(audioElement, audioMimeType)) {
          console.warn(`Audio format is not supported by this browser: ${filename} (${audioMimeType})`)
          setStatus('unsupported')
          return
        }

        const blob = media.blob.type === audioMimeType ? media.blob : new Blob([media.blob], { type: audioMimeType })
        audioBlobRef.current = blob

        audioElement.preload = 'auto'
        audioElement.removeAttribute('src')
        audioElement.setAttribute('playsinline', 'true')
        audioElement.setAttribute('webkit-playsinline', 'true')

        const cleanup = () => {
          clearPlayTimeout()
          audioElement.pause()
          audioElement.removeAttribute('src')
          audioElement.load()
          revokeCurrentObjectUrl()
          audioBlobRef.current = null
          cleanupRef.current = () => {}
        }

        cleanupRef.current = cleanup
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

  function handleAudioEnded() {
    clearPlayTimeout()
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.removeAttribute('src')
      audioRef.current.load()
    }
    revokeCurrentObjectUrl()
    setStatus('idle')
  }

  function handleAudioError() {
    clearPlayTimeout()
    revokeCurrentObjectUrl()
    setStatus('error')
  }

  async function playAudio(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    if (status === 'loading' || status === 'playing') return

    try {
      const audio = audioRef.current
      if (!audio) {
        setStatus(status === 'missing' ? 'missing' : 'error')
        return
      }

      const blob = audioBlobRef.current
      if (!blob) {
        setStatus(status === 'missing' ? 'missing' : 'error')
        return
      }

      if (playTimeoutRef.current !== null) {
        window.clearTimeout(playTimeoutRef.current)
        playTimeoutRef.current = null
      }

      audio.pause()
      audio.currentTime = 0
      revokeCurrentObjectUrl()
      const url = URL.createObjectURL(blob)
      objectUrlRef.current = url
      audio.src = url
      audio.load()
      setStatus('playing')

      playTimeoutRef.current = window.setTimeout(() => {
        audio.pause()
        audio.currentTime = 0
        audio.removeAttribute('src')
        audio.load()
        revokeCurrentObjectUrl()
        playTimeoutRef.current = null
        setStatus('idle')
      }, 120_000)

      await audio.play()
    } catch (error) {
      console.warn(`Could not play audio: ${filename}`, error)
      revokeCurrentObjectUrl()
      setStatus('error')
    }
  }

  const displayVariant = variant === 'pill' ? 'inline' : variant
  const disabled = status === 'loading' || status === 'playing' || status === 'missing' || status === 'unsupported'
  const baseLabel = displayVariant === 'inline' ? 'Play' : total > 1 ? `Play audio ${index}` : 'Play audio'
  const label = status === 'missing'
    ? 'Audio missing'
    : status === 'loading'
      ? 'Loading audio…'
      : status === 'playing'
        ? 'Playing audio…'
        : status === 'unsupported'
          ? 'Audio not supported on this browser'
          : baseLabel

  const audioElement = <audio ref={audioRef} preload="auto" playsInline style={hiddenPlayableAudioStyle} onEnded={handleAudioEnded} onError={handleAudioError} />

  if (displayVariant === 'anki') {
    return (
      <span className="anki-audio-button-wrap">
        {audioElement}
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
        {status === 'unsupported' && <span className="text-xs font-semibold text-red-600">Audio format is not supported in this browser</span>}
        {status === 'error' && <span className="text-xs font-semibold text-red-600">Audio could not play</span>}
      </span>
    )
  }

  return (
    <span className={displayVariant === 'inline' ? 'mx-2 inline-flex flex-col items-start gap-1 align-middle' : 'inline-flex flex-col items-start gap-1 align-middle'}>
      {audioElement}
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
      {status === 'unsupported' && <span className="text-xs font-semibold text-red-600">Audio format is not supported in this browser</span>}
      {status === 'error' && <span className="text-xs font-semibold text-red-600">Audio could not play</span>}
    </span>
  )
}

const hiddenPlayableAudioStyle: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  opacity: 0,
  pointerEvents: 'none',
}

function canBrowserPlayAudioType(audioElement: HTMLAudioElement, mimeType: string) {
  if (!mimeType.startsWith('audio/')) return true
  if (typeof audioElement.canPlayType !== 'function') return true
  return audioElement.canPlayType(mimeType) !== ''
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
      return 'audio/mp4'
    case '3g2':
      return 'audio/mp4'
    default:
      return storedMimeType.startsWith('audio/') ? storedMimeType : 'audio/mpeg'
  }
}
