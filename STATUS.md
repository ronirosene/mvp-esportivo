# STATUS — MVP Esportivo

## Resumo

Sistema de gestão de eventos esportivos com portal público e painel administrativo.

## URLs

| Serviço | URL |
|---------|-----|
| Site Público | https://mvp-esportivo.vercel.app |
| Agenda | https://mvp-esportivo.vercel.app/agenda |
| Admin (login) | https://mvp-esportivo.vercel.app/login |
| API | https://mvp-backend-little-woodland-6494.fly.dev |
| Health | https://mvp-backend-little-woodland-6494.fly.dev/api/v1/health |

## Features Implementadas

### Portal Público (sem login)
- Landing page com eventos por status e Jogos de Hoje
- Lista de eventos
- Detalhe do evento (modalidades, cidades, jogos)
- Detalhe da modalidade (grupos, classificação, jogos, mata-mata)
- Chaveamento visual (bracket com SVG connectors)
- Agenda oficial com abas (Hoje, Próximos, Resultados) e filtros

### Admin (requer login)
- CRUD de eventos
- CRUD de cidades
- Vínculo de modalidades por evento
- Inscrição de cidades em modalidades
- Geração automática de grupos (round-robin)
- Modo manual para grupos, participantes e partidas
- Edição inline de placares
- Classificação (GroupStanding)
- Configuração de formato (CompetitionFormat)
- Geração e avanço de mata-mata (quartas/semifinal/final)

## Acesso Admin
- **Login**: https://mvp-esportivo.vercel.app/login
- **Email**: admin@admin.com
- **Senha**: 123456

## Status dos Serviços

| Serviço | Status | Última Atualização |
|---------|--------|-------------------|
| Frontend (Vercel) | ✅ OK | 17/06/2026 |
| Backend (Fly.io) | ✅ OK | 17/06/2026 |
| Banco (Neon) | ✅ OK | 17/06/2026 |
| CI/CD | ✅ OK | 17/06/2026 |

## MVP Concluídos

- ✅ MVP 1 — Auth + Eventos
- ✅ MVP 2 — Docker + Deploy
- ✅ MVP 3 — CI/CD
- ✅ MVP 4 — Frontend Eventos
- ✅ MVP 5 — Modalidades por Evento
- ✅ MVP 6 — Cidades CRUD
- ✅ MVP 7 — Inscrição de Cidades
- ✅ MVP 8 — Grupos (Round-Robin)
- ✅ MVP 8.5 — Modo Manual
- ✅ MVP 9 — Partidas
- ✅ MVP 10 — Classificação
- ✅ MVP 11 — CompetitionFormat + Fase Eliminatória
- ✅ MVP 12 — Classificados e Mata-Mata Automático
- ✅ MVP 13 — Portal Público
- ✅ MVP 14 — Chaveamento Visual (Bracket)
- ✅ MVP 14.1 — Agenda Oficial

## Próximos Passos

- Importação por planilha (CSV/Excel)
- Chaveamento personalizado (drag-and-drop)
- Tela de configuração dedicada
- Notificações e placar ao vivo
