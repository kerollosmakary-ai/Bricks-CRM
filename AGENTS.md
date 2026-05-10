# AGENTS.md — Bricks-CRM

Agent guidance for working in this repository.

---

## Project Overview

Bricks-CRM is a real-estate sales CRM for Arabic-speaking agents. It records calls, transcribes them, runs AI sentiment analysis via a Supabase Edge Function, and surfaces leads, call history, and follow-up reminders in a React dashboard.

**Stack:** React 18 · TypeScript · Vite · Zustand · Supabase (Auth + Postgres + Edge Functions) · plain CSS (one file per component)

**Language:** UI copy is in Arabic (RTL). Code identifiers and comments must be in English.

---

## Repository Layout

```
src/
  App.tsx              # Root router — auth guard lives here
  main.tsx             # React entry point
  lib/
    supabase.ts        # Supabase client (singleton)
    auth.ts            # Auth helpers (signUp, signIn, signOut, getCurrentUser)
    api.ts             # All Supabase table calls + Edge Function call
    store.ts           # Zustand global store (User, Lead, CallAnalysis)
  pages/
    Auth.tsx           # Login / sign-up form
    Dashboard.tsx      # Tabbed view: leads | calls | reminders
    RecordCall.tsx     # Audio recording + transcript + analysis trigger
  components/
    LeadList.tsx       # Lead cards + add-lead form
    CallHistory.tsx    # Call log per agent
    CallReview.tsx     # Post-call review & confirmation form
    RemindersPanel.tsx # Active reminders list
  styles/
    global.css         # Reset, CSS custom properties, shared button/input classes
    *.css              # One file per page/component
index.html             # Sets lang="ar" — do not remove
```

---

## Environment Variables

Required in `.env` (never commit real values — use `.env.example` as a template):

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

The Supabase client throws at startup if either variable is missing (`src/lib/supabase.ts`).

---

## Dev Commands

```bash
npm install                          # install dependencies
npm run dev                          # Vite dev server on :5173
npm run build                        # tsc + vite build (use this to type-check)
npm run preview                      # preview production build
./node_modules/.bin/tsc --noEmit     # type-check without emitting files
```

No test runner is configured yet. TypeScript strict mode is on — `npm run build` must pass before committing.

> `npx tsc` will not work without a global TypeScript install. Use `./node_modules/.bin/tsc` or `npm run build`.

---

## Data Model (Supabase tables)

| Table | Key columns |
|---|---|
| `leads` | id, agent_id, name, phone, email, location, property_type, budget_range, status, language |
| `calls` | id, lead_id, agent_id, transcript, duration_seconds, call_date |
| `call_analysis` | id, call_id, agent_id, suggested_*, confirmed_*, keywords_matched, confirmed_at |
| `reminders` | id, call_analysis_id, agent_id, lead_id, reminder_date, reminder_type, completed, completed_at |

Row-level security is expected on all tables (`agent_id = auth.uid()`). Never bypass RLS by using the service role key on the client.

---

## Coding Conventions

- **TypeScript only.** Do not edit or create `.js` files — the `.js` duplicates in `src/` are legacy artifacts and should be deleted.
- **Strict types.** `noImplicitAny` and `strictNullChecks` are enabled. Avoid `any`; define interfaces in `src/lib/store.ts` or co-locate them with the component that owns them.
- **State management.** Global state lives in `src/lib/store.ts` (Zustand). Local UI state stays in component `useState`. Do not add a second state library.
- **API calls.** All Supabase queries go through `src/lib/api.ts`. Do not import or call `supabase` directly from components or pages.
- **Auth.** Route protection is handled in `App.tsx` via `<Navigate>`. Pages should read `user` from the Zustand store — they must not re-fetch `getCurrentUser()` on mount.
- **Styling.**
  - One CSS file per page/component, imported at the top of that file.
  - Use the CSS custom properties defined in `global.css` (`--primary`, `--success`, `--danger`, `--warning`, `--neutral`, `--border`) — do not hardcode hex values.
  - No inline styles except for dynamic values computed at runtime (e.g., sentiment badge color).
  - No CSS-in-JS.
  - RTL layout is set globally via `html { direction: rtl }` in `global.css` and `lang="ar"` on `<html>` in `index.html`. Do not add per-element `dir` attributes or override `direction` in component CSS.
- **Arabic copy.** All user-visible strings are in Arabic. Keep them inline in JSX; do not extract to a separate i18n file unless explicitly asked.
- **No test files yet.** When adding tests, use Vitest (already compatible with Vite — no additional config needed).

---

## Known Issues / Tech Debt

- Duplicate `.js` / `.tsx` files exist for every module — the `.js` files are dead code and must be removed.
- `RecordCall.tsx` uses a hardcoded mock transcript instead of real speech-to-text output.
- Several API functions (`createCall`, `createAnalysis`, `createReminder`, `updateAnalysis`, `updateReminder`) use `any` for their parameter types.
- `.env` is committed with real Supabase credentials — rotate keys and add `.env` to `.gitignore`.
- `CallHistory.tsx` imports `getAnalysisByCall` but never calls it.
- `noUnusedLocals` and `noUnusedParameters` are disabled in `tsconfig.json`.
- The devcontainer uses the 10 GB universal image; switching to `javascript-node:22` would start faster.
- No linter (ESLint) or formatter (Prettier) is configured.

See `AGENTS-IMPROVEMENT-SPEC.md` for prioritised fixes with acceptance criteria.

---

## Agent Rules

1. **Read before editing.** Always read the target file before making changes.
2. **Delete `.js` duplicates** when touching any module — never edit the `.js` version.
3. **Type everything.** Replace `any` with a proper interface whenever you touch a function that uses it.
4. **Do not commit `.env`.** Reference env var names only; never log or print their values.
5. **Verify the build.** Run `npm run build` after changes to confirm TypeScript and Vite both pass.
6. **Do not add dependencies** without checking `package.json` first and confirming the package is necessary.
7. **Preserve RTL.** Do not add CSS that overrides `direction: rtl` or removes `lang="ar"` from `index.html`.
8. **Commit messages:** imperative mood, ≤72 chars subject, reference the affected module (e.g., `fix(api): type createCall params`).
