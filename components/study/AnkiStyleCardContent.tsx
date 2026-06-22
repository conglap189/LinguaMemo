'use client'

import { useEffect, useMemo, useState } from 'react'

import { cn } from '@/lib/utils'
import { getMediaByFilename } from '@/src/db/mediaRepo'
import { normalizeAnkiHtml } from '@/src/lib/ankiHtmlUtils'

import { AudioButton } from './AudioButton'
import { SafeCardHtml } from './SafeCardHtml'

type AnkiStyleCardContentProps = {
  deckId: string
  fields: string[]
  side: 'front' | 'back'
  className?: string
}

type LanguageCardModel = {
  word: string
  pronunciation?: string
  partOfSpeech?: string
  definition?: string
  imageHtml?: string
  example?: string
  wordAudio?: string
  definitionAudio?: string
  exampleAudio?: string
}

type FieldKind = 'id' | 'audio' | 'image' | 'pronunciation' | 'partOfSpeech' | 'word' | 'definition' | 'example' | 'other'

type ClassifiedField = {
  raw: string
  text: string
  kind: FieldKind
  audio: string[]
}

const soundTokenPattern = /\[sound:([^\]]+)\]/gi
const partOfSpeechPattern = /^(?:n\.?|noun|v\.?|verb|adj\.?|adjective|adv\.?|adverb|phrase|prep\.?|preposition|conj\.?|conjunction|interj\.?|interjection|pronoun|article|determiner|auxiliary|modal)$/i

export function AnkiStyleCardContent({ deckId, fields, side, className }: AnkiStyleCardContentProps) {
  const model = useMemo(() => buildLanguageCardModel(fields), [fields])

  if (!model) return null

  if (side === 'front') {
    return (
      <div className={cn('anki-card-content anki-card-front', className)}>
        <div className="anki-word">
          <SafeCardHtml html={model.word} inline />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('anki-card-content', className)}>
      <section className="anki-section anki-top-section">
        <div className="anki-word"><SafeCardHtml html={model.word} inline /></div>
        {model.pronunciation && <div className="anki-pronunciation"><SafeCardHtml html={model.pronunciation} inline /></div>}
        {model.partOfSpeech && <div className="anki-pos"><SafeCardHtml html={model.partOfSpeech} inline /></div>}
        {model.wordAudio && <AudioButton deckId={deckId} filename={model.wordAudio} variant="anki" />}
      </section>

      <div className="anki-divider" />

      {model.definition && (
        <section className="anki-section">
          <div className="anki-definition"><SafeCardHtml html={model.definition} /></div>
          {model.definitionAudio && <AudioButton deckId={deckId} filename={model.definitionAudio} variant="anki" />}
        </section>
      )}

      {model.imageHtml && <AnkiImage deckId={deckId} html={model.imageHtml} />}

      {model.example && (
        <section className="anki-section">
          <div className="anki-example"><SafeCardHtml html={model.example} /></div>
          {model.exampleAudio && <AudioButton deckId={deckId} filename={model.exampleAudio} variant="anki" />}
        </section>
      )}
    </div>
  )
}

export function canRenderAsLanguageCard(fields: string[]) {
  return buildLanguageCardModel(fields) !== null
}

export function getLanguageCardFront(fields: string[]) {
  return buildLanguageCardModel(fields)?.word ?? null
}

function buildLanguageCardModel(fields: string[]): LanguageCardModel | null {
  const classified = fields.map(classifyField).filter((field) => field.text || field.audio.length > 0 || field.kind === 'image')
  const useful = classified.filter((field) => field.kind !== 'id')
  const audioOnlyFields = useful.filter((field) => field.kind === 'audio')
  const textFields = useful.filter((field) => field.text && field.kind !== 'audio' && field.kind !== 'image')
  const imageField = useful.find((field) => field.kind === 'image')

  const wordField = textFields.find((field) => field.kind === 'word') ?? textFields.find((field) => isWordLike(field.text))
  if (!wordField) return null

  const pronunciationField = textFields.find((field) => field !== wordField && field.kind === 'pronunciation')
  const partOfSpeechField = textFields.find((field) => field !== wordField && field.kind === 'partOfSpeech')
  const definitionField = textFields.find((field) => ![wordField, pronunciationField, partOfSpeechField].includes(field) && field.kind === 'definition')
  const exampleField = textFields.find((field) => ![wordField, pronunciationField, partOfSpeechField, definitionField].includes(field) && field.kind === 'example')
  const distributedAudio = distributeAudio(audioOnlyFields.flatMap((field) => field.audio), {
    wordAudio: firstAudio(wordField, pronunciationField, partOfSpeechField),
    definitionAudio: firstAudio(definitionField),
    exampleAudio: firstAudio(exampleField),
  })

  const languageSignals = [
    pronunciationField,
    partOfSpeechField,
    definitionField,
    imageField,
    exampleField,
    distributedAudio.wordAudio || distributedAudio.definitionAudio || distributedAudio.exampleAudio,
  ].filter(Boolean).length
  if (languageSignals < 2) return null

  return {
    word: wordField.text,
    pronunciation: pronunciationField?.text,
    partOfSpeech: partOfSpeechField?.text,
    definition: definitionField?.text ?? textFields.find((field) => ![wordField, pronunciationField, partOfSpeechField, exampleField].includes(field))?.text,
    imageHtml: imageField?.raw,
    example: exampleField?.text,
    ...distributedAudio,
  }
}

function firstAudio(...fields: Array<ClassifiedField | undefined>) {
  return fields.flatMap((field) => field?.audio ?? [])[0]
}

function distributeAudio(audioFields: string[], assigned: Pick<LanguageCardModel, 'wordAudio' | 'definitionAudio' | 'exampleAudio'>) {
  const next = { ...assigned }
  const slots: Array<keyof typeof next> = ['wordAudio', 'definitionAudio', 'exampleAudio']
  let audioIndex = 0

  for (const slot of slots) {
    if (next[slot]) continue
    const audio = audioFields[audioIndex]
    if (!audio) break
    next[slot] = audio
    audioIndex += 1
  }

  return next
}

function classifyField(rawValue: string): ClassifiedField {
  const raw = normalizeAnkiHtml(rawValue.trim())
  const audio = extractSoundRefs(raw)
  const withoutAudio = raw.replace(soundTokenPattern, '').trim()
  const text = stripHtml(withoutAudio).trim()

  if (!raw) return { raw, text: '', kind: 'other', audio }
  if (isLikelyIdField(text)) return { raw, text, kind: 'id', audio }
  if (audio.length > 0 && !text && !hasImage(raw)) return { raw, text, kind: 'audio', audio }
  if (hasImage(raw)) return { raw, text, kind: 'image', audio }
  if (isPronunciationLike(text)) return { raw, text, kind: 'pronunciation', audio }
  if (isPartOfSpeech(text)) return { raw, text, kind: 'partOfSpeech', audio }
  if (isExampleLike(text)) return { raw, text, kind: 'example', audio }
  if (isDefinitionLike(text)) return { raw, text, kind: 'definition', audio }
  if (isWordLike(text)) return { raw, text, kind: 'word', audio }
  return { raw, text, kind: 'other', audio }
}

function AnkiImage({ deckId, html }: { deckId: string; html: string }) {
  const [preparedHtml, setPreparedHtml] = useState('')

  useEffect(() => {
    let cancelled = false
    const objectUrls: string[] = []
    setPreparedHtml('')

    async function prepareImage() {
      if (typeof DOMParser === 'undefined') {
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

        if (!media || !media.mimeType.startsWith('image/')) continue

        const objectUrl = URL.createObjectURL(media.blob)
        objectUrls.push(objectUrl)
        image.setAttribute('src', objectUrl)
      }

      if (!cancelled) setPreparedHtml(container.innerHTML)
    }

    void prepareImage()

    return () => {
      cancelled = true
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [deckId, html])

  return <SafeCardHtml html={preparedHtml || html} className="anki-image" />
}

function extractSoundRefs(value: string) {
  const refs: string[] = []
  for (const match of value.matchAll(soundTokenPattern)) {
    const filename = match[1]?.trim()
    if (filename) refs.push(filename)
  }
  return refs
}

function isLikelyIdField(text: string) {
  if (!text) return false
  if (/^[A-Z0-9]+(?:_[A-Z0-9]+)+$/.test(text) && /\d/.test(text)) return true
  if (/^[A-Z]{2,}\d+[A-Z0-9_-]*$/.test(text)) return true
  const codeChars = (text.match(/[A-Z0-9_-]/gi) ?? []).length
  const uppercase = (text.match(/[A-Z]/g) ?? []).length
  const letters = (text.match(/[A-Za-z]/g) ?? []).length
  const hasStrongCodeSeparator = /_/.test(text) || /\d/.test(text)
  return text.length >= 8 && hasStrongCodeSeparator && codeChars / text.length > 0.82 && letters > 0 && uppercase / letters > 0.65
}

function isWordLike(text: string) {
  if (!text || isLikelyIdField(text) || isPronunciationLike(text) || isPartOfSpeech(text)) return false
  const words = text.split(/\s+/).filter(Boolean)
  return words.length >= 1 && words.length <= 4 && text.length <= 48 && !/[.!?]$/.test(text)
}

function isPronunciationLike(text: string) {
  if (!text) return false
  return /^[/\[].+[/\]]$/.test(text) || /[ˈˌəɜɔɑæʊɪɛʃʒθðŋɒʌː]/i.test(text)
}

function isPartOfSpeech(text: string) {
  return partOfSpeechPattern.test(text.trim())
}

function isDefinitionLike(text: string) {
  if (!text || isPronunciationLike(text) || isPartOfSpeech(text)) return false
  const words = text.split(/\s+/).filter(Boolean)
  return /^to\s+/i.test(text) || words.length >= 4
}

function isExampleLike(text: string) {
  if (!text) return false
  const words = text.split(/\s+/).filter(Boolean)
  return words.length >= 3 && /[.!?]$/.test(text)
}

function hasImage(value: string) {
  return /<\s*img\b/i.test(value)
}

function isLocalMediaReference(src: string) {
  const normalized = src.toLowerCase().trim()
  if (!normalized) return false
  if (/^(?:https?:|data:|blob:|javascript:|mailto:|tel:)/i.test(normalized)) return false
  return true
}

function stripHtml(value: string) {
  if (typeof document !== 'undefined') {
    const element = document.createElement('div')
    element.innerHTML = value
    return (element.textContent ?? '').replace(/\s+/g, ' ')
  }

  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
}
