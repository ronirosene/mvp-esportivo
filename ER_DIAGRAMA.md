# Diagrama ER — MVP 1

```
┌─────────────────────────────────────────────────────────────┐
│                        User                                  │
├─────────────────────────────────────────────────────────────┤
│  id          UUID  PK                                       │
│  nome        String                                         │
│  email       String  UK                                     │
│  senha       String                                         │
│  role        Role  (ADMIN | ORGANIZADOR)                    │
│  createdAt   DateTime                                       │
│  updatedAt   DateTime                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         Event                                │
├─────────────────────────────────────────────────────────────┤
│  id           UUID  PK                                      │
│  nome         String                                        │
│  ano          Int                                           │
│  cidadeSede   String                                        │
│  dataInicio   Date                                          │
│  dataFim      Date                                          │
│  status       EventStatus                                   │
│              (PLANEJAMENTO | EM_ANDAMENTO | FINALIZADO)     │
│  logoUrl      String?                                       │
│  createdAt    DateTime                                      │
│  updatedAt    DateTime                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │ 1
                       │
          ┌────────────┼────────────────┐
          │            │                │
          ▼ N          ▼ N              ▼ N
   ┌────────────┐ ┌──────────┐ ┌──────────────┐
   │   Team     │ │  Group   │ │   Match      │
   ├────────────┤ ├──────────┤ ├──────────────┤
   │ id    PK   │ │ id   PK  │ │ id      PK   │
   │ eventId FK │ │ nome     │ │ eventId  FK  │
   │ cityId  FK │ │ eventId  │ │ sportId  FK  │
   │ sportId FK │ │ sportId  │ │ teamAId  FK  │
   │ createdAt  │ │ createdAt│ │ teamBId  FK  │
   └──────┬─────┘ └──────────┘ │ placarA  Int?│
          │                    │ placarB  Int?│
          │ N                  │ dataHora     │
          │                    │ local    Str?│
          ▼ 1                  │ status       │
   ┌────────────┐              │ fase         │
   │   City     │              │ createdAt    │
   ├────────────┤              └──────────────┘
   │ id    PK   │
   │ nome       │    ┌──────────────┐
   │ estado     │    │   Sport      │
   │ brasaoUrl? │    ├──────────────┤
   │ createdAt  │    │ id      PK   │
   └────────────┘    │ nome         │
                     │ categoria    │
                     │ createdAt    │
                     └──────────────┘

## Relacionamentos

| De       | Para     | Tipo   | Chave Estrangeira     | ON DELETE |
|----------|----------|--------|----------------------|-----------|
| Event    | Team     | 1:N    | Team.eventId         | CASCADE   |
| Event    | Group    | 1:N    | Group.eventId        | CASCADE   |
| Event    | Match    | 1:N    | Match.eventId        | CASCADE   |
| Sport    | Team     | 1:N    | Team.sportId         | RESTRICT  |
| Sport    | Group    | 1:N    | Group.sportId        | RESTRICT  |
| Sport    | Match    | 1:N    | Match.sportId        | RESTRICT  |
| City     | Team     | 1:N    | Team.cityId          | RESTRICT  |
| Team (A) | Match    | 1:N    | Match.teamAId        | RESTRICT  |
| Team (B) | Match    | 1:N    | Match.teamBId        | RESTRICT  |

## Regras de Negócio

1. Uma **cidade** pode participar de várias **modalidades** em um mesmo evento
2. Cada **modalidade** pertence a um **evento**
3. Uma **partida** sempre envolve dois **times** (teamA e teamB)
4. Ao deletar um **evento**, todos os times, grupos e partidas vinculados são removidos (CASCADE)
5. Os **times**, **grupos** e **partidas** são unicos por evento + esporte
6. **Enums** definidos no schema: `Role`, `EventStatus`, `MatchStatus`, `Fase`

## Fases da Partida (enum Fase)

- `GRUPOS` → fase de grupos
- `QUARTAS` → quartas de final
- `SEMIFINAL` → semifinal
- `FINAL` → final
- `TERCEIRO_LUGAR` → disputa de terceiro lugar
```
