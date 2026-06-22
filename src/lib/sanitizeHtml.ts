import DOMPurify from 'dompurify'

const allowedTags = [
  'b',
  'strong',
  'i',
  'em',
  'u',
  'br',
  'div',
  'span',
  'p',
  'ul',
  'ol',
  'li',
  'ruby',
  'rt',
  'rp',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'img',
  'audio',
  'a',
  'button',
] as const

const allowedAttributes = [
  'src',
  'alt',
  'title',
  'class',
  'style',
  'controls',
  'href',
] as const

const safeUriPattern = /^(?:(?:https?|mailto|tel|blob):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i

export function sanitizeCardHtml(html: string): string {
  if (!html) return ''

  try {
    const sanitized = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [...allowedTags],
      ALLOWED_ATTR: [...allowedAttributes],
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
      ALLOW_DATA_ATTR: false,
      ALLOWED_URI_REGEXP: safeUriPattern,
    })

    return removeUnsafeAttributes(sanitized)
  } catch {
    return escapeHtml(html)
  }
}

function removeUnsafeAttributes(html: string): string {
  if (!html || typeof document === 'undefined') return html

  const template = document.createElement('template')
  template.innerHTML = html

  template.content.querySelectorAll('*').forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase()
      const value = attribute.value.trim()

      if (name.startsWith('on')) {
        element.removeAttribute(attribute.name)
        return
      }

      if ((name === 'href' || name === 'src') && !isSafeUri(value)) {
        element.removeAttribute(attribute.name)
      }
    })
  })

  return template.innerHTML
}

function isSafeUri(value: string): boolean {
  if (!value) return true
  const normalized = value.replace(/[\u0000-\u001F\u007F\s]+/g, '').toLowerCase()

  if (normalized.startsWith('javascript:')) return false

  return safeUriPattern.test(value)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
