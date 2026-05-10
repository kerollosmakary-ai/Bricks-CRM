# AGENTS-IMPROVEMENT-SPEC.md

Concrete improvements identified from auditing the codebase against AGENTS.md.
Each item states the problem, the fix, and the acceptance criterion.

---

## Audit Summary

### What is good

- TypeScript strict mode is fully enabled (`strict`, `noImplicitAny`, `strictNullChecks`, `noImplicitReturns`, `noFallthroughCasesInSwitch`).
- Zustand store is cleanly typed with exported interfaces (`User`, `Lead`, `CallAnalysis`).
- Supabase client is a singleton with a startup guard for missing env vars.
- All Supabase queries are centralised in `api.ts` — components never import `supabase` directly.
- Auth guard is in one place (`App.tsx`) — no scattered auth checks.
- CSS is scoped per component/page with no CSS-in-JS.
- `vite.config.ts` is minimal and correct.

### What is missing

- No `AGENTS.md` (created in this session).
- No linter or formatter (ESLint + Prettier).
- No test runner or any tests.
- No type definitions for Supabase table rows (no generated types or manual schema types).
- No error boundary in the React tree.
- No `.env.example` file — contributors have no template for required variables.
- `.gitignore` only excludes `node_modules`; `.env`, `dist/`, and build artifacts are unguarded.
- No Supabase schema file or migration tracked in the repo.
- `devcontainer.json` uses the 10 GB universal image with no automations (no `npm install` on start).

### What is wrong

| # | Problem | Severity |
|---|---|---|
| 1 | `.env` is committed with real Supabase credentials (URL + anon key) | Critical |
| 2 | Every source module has a duplicate `.js` file alongside its `.tsx` — dead code that confuses agents and IDEs | High |
| 3 | `RecordCall.tsx` uses a hardcoded mock transcript — the recording pipeline is non-functional | High |
| 4 | `api.ts` uses `any` for `createCall`, `createAnalysis`, `createReminder`, `updateAnalysis`, `updateReminder` params | Medium |
| 5 | `CallHistory.tsx` imports `getAnalysisByCall` but never calls it (unused import) | Low |
| 6 | `noUnusedLocals` and `noUnusedParameters` are `false` in `tsconfig.json` — masks dead code | Low |
| 7 | `Dashboard.tsx` calls `getCurrentUser()` on mount even though `App.tsx` already does — double auth fetch | Low |
| 8 | `Auth.tsx` shows a success message via the error state (`setError`) when sign-up succeeds — misleading | Low |
| 9 | `RemindersPanel` receives `reminders` as a prop but manages its own local copy — parent and child state diverge after completion | Low |

---

## Improvement Items

### IMP-01 — Rotate and protect credentials

**Problem:** `.env` is committed with a real Supabase anon key and project URL.

**Fix:**
1. Rotate the Supabase anon key in the Supabase dashboard immediately.
2. Add the following lines to `.gitignore`:
   ```
   .env
   .env.local
   .env.*.local
   dist/
   ```
3. Create `.env.example` with placeholder values:
   ```
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```
4. Remove `.env` from git history (`git rm --cached .env`).

**Acceptance:** `git ls-files .env` returns nothing. `.env.example` exists. New key works in dev.

---

### IMP-02 — Delete duplicate `.js` files

**Problem:** Every module has both a `.tsx`/`.ts` and a `.js` version. The `.js` files are stale copies that will diverge silently.

**Files to delete:**
```
src/App.js
src/main.js
src/lib/api.js
src/lib/auth.js
src/lib/store.js
src/lib/supabase.js
src/components/CallHistory.js
src/components/CallReview.js
src/components/LeadList.js
src/components/RemindersPanel.js
src/pages/Auth.js
src/pages/Dashboard.js
src/pages/RecordCall.js
```

**Acceptance:** `find src -name "*.js" | wc -l` returns 0. `npm run build` passes.

---

### IMP-03 — Type the `any` API parameters

**Problem:** Five functions in `api.ts` accept `any`, bypassing type safety for the most critical data operations.

**Fix:** Define interfaces for each table row shape and use them:

```typescript
// In store.ts or a new src/lib/types.ts
export interface Call {
  id: string;
  lead_id: string;
  agent_id: string;
  transcript: string;
  duration_seconds: number;
  call_date: string;
}

export interface Analysis {
  id: string;
  call_id: string;
  agent_id: string;
  suggested_sentiment: string;
  suggested_summary: string;
  suggested_summary_ar: string;
  suggested_next_action: string;
  suggested_reminder_days: number;
  keywords_matched: string[];
  confirmed_sentiment?: string;
  confirmed_summary?: string;
  confirmed_summary_ar?: string;
  confirmed_next_action?: string;
  confirmed_reminder_days?: number;
  confirmed_at?: string;
}

export interface Reminder {
  id: string;
  call_analysis_id: string;
  agent_id: string;
  lead_id: string;
  reminder_date: string;
  reminder_type: string;
  completed?: boolean;
  completed_at?: string;
}
```

Replace `any` in `createCall`, `createAnalysis`, `createReminder`, `updateAnalysis`, `updateReminder` with `Omit<T, 'id'>` or `Partial<T>` as appropriate.

**Acceptance:** `tsc --noEmit` passes with `noUnusedLocals: true`. No `any` in `api.ts`.

---

### IMP-04 — Enable unused-variable checks in tsconfig

**Problem:** `noUnusedLocals: false` and `noUnusedParameters: false` allow dead code to accumulate silently (e.g., the unused `getAnalysisByCall` import in `CallHistory.tsx`).

**Fix:** Set both to `true` in `tsconfig.json`. Fix all resulting errors (at minimum: remove the unused import in `CallHistory.tsx`).

**Acceptance:** `tsc --noEmit` passes with both flags enabled.

---

### IMP-05 — Add ESLint

**Problem:** No linter means style drift and common React mistakes go undetected.

**Fix:**
```bash
npm install -D eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh typescript-eslint
```

Create `eslint.config.js` using the flat config format with:
- `typescript-eslint` recommended rules
- `react-hooks/rules-of-hooks` and `react-hooks/exhaustive-deps`
- `react-refresh/only-export-components`

Add to `package.json` scripts:
```json
"lint": "eslint src"
```

**Acceptance:** `npm run lint` exits 0 on the current codebase (fix any violations first).

---

### IMP-06 — Fix the mock transcript in RecordCall

**Problem:** `processAudio` ignores the recorded `audioBlob` and substitutes a hardcoded Arabic conversation. The recording feature does not work.

**Fix options (choose one):**
- **Option A (preferred):** Send `audioBlob` to a Supabase Edge Function that calls a speech-to-text API (e.g., OpenAI Whisper) and returns the transcript.
- **Option B (interim):** Replace the mock with a `<textarea>` that lets the agent paste or type the transcript manually, making the flow functional without STT infrastructure.

The mock transcript block and the comment explaining it must be removed regardless of which option is chosen.

**Acceptance:** A completed call flow saves a real (or manually entered) transcript to the `calls` table.

---

### IMP-07 — Fix Auth success/error state confusion

**Problem:** In `Auth.tsx`, a successful sign-up calls `setError("تم التسجيل! ...")`. The variable is named `error` and the element has class `msg error` when `isSignUp` is false — the conditional class logic is inverted.

**Fix:** Introduce a separate `message` state (or a `{ text, type }` object) distinct from `error`. Render success messages with a success class, errors with an error class.

**Acceptance:** Sign-up success shows green/neutral styling. Sign-in errors show red styling.

---

### IMP-08 — Eliminate double auth fetch on Dashboard mount

**Problem:** `App.tsx` calls `getCurrentUser()` on mount and sets the store user. `Dashboard.tsx` also calls `getCurrentUser()` on mount and sets the store user again — a redundant network round-trip.

**Fix:** Remove the `getCurrentUser()` call from `Dashboard.tsx`. Trust the store value set by `App.tsx`. Keep the redirect to `/auth` if `user` is null (already handled by the route guard in `App.tsx`).

**Acceptance:** Network tab shows one `auth/v1/user` request on initial load, not two.

---

### IMP-09 — Fix RemindersPanel state divergence

**Problem:** `Dashboard.tsx` holds `reminders` in local state and passes it as a prop. `RemindersPanel` copies it into its own local state. After a reminder is completed, the panel's local state updates but the parent's state does not — the count in the tab badge stays stale.

**Fix:** Lift the completion handler to `Dashboard.tsx`. Pass an `onComplete` callback prop to `RemindersPanel`. The panel calls `onComplete(id)` and the parent removes the item from its state.

**Acceptance:** Completing a reminder decrements the tab badge count immediately.

---

### IMP-10 — Improve devcontainer for faster startup

**Problem:** `devcontainer.json` uses `mcr.microsoft.com/devcontainers/universal:4.0.1-noble` (~10 GB). No automations run `npm install` on environment start.

**Fix:**
1. Switch image to `mcr.microsoft.com/devcontainers/javascript-node:22`.
2. Add an Ona automation in `.gitpod.yaml` (or `devcontainer.json` `postCreateCommand`) to run `npm install` automatically.

Example `devcontainer.json` addition:
```json
"postCreateCommand": "npm install",
"forwardPorts": [5173]
```

**Acceptance:** A fresh environment is ready to `npm run dev` without manual steps. Cold start time is under 60 seconds.

---

## Priority Order

| Priority | Item | Effort |
|---|---|---|
| P0 | IMP-01 (credentials) | 15 min |
| P1 | IMP-02 (delete .js files) | 5 min |
| P1 | IMP-03 (type any params) | 1 h |
| P1 | IMP-04 (enable unused checks) | 30 min |
| P2 | IMP-05 (ESLint) | 1 h |
| P2 | IMP-07 (auth state) | 30 min |
| P2 | IMP-08 (double auth fetch) | 15 min |
| P2 | IMP-09 (reminders state) | 30 min |
| P3 | IMP-06 (real transcript) | 2–8 h |
| P3 | IMP-10 (devcontainer) | 30 min |
