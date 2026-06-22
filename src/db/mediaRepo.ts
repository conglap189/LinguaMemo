import { db } from './db'
import type { MediaFile } from '../types/media'

export async function saveMediaFiles(files: MediaFile[]) {
  if (files.length === 0) return []
  await db.media.bulkPut(files)
  return files
}

export async function getMediaByFilename(deckId: string, filename: string) {
  const candidates = getFilenameCandidates(filename)
  const files = await db.media.where('deckId').equals(deckId).toArray()
  return files.find((file) => {
    const stored = getFilenameCandidates(file.filename)
    return candidates.some((candidate) => stored.includes(candidate))
  })
}

export function getMediaByDeckId(deckId: string) {
  return db.media.where('deckId').equals(deckId).toArray()
}

export function deleteMediaByDeckId(deckId: string) {
  return db.media.where('deckId').equals(deckId).delete()
}

export function deleteAllMedia() {
  return db.media.clear()
}

function getFilenameCandidates(filename: string) {
  const decoded = safeDecode(filename.trim())
  const basename = decoded.split(/[\\/]/).filter(Boolean).at(-1) ?? decoded
  return Array.from(new Set([filename.trim(), decoded, basename].filter(Boolean)))
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
