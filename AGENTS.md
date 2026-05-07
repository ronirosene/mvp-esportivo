# AGENTS.md — intervals-integration / intervals-web

## Project Overview
Two projects:
1. **CLI** (TypeScript) — analyzes running data from **Intervals.icu** and generates/uploads a 5K training plan.
2. **Web App** (intervals-web/) — Express + PostgreSQL web app with JWT auth, single-page HTML/JS frontend.

## Web App Key Features (latest)
- **Planos Progressivos por Semana**: planos gerados mostram apenas a semana atual. Usuário clica "Concluir Semana e Avançar" (via `POST /plan/:id/advance-week`) para liberar a próxima, com adaptação automática baseada no % de treinos completados (<40% repete, 40-60% suave, 60-80% normal, 80%+ agressivo).
- **Chat com Botões**: chat widget renderiza opções numeradas como botões clicáveis. Sistema prompt instrui IA a usar formato `1. Opção\n2. Opção` para ativar botões.
- **Campos novos no DB**: `training_plans.current_week` (INTEGER DEFAULT 1), `training_plans.status` (TEXT DEFAULT 'active').

## Developer Commands
- `npm run dev` — Run with `ts-node --watch` (primary dev workflow)
- `npm run start` — Run once via `ts-node src/index.ts`
- `npm run build` — Compile to `dist/` via `tsc`
- **No test framework configured** — `npm test` exits with error. Do not add tests without asking.

## Web App Commands (intervals-web/)
- `npm run dev` — Run with `node --watch src/server.js`
- `npm run start` — Run once via `node src/server.js`
- No TypeScript — plain JS in `src/` with `.js` extension, CommonJS modules.

## Environment
- Copy `.env.example` to `.env` and set:
  - `INTERVALS_API_KEY` — Intervals.icu API key
  - `INTERVALS_ATHLETE_ID` — Athlete ID
- `.env` is gitignored. Never commit it.
- Env is loaded via `dotenv.config()` in each entrypoint.

## Entrypoints
- `src/index.ts` — Main: fetches 60 days of activity/fitness data, analyzes runs, generates a 4-week training plan, deletes existing workouts in the range, then uploads the new plan.
- `src/create-test-workout.ts` — Utility script: creates a single structured workout (with `workout_doc` steps) for testing device sync. Run manually via `npx ts-node src/create-test-workout.ts`.

## Architecture Notes (Web App)
- All code is in `src/` — plain JS files.
- Single module: no monorepo, no subpackages.
- Uses PostgreSQL via `pg` package, Express 5, JWT auth.
- Frontend is a single HTML file at `public/index.html` with vanilla JS.
- Output/UI is in **Portuguese**. Do not translate strings unless asked.
- CommonJS module system (`"type": "commonjs"` in package.json).

## Workflow
1. Fetches activities + fitness data for last 60 days in parallel.
2. Filters runs by type: `Run`, `TrailRun`, `VirtualRun`.
3. Computes stats (best 5K/1K, weekly mileage, interval efforts).
4. Generates training plan with 3 phases: Base → Build → Peak, every 4th week is recovery.
5. **Deletes** existing WORKOUT events in the date range before uploading new ones.
6. Uploads new plan as calendar events.
