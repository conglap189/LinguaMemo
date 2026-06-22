const commonHtmlBlockOrBreakPattern = /<\s*(?:br|div|p|ul|ol|li|table|thead|tbody|tr|th|td|ruby|blockquote|h[1-6])\b/i
const soundRefPattern = /\[sound:([^\]]+)\]/gi
const imageExtensionPattern = /\.(?:jpe?g|png|gif|webp|svg)(?:[?#].*)?$/i

export function normalizeAnkiHtml(html: string): string {
  if (!html) return ''

  const trimmed = html.trim()
  if (!trimmed) return ''

  if (commonHtmlBlockOrBreakPattern.test(trimmed)) return trimmed

  return trimmed.replace(/\r\n|\r|\n/g, '<br />')
}

export function extractSoundRefs(html: string): string[] {
  if (!html) return []

  const refs = new Set<string>()
  for (const match of html.matchAll(soundRefPattern)) {
    const filename = match[1]?.trim()
    if (filename) refs.add(filename)
  }
  return Array.from(refs)
}

export function extractImageRefs(html: string): string[] {
  if (!html) return []

  const refs = new Set<string>()
  const imgTagPattern = /<img\b[^>]*\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/gi

  for (const match of html.matchAll(imgTagPattern)) {
    const src = (match[1] ?? match[2] ?? match[3] ?? '').trim()
    if (src && imageExtensionPattern.test(src)) refs.add(src)
  }

  return Array.from(refs)
}
