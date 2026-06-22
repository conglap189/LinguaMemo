export type SelectedCardFields = {
  front: string
  back: string
}

export function selectCardFields(fields: string[]): SelectedCardFields {
  const normalizedFields = fields.map((field) => field.trim())
  const nonEmptyFields = normalizedFields.filter(Boolean)
  const front = chooseFrontField(nonEmptyFields) || normalizedFields[0] || 'No question field found'
  const frontComparable = normalizeComparable(front)

  const usefulBackFields = normalizedFields.filter((field) => {
    if (!field) return false
    if (isLikelyIdField(field)) return false
    if (normalizeComparable(field) === frontComparable) return false
    return true
  })

  return {
    front,
    back: usefulBackFields.length > 0 ? composeBackFields(usefulBackFields) : 'No answer field found',
  }
}

export function isLikelyIdField(value: string): boolean {
  const text = stripHtml(value).trim()
  if (!text) return false

  if (/^[A-Z0-9]+(_[A-Z0-9]+)+$/i.test(text)) return true
  if (/^[\w.-]+\.(?:mp3|wav|ogg|m4a|aac|jpg|jpeg|png|gif|webp|svg|html?|css|js|json)$/i.test(text)) return true
  if (/^[A-Z]{2,}\d+[A-Z0-9_-]*$/i.test(text)) return true

  const codeCharacters = (text.match(/[A-Z0-9_\-.]/gi) ?? []).length
  const separators = (text.match(/[_\-.]/g) ?? []).length
  const alphaNumeric = (text.match(/[A-Z0-9]/gi) ?? []).length
  const uppercase = (text.match(/[A-Z]/g) ?? []).length
  const letters = (text.match(/[A-Za-z]/g) ?? []).length
  const mostlyCodeCharacters = codeCharacters / Math.max(text.length, 1) > 0.82
  const mostlyUppercase = letters > 0 && uppercase / letters > 0.72

  return text.length >= 8 && separators > 0 && alphaNumeric >= 6 && mostlyCodeCharacters && mostlyUppercase
}

function chooseFrontField(fields: string[]) {
  const nonIdFields = fields.filter((field) => !isLikelyIdField(field))
  const preferred = nonIdFields.find((field) => isShortVocabularyLikeField(field))
  if (preferred) return preferred
  return nonIdFields[0] ?? fields[0]
}

function isShortVocabularyLikeField(value: string): boolean {
  const text = stripHtml(value).replace(soundTokenPattern, '').trim()
  if (!text) return false
  if (hasMediaMarkup(value)) return false
  if (isLikelyIdField(text)) return false

  const words = text.split(/\s+/).filter(Boolean)
  if (words.length < 1 || words.length > 4) return false
  if (text.length > 48) return false
  if (/[.!?]\s*$/.test(text) && words.length > 2) return false
  return true
}

const soundTokenPattern = /\[sound:[^\]]+\]/gi

function composeBackFields(fields: string[]) {
  const blocks: string[] = []
  let pendingAudio: string[] = []

  for (const field of fields) {
    if (isAudioOnlyField(field)) {
      pendingAudio.push(field)
      continue
    }

    if (pendingAudio.length > 0 && blocks.length > 0) {
      blocks[blocks.length - 1] = appendAudioTokens(blocks[blocks.length - 1], pendingAudio)
      pendingAudio = []
    }

    blocks.push(field)
  }

  if (pendingAudio.length > 0) {
    distributeTrailingAudio(blocks, pendingAudio)
  }

  return blocks.join('<br />')
}

function distributeTrailingAudio(blocks: string[], audioFields: string[]) {
  if (blocks.length === 0) {
    blocks.push(audioFields.join(' '))
    return
  }

  if (audioFields.length === 1) {
    blocks[blocks.length - 1] = appendAudioTokens(blocks[blocks.length - 1], audioFields)
    return
  }

  const targetIndexes = getAudioTargetIndexes(blocks, audioFields.length)
  audioFields.forEach((audioField, index) => {
    const targetIndex = targetIndexes[index] ?? blocks.length - 1
    blocks[targetIndex] = appendAudioTokens(blocks[targetIndex], [audioField])
  })
}

function getAudioTargetIndexes(blocks: string[], audioCount: number) {
  const indexes: number[] = []
  const pronunciationIndex = blocks.findIndex((block) => isPronunciationLike(block))
  const exampleIndex = blocks.findIndex((block) => isSentenceLike(block))
  const lastShortIndex = findLastShortTextIndex(blocks, [pronunciationIndex, exampleIndex])

  for (const candidate of [pronunciationIndex, exampleIndex, lastShortIndex]) {
    if (candidate >= 0 && !indexes.includes(candidate)) indexes.push(candidate)
    if (indexes.length >= audioCount) break
  }

  for (let index = blocks.length - 1; indexes.length < audioCount && index >= 0; index -= 1) {
    if (!indexes.includes(index) && !hasMediaMarkup(blocks[index])) indexes.push(index)
  }

  return indexes
}

function appendAudioTokens(block: string, audioFields: string[]) {
  return `${block} ${audioFields.join(' ')}`.trim()
}

function isAudioOnlyField(value: string) {
  const withoutAudio = value.replace(soundTokenPattern, '').trim()
  return withoutAudio.length === 0 && /\[sound:[^\]]+\]/i.test(value)
}

function isPronunciationLike(value: string) {
  const text = stripHtml(value).replace(soundTokenPattern, '').trim()
  if (!text || hasMediaMarkup(value)) return false
  if (/[ˈˌəɜɔɑæʊɪɛʃʒθðŋɒʌː]/i.test(text)) return true
  if (/^[/\[].+[/\]]$/.test(text)) return true
  return text.length <= 24 && !/\s/.test(text) && !/[.!?]$/.test(text)
}

function isSentenceLike(value: string) {
  const text = stripHtml(value).replace(soundTokenPattern, '').trim()
  if (!text || hasMediaMarkup(value)) return false
  const words = text.split(/\s+/).filter(Boolean)
  return /[.!?]$/.test(text) || (/^[A-Z]/.test(text) && words.length >= 5)
}

function findLastShortTextIndex(blocks: string[], excluded: number[]) {
  for (let index = blocks.length - 1; index >= 0; index -= 1) {
    if (excluded.includes(index)) continue
    if (hasMediaMarkup(blocks[index])) continue
    const text = stripHtml(blocks[index]).replace(soundTokenPattern, '').trim()
    const words = text.split(/\s+/).filter(Boolean)
    if (text && words.length <= 4 && text.length <= 48) return index
  }
  return -1
}

function hasMediaMarkup(value: string) {
  return /\[sound:[^\]]+\]/i.test(value) || /<\s*img\b/i.test(value) || /<\s*audio\b/i.test(value)
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
}

function normalizeComparable(value: string) {
  return stripHtml(value).replace(soundTokenPattern, '').trim().toLowerCase()
}
