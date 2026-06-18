import { PrismaClient, Role, EventStatus, MatchStatus, Fase } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash('123456', 10);

  // Clean existing data in reverse dependency order
  await prisma.match.deleteMany();
  await prisma.group.deleteMany();
  await prisma.team.deleteMany();
  await prisma.eventSport.deleteMany();
  await prisma.event.deleteMany();
  await prisma.sport.deleteMany();
  await prisma.city.deleteMany();

  const user = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      nome: 'Admin',
      email: 'admin@admin.com',
      senha: senhaHash,
      role: Role.ADMIN,
    },
  });

  const event = await prisma.event.create({
    data: {
      nome: 'Jogos Escolares 2026',
      ano: 2026,
      cidadeSede: 'São Paulo',
      dataInicio: new Date('2026-07-01'),
      dataFim: new Date('2026-07-15'),
      status: EventStatus.PLANEJAMENTO,
    },
  });

  const sportsData = [
    'Futsal', 'Voleibol', 'Basquetebol', 'Handebol',
    'Bocha', 'Malha', 'Truco', 'Xadrez', 'Damas',
    'Tênis de Mesa', 'Atletismo', 'Natação',
  ];

  const sports: Record<string, { id: string }> = {};
  for (const nome of sportsData) {
    const s = await prisma.sport.create({ data: { nome } });
    sports[nome] = s;
  }

  const saoPaulo = await prisma.city.create({
    data: { nome: 'São Paulo', estado: 'São Paulo', siglaEstado: 'SP' },
  });

  const rio = await prisma.city.create({
    data: { nome: 'Rio de Janeiro', estado: 'Rio de Janeiro', siglaEstado: 'RJ' },
  });

  const futsalId = sports['Futsal'].id;

  const spMasc = await prisma.team.create({
    data: { eventId: event.id, cityId: saoPaulo.id, sportId: futsalId },
  });

  const rjMasc = await prisma.team.create({
    data: { eventId: event.id, cityId: rio.id, sportId: futsalId },
  });

  await prisma.group.createMany({
    data: [
      { nome: 'Grupo A', eventId: event.id, sportId: futsalId },
      { nome: 'Grupo B', eventId: event.id, sportId: futsalId },
    ],
  });

  await prisma.match.createMany({
    data: [
      {
        eventId: event.id,
        sportId: futsalId,
        teamAId: spMasc.id,
        teamBId: rjMasc.id,
        dataHora: new Date('2026-07-02T14:00:00Z'),
        local: 'Ginásio A',
        status: MatchStatus.AGENDADA,
        fase: Fase.GRUPOS,
      },
    ],
  });

  console.log('Seed concluído com sucesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
