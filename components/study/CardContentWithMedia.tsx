'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'

import { cn } from '@/lib/utils'
import { getMediaByFilename } from '@/src/db/mediaRepo'
import { normalizeAnkiHtml } from '@/src/lib/ankiHtmlUtils'

import { AudioButton } from './AudioButton'
import { SafeCardHtml } from './SafeCardHtml'

type CardContentWithMediaProps = {
  deckId: string
  html: string
  className?: string
  style?: CSSProperties
}

type ContentPart =
  | { type: 'html'; value: string; key: string }
  | { type: 'sound'; filename: string; key: string }

const soundTokenPattern = /\[sound:([^\]]+)\]/gi

export function CardContentWithMedia({ deckId, html, className, style }: CardContentWithMediaProps) {
  const normalizedHtml = useMemo(() => normalizeAnkiHtml(html), [html])
  const parts = useMemo(() => splitSoundTokens(normalizedHtml), [normalizedHtml])
  const soundCount = useMemo(() => parts.filter((part) => part.type === 'sound').length, [parts])

  if (parts.length === 0) {
    return <SafeCardHtml html="" className={className} />
  }

  let soundIndex = 0

  return (
    <div className={cn('study-media-content', className)} style={style}>
      {parts.map((part) => {
        if (part.type === 'sound') {
          soundIndex += 1
          return <AudioButton key={part.key} deckId={deckId} filename={part.filename} index={soundIndex} total={soundCount} variant="inline" />
        }

        return <HtmlChunkWithImages key={part.key} deckId={deckId} html={part.value} />
      })}
    </div>
  )
}

function HtmlChunkWithImages({ deckId, html }: { deckId: string; html: string }) {
  const [preparedHtml, setPreparedHtml] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const objectUrls: string[] = []
    setPreparedHtml(null)

    async function prepareImages() {
      if (!html || typeof DOMParser === 'undefined') {
        setPreparedHtml(html)
        return
      }

      const parser = new DOMParser()
      const document = parser.parseFromString(`<div>${html}</div>`, 'text/html')
      const container = document.body.firstElementChild
      if (!container) {
        setPreparedHtml(html)
        return
      }

      const images = Array.from(container.querySelectorAll('img'))
      for (const image of images) {
        const src = image.getAttribute('src')?.trim()
        if (!src || !isLocalMediaReference(src)) continue

        const media = await getMediaByFilename(deckId, src)
        if (cancelled) return

        if (!media || !media.mimeType.startsWith('image/')) {
          const placeholder = document.createElement('span')
          placeholder.className = 'inline-flex rounded-2xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700'
          placeholder.textContent = `Image not found: ${src}`
          image.replaceWith(placeholder)
          continue
        }

        const objectUrl = URL.createObjectURL(media.blob)
        objectUrls.push(objectUrl)
        image.setAttribute('src', objectUrl)
      }

      if (!cancelled) setPreparedHtml(container.innerHTML)
    }

    void prepareImages()

    return () => {
      cancelled = true
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [deckId, html])

  return <SafeCardHtml html={preparedHtml ?? ''} inline />
}

function splitSoundTokens(html: string): ContentPart[] {
  if (!html) return []

  const parts: ContentPart[] = []
  let lastIndex = 0
  let index = 0

  for (const match of html.matchAll(soundTokenPattern)) {
    const matchIndex = match.index ?? 0
    if (matchIndex > lastIndex) {
      parts.push({ type: 'html', value: html.slice(lastIndex, matchIndex), key: `html-${index++}` })
    }

    const filename = match[1]?.trim()
    if (filename) parts.push({ type: 'sound', filename, key: `sound-${index++}-${filename}` })
    lastIndex = matchIndex + match[0].length
  }

  if (lastIndex < html.length) {
    parts.push({ type: 'html', value: html.slice(lastIndex), key: `html-${index++}` })
  }

  return parts.length > 0 ? parts : [{ type: 'html', value: html, key: 'html-0' }]
}

function isLocalMediaReference(src: string) {
  const normalized = src.toLowerCase().trim()
  if (!normalized) return false
  if (/^(?:https?:|data:|blob:|javascript:|mailto:|tel:)/i.test(normalized)) return false
  return true
}
