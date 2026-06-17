# MVP Esportivo

Sistema de gestão de eventos esportivos — autenticação JWT, CRUD de eventos/modalidades/cidades/participantes, geração automática de grupos e partidas.

## Stack

- **Frontend:** Next.js 14, Tailwind CSS 3, Shadcn/UI
- **Backend:** NestJS 10, Prisma 5, PostgreSQL 16
- **Auth:** JWT (Passport), bcrypt

## Deploy

| Serviço | Plataforma | Link |
|---------|-----------|------|
| Frontend | Vercel | `https://mvp-esportivo.vercel.app` |
| Backend | Fly.io | `https://mvp-backend-little-woodland-6494.fly.dev` |
| Banco | Neon | `ep-tiny-moon-acrrprlb.sa-east-1.aws.neon.tech` |

---

## Pré-requisitos

- Node.js 20+
- Contas em: [Neon](https://neon.tech), [Fly.io](https://fly.io), [Vercel](https://vercel.com)

---

## Neon (Banco PostgreSQL)

1. Crie uma conta em [neon.tech](https://neon.tech)
2. Crie um projeto
3. Na aba **Connection Details**, copie a `DATABASE_URL`
4. Use nos secrets do Fly.io e nos comandos locais

```bash
DATABASE_URL="postgresql://user:pass@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### Migrations

```bash
cd backend
set DATABASE_URL="<url-neon>"&& npx prisma migrate deploy
```

### Seed

```bash
cd backend
set DATABASE_URL="<url-neon>"&& npx prisma db seed
```

O seed cria admin `admin@admin.com` / `123456` (idempotente).

---

## Backend (Fly.io)

```bash
cd backend
flyctl deploy --remote-only
```

### Secrets

```bash
fly secrets set DATABASE_URL="<neon-url>"
fly secrets set JWT_SECRET="<hash>"
fly secrets set FRONTEND_URL="https://mvp-esportivo.vercel.app"
```

### Healthcheck

```
GET https://mvp-backend-little-woodland-6494.fly.dev/api/v1/health
```

```json
{ "status": "ok", "database": "connected", "uptime": 42, "timestamp": "..." }
```

---

## Frontend (Vercel)

- Repositório GitHub → Vercel (importar)
- Root directory: `frontend/`
- Framework: Next.js
- Build command: `npm run build`
- Deploy automático via push na `master`

---

## Features Implementadas

### MVP 1 — Auth + Eventos
- JWT login, CRUD de eventos, Swagger

### MVP 2 — Docker + Deploy
- Dockerfile node:20-slim, Fly.io deploy, Neon DB, healthcheck

### MVP 3 — CI/CD
- GitHub Actions: build + deploy automático (Fly.io backend, Vercel frontend)

### MVP 4 — Frontend Eventos
- Tailwind + Shadcn, login, eventos CRUD UI

### MVP 5 — Modalidades por Evento
- Vincular/desvincular esportes a eventos

### MVP 6 — Cidades CRUD
- CRUD completo de cidades com nome/estado/UF

### MVP 7 — Inscrição de Cidades
- Inscrever cidades em modalidades com status INSCRITO/CONFIRMADO/DESISTENTE

### MVP 8 — Grupos
- Geração automática round-robin com shuffle
- Distribuição equilibrada, regerar com confirmação

### MVP 9 — Partidas
- Geração round-robin de confrontos dentro dos grupos
- Edição inline de placares (homeScore x awayScore)
- Status SCHEDULED / IN_PROGRESS / FINISHED / CANCELLED

### MVP 10 — Classificação
- GroupStanding com critérios: pontos → saldo → gols pró
- Tabela na página do grupo

### MVP 11 — CompetitionFormat + Fase Eliminatória
- Configuração de formato por modalidade (GROUP_STAGE, ROUND_ROBIN, KNOCKOUT, MANUAL)
- Geração de quartas/semifinal/final + terceiro lugar

### MVP 12 — Mata-Mata Automático
- Avanço automático QUARTAS → SEMIFINAL → FINAL
- Partidas com status AWAITING_PREVIOUS_MATCH

### MVP 13 — Portal Público
- Layout condicional (público vs admin)
- Landing page, eventos, modalidades públicas

### MVP 14 — Chaveamento Visual
- BracketView com SVG connectors
- Modal com detalhes da partida
- /mata-mata por modalidade

### MVP 14.1 — Agenda Oficial
- /agenda com abas Hoje/Próximos/Resultados
- ScheduleCard com status badges (AO VIVO, FINALIZADO, EM BREVE)
- Filtros por cidade, modalidade, evento, status, busca textual
- Seção Jogos de Hoje na home

---

## Rotas da API

### Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/v1/auth/register` | Registrar |
| POST | `/api/v1/auth/login` | Login |

### Events
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/events` | Listar |
| GET | `/api/v1/events/:id` | Detalhar |
| POST | `/api/v1/events` | Criar |
| PUT | `/api/v1/events/:id` | Atualizar |
| DELETE | `/api/v1/events/:id` | Remover |

### Sports
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/sports` | Listar modalidades |

### Event-Sports
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/events/:id/sports` | Modalidades do evento |
| POST | `/api/v1/events/:id/sports` | Vincular |
| DELETE | `/api/v1/events/:id/sports/:sportId` | Desvincular |

### Cities
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/cities` | Listar |
| GET | `/api/v1/cities/:id` | Detalhar |
| POST | `/api/v1/cities` | Criar |
| PUT | `/api/v1/cities/:id` | Atualizar |
| DELETE | `/api/v1/cities/:id` | Remover |

### Event-Sport-Cities
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/event-sports/:id/cities` | Cidades inscritas |
| POST | `/api/v1/event-sports/:id/cities` | Inscrever cidade |
| DELETE | `/api/v1/event-sports/:id/cities/:cityId` | Remover inscrição |

### Groups
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/event-sports/:id/groups` | Listar grupos |
| POST | `/api/v1/event-sports/:id/groups/generate` | Gerar grupos |
| DELETE | `/api/v1/event-sports/:id/groups` | Excluir grupos |

### Matches
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/groups/:id/matches` | Listar partidas |
| POST | `/api/v1/groups/:id/matches/generate` | Gerar partidas |
| DELETE | `/api/v1/groups/:id/matches` | Excluir partidas |
| PUT | `/api/v1/matches/:id` | Atualizar partida |

### Playoffs
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/event-sports/:id/playoffs` | Listar confrontos |
| GET | `/api/v1/event-sports/:id/playoffs/bracket` | Bracket estruturado |
| POST | `/api/v1/event-sports/:id/playoffs/generate` | Gerar fase |
| POST | `/api/v1/event-sports/:id/playoffs/advance` | Avançar fase |

### Public Schedule
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/public/schedule/today` | Jogos de hoje |
| GET | `/api/v1/public/schedule/upcoming` | Próximos 7 dias |
| GET | `/api/v1/public/schedule/results` | Últimos resultados |
| GET | `/api/v1/public/schedule` | Com filtros |

---

## Checklist Produção

- [x] 1. Banco Neon criado
- [x] 2. Fly.io configurado
- [x] 3. Vercel configurado (`mvp-esportivo.vercel.app`)
- [x] 4. Secrets Fly.io: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`
- [x] 5. Migrations aplicadas (0001 a 0012)
- [x] 6. Seed executado
- [x] 7. Healthcheck: `database: "connected"`
- [x] 8. CI/CD GitHub Actions configurado

## Páginas Públicas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page com eventos + Jogos de Hoje |
| `/eventos` | Lista de todos os eventos |
| `/eventos/[id]` | Detalhe do evento |
| `/eventos/[id]/modalidades/[id]` | Grupos, classificação, jogos, mata-mata |
| `/eventos/[id]/modalidades/[id]/mata-mata` | Chaveamento visual (bracket) |
| `/agenda` | Agenda oficial (Hoje/Próximos/Resultados) |

## Páginas Admin

| Rota | Descrição |
|------|-----------|
| `/login` | Login |
| `/events` | CRUD de eventos |
| `/cities` | CRUD de cidades |
