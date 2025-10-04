<!--
Guidance for AI coding agents working on the ai-music-app repository.
Keep this short, concrete, and code-oriented (20-50 lines). Update when high-level architecture or workflows change.
-->

# Quick orientation for code-writing agents

- Big picture: This is a React (Create React App) TypeScript UI for a Supabase-backed music app. Key runtime responsibilities:
  - Auth, storage and DB are handled by Supabase (see `src/supabaseClient.ts`).
  - App routes and layout live in `src/App.tsx` (root Routes). Home is mounted at `/` via `src/components/Home.tsx`.
  - Global UI state for playback/queue uses `src/contexts/QueueContext.tsx`. The player UI is `src/components/PlayerEnhanced.tsx`.
  - Library and lists reuse `src/components/SongList.tsx`, `PersonalizedHeader.tsx`, and `Dashboard.tsx` patterns.

- When updating the Home page: the current `src/components/Home.tsx` is a placeholder. Typical Home compositions in this project use `PersonalizedHeader`, `Dashboard`-style sections and `SongList`. Example files to reference: `src/components/Dashboard.tsx`, `src/components/MusicLibrary.tsx`, `src/components/PersonalizedHeader.tsx`.

- Auth & env: code expects REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in environment (see `src/supabaseClient.ts`). Local dev: run `npm start` (uses `react-scripts`).

- Storage: public song URLs are constructed with `supabase.storage.from('song-files').getPublicUrl(filePath)` in `PlayerEnhanced`.

- Patterns and conventions to follow
  - Functional React components with TypeScript types in `src/components` and `src/types`. Keep component props explicitly typed.
  - Data fetching uses Supabase client directly (no extra data-layer). Follow error handling style in `Dashboard.tsx` (try/catch + console.error).
  - Global contexts (Theme, Queue) wrap the app in `App.tsx` — avoid bypassing those providers when adding pages or tests.
  - Accessibility: components include skip links and aria labels (`<a href="#main-content" className="skip-link">` in `App.tsx`, keyboard handlers in `PlayerEnhanced.tsx`). Preserve these patterns.

- Developer workflows
  - Start dev server: `npm start` (CRA). Build: `npm run build`. Tests: `npm test`.
  - TypeScript is used but config is CRA-managed (`tsconfig.json`). Linting uses the CRA defaults.

- Integration touchpoints
  - Supabase auth: `src/hooks/useAuth.ts` (provides `session`). If a feature depends on auth, guard rendering with this hook as in `App.tsx`.
  - Supabase DB tables referenced in code: `artists` (see `Dashboard.tsx`), `songs` (various components). Storage bucket: `song-files`.

- Quick examples (what to change to restore Home components)
  - To show a dashboard-like home, compose `src/components/Home.tsx` with:
    - `<PersonalizedHeader userName={session.user?.email || 'User'} userAvatarUrl="/default-avatar.png" />`
    - A `SongList` (see `MusicLibrary.tsx` for usage) and small sections copied from `Dashboard.tsx`.

- Files to inspect for context while coding
  - `src/App.tsx` — routes, providers
  - `src/contexts/QueueContext.tsx` — playback API (currentSong, nextSong, prevSong, addToQueue)
  - `src/supabaseClient.ts`, `src/hooks/useAuth.ts` — auth and env
  - `src/components/*` — `Dashboard.tsx`, `MusicLibrary.tsx`, `SongList.tsx`, `PlayerEnhanced.tsx`, `PersonalizedHeader.tsx`

- Constraints for edits made by an AI agent
  - Preserve provider nesting in `App.tsx` and do not inline a different auth method.
  - Use existing UI tokens/classes; avoid adding new global CSS files without approval.
  - When adding features that read/write DB, follow the upsert/select pattern used in `Dashboard.tsx` and call any refresh functions (`fetchArtists` style) after writes.

If something here is unclear or you need a sample patch (for example: restore Home composition), say so and I will create a minimal PR updating `src/components/Home.tsx` with the recommended layout.
