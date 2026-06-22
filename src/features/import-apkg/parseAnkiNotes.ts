import type { Database } from 'sql.js'

import { splitAnkiFields } from '@/src/lib/ankiFieldUtils'

import { runAnkiQuery, valueToString } from './parseAnkiDb'
import type { AnkiNote } from './types'

export function parseAnkiNotes(db: Database): AnkiNote[] {
  const rows = runAnkiQuery(db, 'select id, mid, flds, tags from notes')

  return rows.map((row) => ({
    id: valueToString(row.id),
    mid: valueToString(row.mid),
    fields: splitAnkiFields(valueToString(row.flds)),
    tags: valueToString(row.tags).split(/\s+/).filter(Boolean),
  })).filter((note) => note.id.length > 0 && note.fields.length > 0)
}
