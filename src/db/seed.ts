import { createCards } from './cardRepo'
import { createDeck } from './deckRepo'
import { db } from './db'
import { getSettings } from './settingsRepo'
import type { Flashcard } from '../types/card'

const now = () => new Date().toISOString()
const seedMarkerKey = 'linguamemo-demo-seeded'

function hasSeedMarker() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(seedMarkerKey) === 'true'
}

export function markDemoSeeded() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(seedMarkerKey, 'true')
}

export async function hasData() {
  return (await db.decks.count()) > 0 || (await db.cards.count()) > 0
}

export async function seedDemoData() {
  if (await hasData()) return
  if (hasSeedMarker()) return
  await loadDemoData()
}

export async function loadDemoData() {
  await getSettings()
  const timestamp = Date.now()
  const isoTimestamp = new Date(timestamp).toISOString()
  const decks = [
    await createDeck({ id: 'english-vocabulary', name: 'English Vocabulary', description: 'Everyday English words with example sentences.', language: 'English', source: 'manual', createdAt: isoTimestamp, updatedAt: isoTimestamp }),
    await createDeck({ id: 'japanese-n5', name: 'Japanese N5', description: 'Core JLPT N5 vocabulary for beginners.', language: 'Japanese', source: 'manual', createdAt: new Date(timestamp + 1).toISOString(), updatedAt: new Date(timestamp + 1).toISOString() }),
    await createDeck({ id: 'korean-basics', name: 'Korean Basics', description: 'Hangul and simple Korean expressions.', language: 'Korean', source: 'manual', createdAt: new Date(timestamp + 2).toISOString(), updatedAt: new Date(timestamp + 2).toISOString() }),
  ]

  const makeCard = (deckId: string, front: string, meaning: string, example: string, translation: string): Omit<Flashcard, 'createdAt' | 'updatedAt'> => ({
    id: `${deckId}-${front.toLowerCase().replace(/\s+/g, '-')}`,
    deckId,
    front,
    back: `Meaning: ${meaning}\nExample: ${example}\nTranslation: ${translation}`,
    fields: [meaning, example, translation],
    mediaRefs: [],
    state: 'new',
    learningStep: 0,
    dueAt: null,
    intervalMinutes: 0,
    reviewCount: 0,
    lapseCount: 0,
    isNew: true,
  })

  await createCards([
    makeCard(decks[0].id, 'apple', 'a round fruit with red, green, or yellow skin', 'I eat an apple every morning.', 'Yo como una manzana cada mañana.'),
    makeCard(decks[0].id, 'journey', 'an act of traveling from one place to another', 'The journey took three hours.', 'El viaje duró tres horas.'),
    makeCard(decks[0].id, 'borrow', 'to take and use something with permission', 'Can I borrow your dictionary?', '¿Puedo tomar prestado tu diccionario?'),
    makeCard(decks[1].id, 'ありがとう', 'thank you', '助けてくれてありがとう。', 'Thank you for helping me.'),
    makeCard(decks[1].id, '水', 'water', '水をください。', 'Please give me water.'),
    makeCard(decks[1].id, '学校', 'school', '学校へ行きます。', 'I go to school.'),
    makeCard(decks[2].id, '안녕하세요', 'hello', '안녕하세요, 만나서 반가워요.', 'Hello, nice to meet you.'),
    makeCard(decks[2].id, '감사합니다', 'thank you', '정말 감사합니다.', 'Thank you very much.'),
    makeCard(decks[2].id, '사과', 'apple', '사과를 먹어요.', 'I eat an apple.'),
  ])
  markDemoSeeded()
}
