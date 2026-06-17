# MVP Esportivo

Sistema de gestão de eventos esportivos.

## Stack

- **Frontend:** Next.js 14, Tailwind CSS, Shadcn/UI
- **Backend:** NestJS 10, Prisma 5, PostgreSQL 16
- **Auth:** JWT (Passport), bcrypt

## Deploy

| Serviço | Plataforma | Link |
|---------|-----------|------|
| Frontend | Vercel | *(criar projeto na Vercel)* |
| Backend | Fly.io | `https://mvp-backend-little-woodland-6494.fly.dev` |
| Banco | Neon | `ep-tiny-moon-acrrprlb.sa-east-1.aws.neon.tech` |

---

## Pré-requisitos

- Node.js 20+
- Docker (opcional, para dev local)
- Contas em: [Neon](https://neon.tech), [Fly.io](https://fly.io), [Vercel](https://vercel.com)

---

## Neon (Banco PostgreSQL)

1. Crie uma conta em [neon.tech](https://neon.tech)
2. Crie um projeto (qualquer nome, região mais próxima)
3. Na aba **Connection Details**, copie a `DATABASE_URL` (Pooled ou Unpooled)
4. Salve a string — ela será usada no Fly.io e nos secrets do GitHub

```bash
# Exemplo de DATABASE_URL
DATABASE_URL="postgresql://user:pass@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### Migrations

Execute da sua máquina local, apontando `DATABASE_URL` para o Neon:

```bash
cd backend
DATABASE_URL="<sua-url-do-neon>" npx prisma migrate deploy
```

### Seed

O seed usa `ts-node` (devDependency). Execute localmente com a mesma `DATABASE_URL`:

```bash
cd backend
DATABASE_URL="<sua-url-do-neon>" npx prisma db seed
```

---

## Backend (Fly.io)

### 1. Instalar Fly CLI

```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Linux/macOS
curl -L https://fly.io/install.sh | sh
```

### 2. Login e criar app

```bash
fly auth login
cd backend
fly launch --no-deploy
```

Responda:
- Nome: `mvp-backend` (ou outro)
- Região: `gru` (São Paulo) ou a mais próxima
- Responda **Y (Yes)** para manter o `fly.toml` existente

### 3. Configurar secrets

```bash
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set JWT_SECRET="<hash-seguro>"
fly secrets set FRONTEND_URL="https://<projeto>.vercel.app"
```

### 4. Deploy manual

```bash
fly deploy
```

### Healthcheck

Após o deploy, acesse:

```
GET https://<app>.fly.dev/api/v1/health
```

Resposta esperada:
```json
{ "status": "ok", "database": "connected", "uptime": 42, "timestamp": "..." }
```

---

## Frontend (Vercel)

### 1. Criar projeto na Vercel

- Importe o repositório do GitHub
- Framework: **Next.js**
- Root directory: `frontend/`
- Build command: `npm run build`
- Output directory: `.next`

### 2. Variáveis de ambiente

| Nome | Valor |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://<app>.fly.dev` |

### 3. Deploy automático

Push na branch `main` → Vercel detecta e faz deploy automático.

---

## CI/CD (GitHub Actions)

### Secrets necessários

No repositório GitHub → Settings → Secrets and variables → Actions:

| Secret | Descrição |
|--------|-----------|
| `FLY_API_TOKEN` | Token de deploy do Fly.io (`fly tokens create deploy`) |
| `VERCEL_TOKEN` | Token da Vercel (Account → Settings → Tokens) |
| `VERCEL_ORG_ID` | ID da organização na Vercel |
| `VERCEL_PROJECT_ID` | ID do projeto na Vercel |
| `NEXT_PUBLIC_API_URL` | URL do backend em produção |

### Fluxo

Push na `main` (com alterações em `backend/` ou `frontend/`):
1. Build e validação
2. Deploy automático (Fly.io para backend, Vercel para frontend)

---

## Checklist Produção — Status Atual

- [x] 1. Criar banco Neon e copiar `DATABASE_URL`
- [x] 2. Configurar Fly.io: `fly launch --no-deploy` no `backend/`
- [ ] 3. Configurar Vercel: importar repositório, apontar `frontend/`
- [ ] 4. Adicionar secrets no GitHub:
  - `FLY_API_TOKEN`
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
  - `NEXT_PUBLIC_API_URL`
- [x] 5. Adicionar secrets no Fly.io:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `FRONTEND_URL` *(pendente — definir após Vercel)*
- [ ] 6. Adicionar variável na Vercel:
  - `NEXT_PUBLIC_API_URL` = `https://mvp-backend-little-woodland-6494.fly.dev`
- [x] 7. Executar primeiro deploy manual do backend (`fly deploy`)
- [x] 8. Executar `npx prisma migrate deploy` no banco Neon
- [x] 9. Executar `npx prisma db seed` para criar admin (`admin@admin.com` / `123456`)
- [x] 10. Verificar healthcheck: `GET /api/v1/health` → `{"status":"ok","database":"connected"}`
- [x] 11. Testar login: `POST /api/v1/auth/login` → token JWT recebido
