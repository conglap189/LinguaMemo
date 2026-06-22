'use client'

import { cn } from '@/lib/utils'
import { normalizeAnkiHtml } from '@/src/lib/ankiHtmlUtils'
import { sanitizeCardHtml } from '@/src/lib/sanitizeHtml'

type SafeCardHtmlProps = {
  html: string
  className?: string
  inline?: boolean
}

export function SafeCardHtml({ html, className, inline = false }: SafeCardHtmlProps) {
  const sanitizedHtml = sanitizeCardHtml(normalizeAnkiHtml(html))
  const Component = inline ? 'span' : 'div'

  if (!sanitizedHtml) {
    return inline ? null : <Component className={cn('card-html-content text-muted-foreground', className)}>No content</Component>
  }

  return <Component className={cn('card-html-content', className)} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
}
