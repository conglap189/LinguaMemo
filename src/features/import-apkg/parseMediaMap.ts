import type JSZip from 'jszip'

export async function parseMediaMap(zip: JSZip): Promise<Record<string, string>> {
  const mediaFile = zip.file('media')
  if (!mediaFile) return {}

  try {
    const raw = await mediaFile.async('text')
    const parsed = JSON.parse(raw) as unknown

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    return Object.fromEntries(
      Object.entries(parsed)
        .filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].trim().length > 0)
        .map(([zipEntryName, filename]) => [zipEntryName, filename.trim()]),
    )
  } catch (error) {
    console.warn('Could not parse Anki media map. Continuing without media.', error)
    return {}
  }
}
