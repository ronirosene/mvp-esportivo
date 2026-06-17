# Diagrama ER — MVP Esportivo

```
┌──────────────────────────────────┐
│              User                │
├──────────────────────────────────┤
│  id         UUID  PK             │
│  nome       String               │
│  email      String  UK           │
│  senha      String               │
│  role       Role                 │
│  createdAt  DateTime             │
│  updatedAt  DateTime             │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│             Event                │
├──────────────────────────────────┤
│  id          UUID  PK            │
│  nome        String              │
│  ano         Int                 │
│  cidadeSede  String              │
│  dataInicio  Date                │
│  dataFim     Date                │
│  status      EventStatus         │
│  logoUrl     String?             │
│  createdAt   DateTime            │
│  updatedAt   DateTime            │
└──────────┬───────────────────────┘
           │ 1
           │
           ▼ N
┌──────────────────────────────────┐
│          EventSport              │
├──────────────────────────────────┤
│  id         UUID  PK             │
│  eventId    UUID  FK             │
│  sportId    UUID  FK             │
│  createdAt  DateTime             │
│  UK(eventId, sportId)            │
└──────┬───────────────────────────┘
       │ 1
       ├──────────────────┬──────────────────┐
       ▼ N                ▼ N                ▼ N
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│EventSportCity│  │    Group     │  │    Match     │
├──────────────┤  ├──────────────┤  ├──────────────┤
│ id    PK     │  │ id     PK    │  │ id      PK   │
│ eventSportId │  │ nome         │  │ groupId  FK  │
│ cityId   FK  │  │ eventSportId │  │ eventSpo..FK │
│ status       │  │ createdAt    │  │ homeCityIdFK │
│ createdAt    │  │ UK(nome,ev..)│  │ awayCityIdFK │
│ UK(evSp,cty) │  └──────┬───────┘  │ matchDate ?  │
└──────┬───────┘         │ 1        │ location ?   │
       │ 1               │          │ homeScore ?  │
       │                 ▼ N        │ awayScore ?  │
       │ 0..1      ┌──────────────┐ │ status       │
       │           │GroupPartici..│ │ fase         │
       │           ├──────────────┤ │ createdAt    │
       │           │ id      PK   │ │ updatedAt    │
       │           │ groupId  FK  │ └──────────────┘
       │           │ eventSpo..FK │
       │           │ createdAt    │
       │           │ UK(eventS..) │
       │           └──────────────┘
       │
       ▼ 1
┌──────────────┐   ┌──────────────────┐
│    City      │   │     Sport        │
├──────────────┤   ├──────────────────┤
│ id      PK   │   │ id        PK     │
│ nome         │   │ nome             │
│ estado       │   │ categoria        │
│ siglaEstado  │   │ createdAt        │
│ brasaoUrl ?  │   └──────────────────┘
│ createdAt    │
│ updatedAt    │
│ UK(nome,UF)  │
└──────────────┘

┌──────────────┐
│    Team      │  (legacy)
├──────────────┤
│ id      PK   │
│ eventId  FK  │
│ cityId   FK  │
│ sportId  FK  │
│ createdAt    │
│ UK(event..)  │
└──────────────┘
```

## Relacionamentos Principais

| De | Para | Tipo | Chave Estrangeira | ON DELETE |
|----|------|------|-------------------|-----------|
| Event | EventSport | 1:N | EventSport.eventId | CASCADE |
| Sport | EventSport | 1:N | EventSport.sportId | RESTRICT |
| EventSport | EventSportCity | 1:N | EventSportCity.eventSportId | CASCADE |
| City | EventSportCity | 1:N | EventSportCity.cityId | RESTRICT |
| EventSport | Group | 1:N | Group.eventSportId | CASCADE |
| Group | GroupParticipant | 1:N | GroupParticipant.groupId | CASCADE |
| EventSportCity | GroupParticipant | 1:1 | GroupParticipant.eventSportCityId | CASCADE |
| Group | Match | 1:N | Match.groupId | CASCADE |
| EventSport | Match | 1:N | Match.eventSportId | CASCADE |
| City (home) | Match | 1:N | Match.homeCityId | RESTRICT |
| City (away) | Match | 1:N | Match.awayCityId | RESTRICT |

## Regras de Negócio

1. Uma **cidade** pode participar de várias **modalidades** em um mesmo evento
2. Cada **modalidade** pertence a um único **evento**
3. Uma **cidade** só pode pertencer a um **grupo** por modalidade
4. Grupos são gerados via round-robin com shuffle (distribuição equilibrada)
5. Partidas são geradas como confrontos únicos dentro do grupo (round-robin)
6. Uma partida finalizada exige placar (homeScore e awayScore)
7. Ao deletar um **evento**, todos os registros vinculados são removidos (CASCADE)
8. **Enums**: `Role`, `EventStatus`, `InscricaoStatus`, `MatchStatus`, `Fase`

## Fases (enum Fase)

- `GRUPOS` → fase de grupos
- `QUARTAS` → quartas de final
- `SEMIFINAL` → semifinal
- `FINAL` → final
- `TERCEIRO_LUGAR` → disputa de terceiro lugar
