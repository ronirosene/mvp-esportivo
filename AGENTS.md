# AGENTS.md — MVP Esportivo

## Project Overview
Monorepo (backend/ + frontend/) — sistema de gestão de eventos esportivos com autenticação JWT, CRUD de eventos/modalidades/cidades/participantes, geração automática de grupos e partidas.

## Stack
- **Backend:** NestJS 10, Prisma 5, PostgreSQL 16, JWT (Passport + bcrypt)
- **Frontend:** Next.js 14, Tailwind CSS 3, Shadcn/UI
- **Deploy:** Fly.io (backend), Vercel (frontend), Neon (banco)
- **GitHub:** `github.com/ronirosene/mvp-esportivo` (branch `master`)

## Developer Commands
### Backend (backend/)
- `npm run start` — `nest start`
- `npm run dev` — `nest start --watch`
- `npm run build` — `nest build`
- `npx prisma generate` — Regenerate Prisma client after schema changes
- `npx prisma migrate deploy` — Apply pending migrations (target Neon via DATABASE_URL)
- `npx prisma db seed` — Seed DB (ts-node, idempotent)
- `npx nest build` — Compile TypeScript
- `flyctl deploy --remote-only` — Deploy to Fly.io (from backend/ directory)

### Frontend (frontend/)
- `npm run dev` — Next.js dev server
- `npm run build` — Build for production
- `npm run start` — Start production server

## Environment
- Copy `backend/.env.example` to `backend/.env` for local dev (postgresql://localhost:5432/mvpdatabase)
- Production secrets set via `fly secrets set` on Fly.io:
  - `DATABASE_URL` — Neon connection string
  - `JWT_SECRET` — JWT signing secret
  - `FRONTEND_URL` — `https://mvp-esportivo.vercel.app`
- `.env` is gitignored. Never commit it.

## Architecture
### Schema (10 models, 5 enums)
- **User** — ADMIN/ORGANIZADOR, JWT auth
- **Event** — nome, ano, cidadeSede, dataInicio/Fim, status
- **Sport** — nome, categoria
- **EventSport** — junction Event<->Sport with unique constraint
- **EventSportCity** — city enrollment in a sport modality with InscricaoStatus
- **City** — nome, estado, siglaEstado (unique [nome, siglaEstado])
- **Team** — legacy (eventId + cityId + sportId)
- **Group** — linked to EventSport, auto-generated via round-robin
- **GroupParticipant** — links Group to EventSportCity (unique per city)
- **Match** — linked to Group + EventSport + City (home/away), scores, status SCHEDULED/IN_PROGRESS/FINISHED/CANCELLED

### Enums
- `Role`: ADMIN, ORGANIZADOR
- `EventStatus`: PLANEJAMENTO, EM_ANDAMENTO, FINALIZADO
- `InscricaoStatus`: INSCRITO, CONFIRMADO, DESISTENTE
- `MatchStatus`: SCHEDULED, IN_PROGRESS, FINISHED, CANCELLED
- `Fase`: GRUPOS, QUARTAS, SEMIFINAL, FINAL, TERCEIRO_LUGAR

## MVP Progress
### Done
- **MVP 1**: Monorepo setup, NestJS + Next.js + Prisma + PostgreSQL, Event CRUD, JWT auth
- **MVP 2**: Dockerfiles (node:20-slim + OpenSSL), Fly.io deploy, Neon DB, healthcheck
- **MVP 3**: CI/CD GitHub Actions (backend.yml, frontend.yml)
- **MVP 4**: Frontend completo (Tailwind + Shadcn), login, eventos CRUD UI
- **MVP 5** — EventSports (modalidades por evento): migration 0002, módulo event-sports, frontend add/remove
- **MVP 6** — Cities CRUD: migration 0003, módulo cities, frontend /cities (list/new/edit)
- **MVP 7** — EventSportCity (inscrição de cidades): migration 0004, módulo event-sport-cities, participantes inline no evento
- **MVP 8** — Grupos: migration 0005 (Group redesign + GroupParticipant), módulo groups, shuffle+round-robin, frontend gerar/regerar
- **MVP 9** — Partidas: migration 0006 (Match redesign + MatchStatus enum), módulo matches, round-robin match generation, frontend com edição inline de placares

### In Progress
- (none)

### Blocked
- (none)

## Key Decisions
- `node:20-slim` (Debian) instead of `node:20-alpine` to avoid Prisma OpenSSL detection issues
- Prisma client generated in build stage with OpenSSL installed; runtime also has OpenSSL
- API URL hardcoded in Next.js rewrite (not via NEXT_PUBLIC_API_URL)
- Seed is idempotent: deleteMany in reverse dependency order before create
- Match model uses City references directly (homeCityId/awayCityId) instead of Team references
- Group model references EventSport directly (not Event + Sport separately)
- All UUIDs generated in application layer (not DB)

## Relevant Backend Files
- `backend/prisma/schema.prisma` — Full schema (10 models, 5 enums)
- `backend/prisma/seed.ts` — Idempotent seed with admin + sample data
- `backend/src/modules/events/` — Event CRUD
- `backend/src/modules/event-sports/` — Sport-event linking
- `backend/src/modules/cities/` — City CRUD
- `backend/src/modules/event-sport-cities/` — City enrollment in sports
- `backend/src/modules/groups/` — Group generation
- `backend/src/modules/matches/` — Match generation + score editing
- `backend/src/modules/auth/` — JWT auth
- `backend/Dockerfile` — Multi-stage with node:20-slim
- `backend/fly.toml` — Fly.io config (app mvp-backend-little-woodland-6494, region gru)

## Relevant Frontend Files
- `frontend/src/app/events/[id]/page.tsx` — Event detail with sports/participants/groups
- `frontend/src/app/events/[id]/sports/[eventSportId]/cities/new/page.tsx` — Add city to sport
- `frontend/src/app/events/[id]/sports/[eventSportId]/groups/[groupId]/page.tsx` — Group matches page
- `frontend/src/app/cities/` — Cities CRUD pages
- `frontend/src/services/` — API services (api.ts, events.ts, event-sports.ts, cities.ts, event-sport-cities.ts, event-sport-groups.ts, matches.ts)

## URLs
- Backend: `https://mvp-backend-little-woodland-6494.fly.dev`
- Frontend: `https://mvp-esportivo.vercel.app`
- Health: `https://mvp-backend-little-woodland-6494.fly.dev/api/v1/health`
- Neon: `ep-tiny-moon-acrrprlb.sa-east-1.aws.neon.tech`

## Known Issues / Notes
- Port 3001 can stay occupied locally; use `Get-Process -Name node | Stop-Process -Force`
- `flyctl deploy` requires long timeouts (600s+)
- Vercel auto-deploys on push to master (GitHub integration)
- Shell tool struggles with inline PowerShell scripts — prefer writing .cjs files for complex Node.js scripts
- `cmd /c` needed for chaining commands (PowerShell `&&` not available in PS 5.1)
