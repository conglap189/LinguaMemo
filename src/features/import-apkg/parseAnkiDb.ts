import type { Database, SqlValue } from 'sql.js'

export type AnkiDbRow = Record<string, SqlValue>

export function runAnkiQuery(db: Database, sql: string): AnkiDbRow[] {
  const results = db.exec(sql)
  if (results.length === 0) return []

  return results.flatMap((result) =>
    result.values.map((values) =>
      result.columns.reduce<AnkiDbRow>((row, column, index) => {
        row[column] = values[index]
        return row
      }, {}),
    ),
  )
}

export function valueToString(value: SqlValue): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

export function valueToNumber(value: SqlValue): number {
  if (typeof value === 'number') return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}
