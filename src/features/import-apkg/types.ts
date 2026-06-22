export type ImportStep = 'reading-package' | 'extracting-database' | 'parsing-notes' | 'extracting-media' | 'creating-cards' | 'done'

export type ImportStatus = {
  step: ImportStep
  message: string
}

export type ImportApkgResult = {
  deckId: string
  deckName: string
  cardCount: number
  mediaCount: number
  starterDeckId?: string
  language?: string
}

export type AnkiDeckInfo = {
  id: string
  name: string
}

export type AnkiNote = {
  id: string
  mid: string
  fields: string[]
  tags: string[]
}

export type AnkiCard = {
  id: string
  nid: string
  did: string
  ord: number
}
