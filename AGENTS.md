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
### Schema (12+ models, 10 enums)
- **User** — ADMIN/ORGANIZADOR, JWT auth
- **Event** — nome, ano, cidadeSede, dataInicio/Fim, status
- **Sport** — nome (unique), ativo
- **EventSport** — junction Event<->Sport with gender + ageCategory + displayName, unique [eventId, sportId, gender, ageCategory], drawMode (AUTOMATICO/MANUAL)
- **EventSportCity** — city enrollment in a sport modality with InscricaoStatus
- **City** — nome, estado, siglaEstado (unique [nome, siglaEstado])
- **CompetitionFormat** — 1:1 with EventSport, FormatType (GROUP_STAGE/ROUND_ROBIN/KNOCKOUT/MANUAL)
- **Group** — linked to EventSport, auto via round-robin or manual
- **GroupParticipant** — links Group to EventSportCity (unique per city)
- **GroupStanding** — classification per group
- **Match** — linked to Group + EventSport + City (home/away), scores, status SCHEDULED/IN_PROGRESS/FINISHED/CANCELLED/AWAITING_PREVIOUS_MATCH
- **Champion** — city champion history per eventSport, unique [eventSportId, position], auto-registered when FINAL/TERCEIRO_LUGAR finished
- **Team** — legacy

### Enums
- `Role`: ADMIN, ORGANIZADOR
- `EventStatus`: PLANEJAMENTO, EM_ANDAMENTO, FINALIZADO
- `InscricaoStatus`: INSCRITO, CONFIRMADO, DESISTENTE
- `MatchStatus`: SCHEDULED, IN_PROGRESS, FINISHED, CANCELLED, AWAITING_PREVIOUS_MATCH
- `Fase`: GRUPOS, QUARTAS, SEMIFINAL, FINAL, TERCEIRO_LUGAR
- `DrawMode`: AUTOMATICO, MANUAL
- `FormatType`: GROUP_STAGE, ROUND_ROBIN, KNOCKOUT, MANUAL
- `Gender`: MASCULINO, FEMININO, MISTO, OPEN
- `AgeCategory`: LIVRE, SUB_14, SUB_16, SUB_18, SUB_20, VETERANO, MASTER

## MVP Progress
### Done
- **MVP 1**: Monorepo setup, NestJS + Next.js + Prisma + PostgreSQL, Event CRUD, JWT auth
- **MVP 2**: Dockerfiles (node:20-slim + OpenSSL), Fly.io deploy, Neon DB, healthcheck
- **MVP 3**: CI/CD GitHub Actions (backend.yml, frontend.yml)
- **MVP 4**: Frontend completo (Tailwind + Shadcn), login, eventos CRUD UI
- **MVP 5** — EventSports (modalidades por evento): migration 0002, mod event-sports, frontend add/remove
- **MVP 6** — Cities CRUD: migration 0003, mod cities, frontend /cities (list/new/edit)
- **MVP 7** — EventSportCity (inscricao de cidades): migration 0004, frontend inline no evento
- **MVP 8** — Grupos: migration 0005, shuffle+round-robin, gerar/regerar
- **MVP 9** — Partidas: migration 0006, round-robin match generation, edicao inline de placares
- **MVP 8.5** — Modo Manual: migration 0010 (DrawMode), grupos manuais, participantes manuais, partidas manuais
- **MVP 10** — Classificacao: GroupStanding, criterios pontos/saldo/gols, tabela na pagina do grupo
- **MVP 11** — CompetitionFormat: migration 0011 (FormatType), mod competition-formats, frontend modal config
- **MVP 11** — Fase Eliminatoria: migrations 0008/0009, playoffs service (generate/advance), quartas/semifinal/final
- **MVP 12** — Classificados e Mata-Mata Automatico: migration 0012, playoffs reescrito, bracket visual com status
- **MVP 13** — Portal Publico: layout condicional, landing page, eventos/evento/modalidade publicas, SEO
- **MVP 14** — Chaveamento Visual (Bracket): GET /event-sports/:id/playoffs/bracket, BracketView component com SVG lines, modal match details, /mata-mata page
- **MVP 14.1** — Agenda Oficial: backend module public-schedule (today/upcoming/results/filter), /agenda page with tabs, ScheduleCard/ScheduleFilters, Jogos de Hoje na home
- **MVP 16** — Histórico de Campeões: Champion model, auto-registro ao encerrar FINAL/TERCEIRO_LUGAR, /historico público com filtros, aba Histórico na página da modalidade
- **MVP 17** — Página da Cidade e Estatísticas Históricas: city-history module (4 endpoints públicos), /cidades list+detail pages, links clicáveis em toda aplicação, SEO dinâmico
- **MVP 18** — Ranking Histórico das Cidades: ranking module (GET /public/ranking com filtros), /ranking page com tabela + destaques visuais + critério de pontuação 5/3/1, link na página da cidade, Top 5 na home
- **MVP 19** — Patrocinadores e Anúncios: Sponsor model + migration 0016, módulo sponsors (CRUD admin + GET /public/sponsors + views/clicks), CRUD admin (/sponsors), SponsorsBar component exibido em home/evento/agenda/ranking, rel=nofollow sponsored

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
- Portal publico usa o mesmo api helper (silent token forwarding), todos GETs sao publicos
- Rotas publicas em portugues (/eventos/*) para nao conflitar com admin em ingles (/events/*)
- Layout condicional via usePathname() no RootLayout sem route groups

## Relevant Backend Files
- `backend/prisma/schema.prisma` — Full schema (12 models, 8 enums)
- `backend/prisma/seed.ts` — Idempotent seed with admin + sample data
- `backend/src/modules/events/` — Event CRUD
- `backend/src/modules/event-sports/` — Sport-event linking + SportsController (/sports)
- `backend/src/modules/cities/` — City CRUD
- `backend/src/modules/event-sport-cities/` — City enrollment in sports
- `backend/src/modules/groups/` — Group generation (auto + manual)
- `backend/src/modules/matches/` — Match generation + score editing
- `backend/src/modules/standings/` — GroupStanding CRUD
- `backend/src/modules/playoffs/` — Playoffs generation + advancement + bracket endpoint
- `backend/src/modules/competition-formats/` — Format config (GROUP_STAGE, etc.)
- `backend/src/modules/public-schedule/` — Public schedule (today/upcoming/results/filter)
- `backend/src/modules/city-history/` — Public city history/stats endpoints
- `backend/src/modules/ranking/` — Public ranking endpoint
- `backend/src/modules/sponsors/` — Sponsor CRUD + public endpoint
- `backend/src/modules/auth/` — JWT auth
- `backend/Dockerfile` — Multi-stage with node:20-slim
- `backend/fly.toml` — Fly.io config (app mvp-backend-little-woodland-6494, region gru)

## Relevant Frontend Files
- `frontend/src/app/layout.tsx` — Root layout with conditional public/admin rendering, "Ranking" link in nav
- `frontend/src/app/page.tsx` — Landing page publica com eventos + Jogos de Hoje
- `frontend/src/app/eventos/` — Rotas publicas (/eventos, /eventos/[id], /eventos/[id]/modalidades/[id], /mata-mata)
- `frontend/src/app/agenda/` — Pagina publica de agenda com abas e filtros
- `frontend/src/app/sponsors/` — Admin: Sponsor CRUD pages
- `frontend/src/app/events/[id]/page.tsx` — Admin: event detail with sports/participants/groups/playoffs
- `frontend/src/app/cities/` — Admin: Cities CRUD pages
- `frontend/src/components/bracket-view.tsx` — Visual bracket component with SVG connectors
- `frontend/src/app/cidades/` — Public city list + detail pages with history/stats
- `frontend/src/components/schedule-card.tsx` — Match card for schedule
- `frontend/src/components/schedule-filters.tsx` — Filters for schedule
- `frontend/src/services/` — API services

## URLs
- **Frontend (publico)**: `https://mvp-esportivo.vercel.app`
- **Backend (API)**: `https://mvp-backend-little-woodland-6494.fly.dev`
- **Health**: `https://mvp-backend-little-woodland-6494.fly.dev/api/v1/health`
- **Admin**: `https://mvp-esportivo.vercel.app/login`
- **Agenda Publica**: `https://mvp-esportivo.vercel.app/agenda`
- **GitHub**: `github.com/ronirosene/mvp-esportivo` (branch `master`)
- **Neon**: `ep-tiny-moon-acrrprlb.sa-east-1.aws.neon.tech`

## Known Issues / Notes
- Port 3001 can stay occupied locally; use `Get-Process -Name node | Stop-Process -Force`
- `flyctl deploy` requires long timeouts (600s+)
- Vercel auto-deploys on push to master (GitHub integration)
- Shell tool struggles with inline PowerShell scripts — prefer writing .cjs files for complex Node.js scripts
- `cmd /c` needed for chaining commands (PowerShell `&&` not available in PS 5.1)
- Encodings corrompidos em arquivos editados pelo edit tool (acentos substituidos por ?); usar Node.js scripts
- Arquivo build_complete_page.js em C:\\TEMP\\opencode\\ para reconstruir page.tsx sem corromper encoding
