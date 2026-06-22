import type { Flashcard } from '@/types/card'
import type { Deck } from '@/types/deck'
import type { ReviewHistory, ReviewInterval, StudyActivity, StudyStats } from '@/types/review'

export const decks: Deck[] = [
  {
    id: 'english-vocabulary',
    name: 'English Vocabulary',
    language: 'English',
    description: 'High-frequency words, simple sentences, and everyday examples for practical English study.',
    totalCards: 320,
    dueCards: 28,
    newCards: 16,
    progress: 62,
    lastStudied: 'Today',
    level: 'A1-A2',
    tags: ['Vocabulary', 'Sentences'],
  },
  {
    id: 'japanese-n5',
    name: 'Japanese N5',
    language: 'Japanese',
    description: 'Kana-friendly vocabulary, beginner grammar patterns, and practical examples.',
    totalCards: 360,
    dueCards: 21,
    newCards: 12,
    progress: 42,
    lastStudied: 'Yesterday',
    level: 'N5',
    tags: ['JLPT', 'Grammar'],
  },
  {
    id: 'korean-basics',
    name: 'Korean Basics',
    language: 'Korean',
    description: 'Hangul reading, greetings, common nouns, and beginner-friendly Korean phrases.',
    totalCards: 280,
    dueCards: 19,
    newCards: 14,
    progress: 54,
    lastStudied: '2 days ago',
    level: 'Beginner',
    tags: ['Hangul', 'Vocabulary'],
  },
  {
    id: 'spanish-core',
    name: 'Spanish Core Phrases',
    language: 'Spanish',
    description: 'Everyday verbs, travel phrases, and high-frequency nouns for fast comprehension.',
    totalCards: 220,
    dueCards: 11,
    newCards: 8,
    progress: 37,
    lastStudied: '4 days ago',
    level: 'A2',
    tags: ['Vocabulary', 'Travel'],
  },
]

const englishCards: Flashcard[] = [
  ['apple', 'quả táo', 'I eat an apple every morning.', 'Tôi ăn một quả táo mỗi sáng.'],
  ['journey', 'hành trình, chuyến đi', 'Language learning is a long journey.', 'Học ngôn ngữ là một hành trình dài.'],
  ['careful', 'cẩn thận', 'Be careful with pronunciation.', 'Hãy cẩn thận với phát âm.'],
  ['remember', 'nhớ', 'I use flashcards to remember new words.', 'Tôi dùng flashcard để nhớ từ mới.'],
  ['improve', 'cải thiện', 'Daily reviews improve my listening skills.', 'Ôn tập hằng ngày cải thiện kỹ năng nghe của tôi.'],
  ['neighbor', 'hàng xóm', 'My neighbor speaks three languages.', 'Hàng xóm của tôi nói ba ngôn ngữ.'],
  ['quiet', 'yên tĩnh', 'I study in a quiet room.', 'Tôi học trong một căn phòng yên tĩnh.'],
  ['practice', 'luyện tập', 'Practice a little every day.', 'Hãy luyện tập một chút mỗi ngày.'],
  ['answer', 'câu trả lời', 'Reveal the answer after you think.', 'Hãy hiện câu trả lời sau khi bạn suy nghĩ.'],
  ['schedule', 'lịch trình', 'My review schedule is simple.', 'Lịch ôn tập của tôi rất đơn giản.'],
  ['sentence', 'câu', 'Write one sentence with each word.', 'Viết một câu với mỗi từ.'],
  ['meaning', 'nghĩa', 'Do you know the meaning of this word?', 'Bạn có biết nghĩa của từ này không?'],
  ['habit', 'thói quen', 'Reviewing cards is a useful habit.', 'Ôn thẻ là một thói quen hữu ích.'],
  ['listen', 'nghe', 'Listen to the example sentence twice.', 'Nghe câu ví dụ hai lần.'],
  ['repeat', 'lặp lại', 'Repeat the phrase out loud.', 'Lặp lại cụm từ thành tiếng.'],
  ['simple', 'đơn giản', 'Keep your study routine simple.', 'Giữ thói quen học của bạn đơn giản.'],
  ['daily', 'hằng ngày', 'Daily practice builds confidence.', 'Luyện tập hằng ngày xây dựng sự tự tin.'],
  ['backup', 'bản sao lưu', 'Export a backup of your local decks.', 'Xuất bản sao lưu cho các bộ thẻ local của bạn.'],
  ['progress', 'tiến độ', 'Your progress is saved in the browser.', 'Tiến độ của bạn được lưu trong trình duyệt.'],
  ['language', 'ngôn ngữ', 'Which language are you studying?', 'Bạn đang học ngôn ngữ nào?'],
].map(([front, meaning, example, translation], index) => ({
  id: `english-card-${index + 1}`,
  deckId: 'english-vocabulary',
  front,
  meaning,
  example,
  translation,
}))

export const cards = englishCards

export const studyCards = cards

export const reviewIntervals: ReviewInterval[] = [
  { rating: 'again', label: 'Again', interval: '1m' },
  { rating: 'hard', label: 'Hard', interval: '6m' },
  { rating: 'good', label: 'Good', interval: '10m' },
  { rating: 'easy', label: 'Easy', interval: '4d' },
]

export const studyStats: StudyStats = {
  totalCards: decks.reduce((sum, deck) => sum + deck.totalCards, 0),
  dueToday: decks.reduce((sum, deck) => sum + deck.dueCards, 0),
  newCards: decks.reduce((sum, deck) => sum + deck.newCards, 0),
  studyStreak: 12,
  cardsReviewed: 393,
  accuracy: 86,
}

export const dashboardStats = studyStats

export const studyActivity: StudyActivity[] = [
  { day: 'Mon', reviewed: 42, accuracy: 82 },
  { day: 'Tue', reviewed: 58, accuracy: 86 },
  { day: 'Wed', reviewed: 34, accuracy: 78 },
  { day: 'Thu', reviewed: 71, accuracy: 89 },
  { day: 'Fri', reviewed: 63, accuracy: 91 },
  { day: 'Sat', reviewed: 49, accuracy: 84 },
  { day: 'Sun', reviewed: 76, accuracy: 93 },
]

export const reviewHistory: ReviewHistory[] = [
  {
    id: 'review-1',
    cardId: 'english-card-1',
    deckId: 'english-vocabulary',
    rating: 'good',
    reviewedAt: '2026-06-22T08:15:00.000Z',
    nextReview: '2026-06-22T08:25:00.000Z',
  },
  {
    id: 'review-2',
    cardId: 'english-card-2',
    deckId: 'english-vocabulary',
    rating: 'hard',
    reviewedAt: '2026-06-22T08:18:00.000Z',
    nextReview: '2026-06-22T08:24:00.000Z',
  },
  {
    id: 'review-3',
    cardId: 'english-card-3',
    deckId: 'english-vocabulary',
    rating: 'easy',
    reviewedAt: '2026-06-22T08:21:00.000Z',
    nextReview: '2026-06-26T08:21:00.000Z',
  },
]
