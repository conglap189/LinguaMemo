import type { Database } from 'sql.js'

import { runAnkiQuery, valueToNumber, valueToString } from './parseAnkiDb'
import type { AnkiCard } from './types'

export function parseAnkiCards(db: Database): AnkiCard[] {
  const rows = runAnkiQuery(db, 'select id, nid, did, ord from cards')

  return rows.map((row) => ({
    id: valueToString(row.id),
    nid: valueToString(row.nid),
    did: valueToString(row.did),
    ord: valueToNumber(row.ord),
  })).filter((card) => card.id.length > 0 && card.nid.length > 0)
}
