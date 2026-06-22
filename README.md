# LinguaMemo

LinguaMemo is a browser-first language flashcard app built for local study. It imports Anki `.apkg` decks directly in the browser, stores all data in IndexedDB, and runs as a static frontend on Vercel.

## Features

- Single-page app at `/app`
- Local-first storage with IndexedDB/Dexie
- Browser-only Anki `.apkg` import
- Audio and image media import from Anki packages
- Anki-style language card rendering for vocabulary decks
- Spaced repetition review flow with daily new-card limits
- Dashboard, Study, Decks, Import, Analytics, and Settings views
- Backup and restore support
- Mobile layout with bottom navigation and safe-area handling
- Starter decks for English, Portuguese, and Spanish

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Dexie / IndexedDB
- JSZip
- sql.js
- DOMPurify
- Radix UI components
- Vercel static deployment

## Local development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000/app
```

Build production output:

```bash
npm run build
```

Type-check:

```bash
npx tsc --noEmit
```

Lint script:

```bash
npm run lint
```

Note: the lint script expects an ESLint setup. If the repo has no ESLint config yet, lint may need configuration before it can run successfully.

## Starter decks

Starter decks are served from the static `public` folder.

Required files:

```txt
public/deck/
  decks.json
  english.apkg
  portuguese.apkg
  spanish.apkg
```

Current manifest:

```json
[
  {
    "id": "english",
    "name": "English Vocabulary",
    "language": "English",
    "file": "/deck/english.apkg"
  },
  {
    "id": "portuguese",
    "name": "Portuguese Vocabulary",
    "language": "Portuguese",
    "file": "/deck/portuguese.apkg"
  },
  {
    "id": "spanish",
    "name": "Spanish Vocabulary",
    "language": "Spanish",
    "file": "/deck/spanish.apkg"
  }
]
```

During runtime the app fetches:

```txt
/deck/decks.json
/deck/english.apkg
/deck/portuguese.apkg
/deck/spanish.apkg
```

The files are not uploaded anywhere. The browser fetches the static `.apkg` file, converts it to a `File`, and imports it locally into IndexedDB using the existing Anki import pipeline.

### Duplicate prevention

Starter decks are tagged with:

- `starterDeckId`
- `language`
- `source: "starter"`

If a deck with the same `starterDeckId` already exists in IndexedDB, the UI shows `Already imported` and disables the import button.

## Custom Anki import

Users can import their own `.apkg` files from the Import page.

Import behavior:

1. The selected file stays in the browser.
2. JSZip reads the `.apkg` package.
3. sql.js parses the Anki collection database.
4. Cards, fields, audio, images, and media refs are extracted.
5. Decks/cards/media are written to IndexedDB.

No backend or API route is involved.

## Data storage

LinguaMemo stores app data locally in IndexedDB through Dexie.

Main tables:

- `decks`
- `cards`
- `media`
- `reviews`
- `settings`

Because the app is local-first, clearing browser site data will remove decks, review history, media, and settings unless the user has created a backup.

## Backup and restore

The app supports local backup/restore. Backups include deck data, cards, reviews, settings, and media files. Restore writes data back into IndexedDB.

## Deployment to Vercel

This app is frontend-only and static-deploy friendly.

Deployment checklist:

1. Ensure starter decks exist in `public/deck/`.
2. Ensure `.apkg` files are tracked by git and not ignored.
3. Push the repo to GitHub.
4. Import the GitHub repo into Vercel.
5. Use the default Next.js build command:

```bash
npm run build
```

6. Deploy.

After deploy, verify these URLs return files:

```txt
https://your-domain.vercel.app/deck/decks.json
https://your-domain.vercel.app/deck/english.apkg
https://your-domain.vercel.app/deck/portuguese.apkg
https://your-domain.vercel.app/deck/spanish.apkg
```

## Important constraints

- No backend
- No API routes
- No server actions
- No Node-only file APIs for deck import
- Keep the single app route `/app`
- Keep IndexedDB/local-first behavior
- Keep custom `.apkg` import working
- Keep media/audio/image rendering working
- Keep SRS/review logic and daily limits working
- Keep backup/restore working

## Known notes

- `next.config.mjs` currently skips Next's type validation during build via `typescript.ignoreBuildErrors`. Run `npx tsc --noEmit` separately before deploy.
- Next may warn about multiple lockfiles if a parent directory also contains a lockfile. This warning does not block build, but it is worth cleaning up before production if possible.
- Large `.apkg` files can increase repo and deployment size. If they become too large for GitHub/Vercel limits, use Git LFS or host the files on a CDN with proper CORS.
