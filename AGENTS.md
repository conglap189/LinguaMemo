# AGENTS.md

This file gives AI coding agents the project rules and context needed to work safely in this repository.

## Project summary

LinguaMemo is a local-first language flashcard app. It is a frontend-only Next.js app that runs at `/app`, imports Anki `.apkg` files in the browser, and stores all user data in IndexedDB/Dexie.

There is no backend. Do not add backend infrastructure unless the user explicitly changes the product direction.

## Core constraints

Do not change these without explicit user approval:

- No backend
- No API routes
- No server actions
- Keep single app route: `/app`
- Keep IndexedDB/Dexie local-first storage
- Keep browser-only `.apkg` import
- Keep custom user `.apkg` import working
- Keep starter deck import working from `public/deck`
- Keep media blob lookup for audio/images working
- Keep SRS/review logic and daily limits working
- Keep backup/restore working
- Keep Deck Manage modal behavior working
- Keep mobile bottom navigation safe-area behavior working

## Static starter decks

Starter decks are static files under:

```txt
public/deck/
  decks.json
  english.apkg
  portuguese.apkg
  spanish.apkg
```

Runtime URLs:

```txt
/deck/decks.json
/deck/english.apkg
/deck/portuguese.apkg
/deck/spanish.apkg
```

Do not use `fs`, `path`, API routes, or server code to load starter decks. Use browser `fetch()` only.

Starter deck metadata:

- `starterDeckId`
- `language`
- `source: "starter"`

Duplicate prevention is based on `starterDeckId`.

## Important files

App shell and routing:

- `components/app/lingua-memo-app.tsx`
- `components/layout/app-shell.tsx`
- `components/app/types.ts`

Dashboard/decks/import:

- `components/dashboard/dashboard-page.tsx`
- `components/dashboard/DeckManageModal.tsx`
- `components/decks/decks-page.tsx`
- `components/import/import-page.tsx`
- `components/starter-decks/StarterDeckSection.tsx`
- `src/features/starter-decks/starterDecks.ts`

Study/card rendering:

- `src/views/StudyView.tsx`
- `components/study/StudyCard.tsx`
- `components/study/AnkiStyleCardContent.tsx`
- `components/study/CardContentWithMedia.tsx`
- `components/study/AudioButton.tsx`
- `components/study/SafeCardHtml.tsx`

APKG import:

- `src/features/import-apkg/importApkg.ts`
- `src/features/import-apkg/parseAnkiCards.ts`
- `src/features/import-apkg/parseAnkiDecks.ts`
- `src/features/import-apkg/parseAnkiNotes.ts`
- `src/features/import-apkg/parseMediaMap.ts`
- `src/features/import-apkg/extractMedia.ts`
- `src/features/import-apkg/types.ts`

IndexedDB/Dexie:

- `src/db/db.ts`
- `src/db/deckRepo.ts`
- `src/db/cardRepo.ts`
- `src/db/mediaRepo.ts`
- `src/db/reviewRepo.ts`
- `src/db/settingsRepo.ts`

Types:

- `src/types/deck.ts`
- `src/types/card.ts`
- `src/types/media.ts`
- `src/types/review.ts`
- `src/types/settings.ts`

Backup/restore:

- `src/features/backup/exportBackup.ts`
- `src/features/backup/importBackup.ts`
- `src/features/backup/types.ts`

Global styles:

- `app/globals.css`

## APKG import behavior

The `.apkg` import is browser-only:

1. `File` is read in browser.
2. `JSZip` loads the package.
3. `sql.js` reads `collection.anki21` or `collection.anki2`.
4. Notes/cards/decks/media are parsed.
5. Cards/media/deck data are saved into IndexedDB.

Important public asset:

```txt
public/sql-wasm.wasm
```

`sql.js` uses `/sql-wasm.wasm`. Do not move this without updating import code.

## Card rendering rules

Language-like imported cards should use `AnkiStyleCardContent` when `canRenderAsLanguageCard(fields)` returns true.

Fallback behavior is important:

- If fields cannot be classified as a language card, use generic `CardContentWithMedia`.
- Do not break generic decks.
- Do not append all audio at the bottom for Anki-style cards.
- Keep audio mapped to word/definition/example sections.
- Keep images resolved through IndexedDB media blobs.

## Mobile layout rules

- App shell should use `100dvh`/`h-dvh` and avoid body page scrolling.
- Non-study pages scroll inside the app shell.
- Bottom nav is fixed on mobile on every app view, including active Study and Study empty/summary states.
- Active Study reserves the bottom-nav area, including the floating Import button and safe area, so reveal/review controls never sit underneath it.
- Non-study pages need bottom padding for the mobile nav safe area.
- Study card content should scroll internally when long.
- Review buttons must remain visible at the bottom.
- Avoid horizontal overflow.

## Validation commands

Run these after meaningful changes:

```bash
npx tsc --noEmit
npm run build
```

The `lint` script exists:

```bash
npm run lint
```

but may require ESLint configuration before it works in this repo.

## Deployment notes

The app is intended for Vercel static/frontend deployment.

Before deploy:

1. Confirm `public/deck/*.apkg` files exist.
2. Confirm `.apkg` files are committed and not ignored.
3. Run `npx tsc --noEmit`.
4. Run `npm run build`.
5. Push to GitHub.
6. Deploy through Vercel.

Known warning:

- Next may warn about multiple lockfiles because a parent directory has a lockfile. This does not currently block build, but it should be cleaned up for production if possible.

## What not to do

- Do not add API routes for importing decks.
- Do not upload `.apkg` files to a server.
- Do not parse `.apkg` on the server.
- Do not replace IndexedDB with remote storage.
- Do not break existing user-imported decks while adding starter deck behavior.
- Do not remove generic card fallback rendering.
- Do not change SRS behavior as part of UI-only changes.
- Do not silently change backup format without preserving backward compatibility.
