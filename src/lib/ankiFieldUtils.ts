export const ANKI_FIELD_SEPARATOR = '\x1f'

export function splitAnkiFields(fields: string): string[] {
  return fields.split(ANKI_FIELD_SEPARATOR).map((field) => field.trim())
}
