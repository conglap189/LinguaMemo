import type JSZip from 'jszip'

import type { MediaFile } from '@/src/types/media'

const maxMediaFileBytes = 25 * 1024 * 1024
const warnTotalMediaBytes = 250 * 1024 * 1024

export async function extractMedia(zip: JSZip, mediaMap: Record<string, string>, deckId: string): Promise<MediaFile[]> {
  const mediaFiles: MediaFile[] = []
  let totalBytes = 0

  for (const [zipEntryName, realFilename] of Object.entries(mediaMap)) {
    const zipEntry = zip.file(zipEntryName)
    if (!zipEntry) {
      console.warn(`Anki media entry not found in package: ${zipEntryName} (${realFilename})`)
      continue
    }

    const bytes = await zipEntry.async('uint8array')
    if (bytes.byteLength > maxMediaFileBytes) {
      console.warn(`Skipping large Anki media file over 25MB: ${realFilename}`)
      continue
    }

    totalBytes += bytes.byteLength
    const mimeType = detectMimeType(realFilename)
    mediaFiles.push({
      id: crypto.randomUUID(),
      deckId,
      filename: realFilename,
      mimeType,
      blob: new Blob([bytes], { type: mimeType }),
      size: bytes.byteLength,
      createdAt: new Date().toISOString(),
    })
  }

  if (totalBytes > warnTotalMediaBytes) {
    console.warn(`Imported Anki media is large: ${Math.round(totalBytes / 1024 / 1024)}MB`)
  }

  return mediaFiles
}

export function detectMimeType(filename: string) {
  const extension = filename.split('?')[0]?.split('#')[0]?.toLowerCase().split('.').pop()

  switch (extension) {
    case 'mp3':
      return 'audio/mpeg'
    case 'wav':
      return 'audio/wav'
    case 'ogg':
      return 'audio/ogg'
    case 'm4a':
      return 'audio/mp4'
    case 'aac':
      return 'audio/aac'
    case '3gp':
    case '3gpp':
      return 'audio/3gpp'
    case '3g2':
      return 'audio/3gpp2'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    case 'svg':
      return 'image/svg+xml'
    default:
      return 'application/octet-stream'
  }
}
