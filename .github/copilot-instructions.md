# Copilot Instructions for FITProve v2

## Project Overview
- **Frontend:** Vite + React + TypeScript (see `src/`)
- **Styling:** Tailwind CSS
- **Backend:** Supabase (SQL, RLS policies, see `*.sql` and migration scripts)
- **Testing:** Vitest + Testing Library
- **PWA:** Vite PWA Plugin
- **CI/CD:** GitHub Actions

## Key Workflows
- **Start dev server:** `npm run dev` (Vite, hot reload)
- **Build:** `npm run build` (TypeScript + Vite)
- **Type check:** `npm run typecheck`
- **Lint:** `npm run lint`
- **Test:** `npm run test` or `npm run test:watch`
- **Format:** `npm run format`
- **Preview production build:** `npm run preview`
- **Database migration:** See `MIGRATION_INSTRUCTIONS.md` and scripts in `/scripts` (manual SQL or `npx ts-node apply-migration.ts`)

## Architecture & Patterns
- **Exercise Library:**
  - Data in `src/data/exerciseLibrary.ts` (JS/TS objects) and large JSONs in `scripts/exercise-import/`
  - UI in `src/components/ui/ExerciseDetailModal.tsx` (tabbed, expandable sections)
  - Data fields: `instructions`, `tips`, `common_mistakes`, `variations`, `recommended_sets`, etc.
- **Database:**
  - Supabase SQL migrations in root and `/scripts` (see `badges-*.sql`, `manual-*.sql`, etc.)
  - RLS policies: critical for all API access (see `setup-rls-policies.sql`)
- **Testing:**
  - Use Vitest for unit/integration tests (see `test-*` files)
  - Test data and mocks may be in `/scripts` or inline
- **PWA:**
  - Service worker and manifest handled by Vite PWA plugin

## Project Conventions
- **TypeScript strict mode enforced**
- **Conventional Commits** for PRs
- **Document new features in `/docs` (planned)**
- **Sensitive data:** Never commit `.env` or secrets
- **All API calls must respect RLS**

## Integration Points
- **Supabase:** Auth, DB, RLS (see `.env.example` for config)
- **YouTube:** Video integration in exercise modals
- **Community features:** Like/comment/follow (see `src/pages/HelpPage.tsx` for user guidance)

## Examples
- See `src/components/ui/ExerciseDetailModal.tsx` for UI/UX patterns
- See `src/data/exerciseLibrary.ts` for data structure
- See `MIGRATION_INSTRUCTIONS.md` for DB migration workflow

---

**When in doubt, prefer existing patterns and reference the files above.**
