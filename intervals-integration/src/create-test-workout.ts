import { IntervalsClient } from 'intervals-icu';
import dotenv from 'dotenv';

dotenv.config();

const client = new IntervalsClient({
  apiKey: process.env.INTERVALS_API_KEY || '',
  athleteId: process.env.INTERVALS_ATHLETE_ID || '0',
});

const today = new Date().toISOString().split('T')[0];

const workout = {
  name: '🔥 Teste de Treino - Intervalos',
  start_date_local: `${today}T07:00:00`,
  description: 'Treino de teste para verificar sincronização no relógio',
  category: 'WORKOUT',
  type: 'Run',
  moving_time: 2700,
  workout_doc: {
    sport: 'run',
    name: 'Teste Intervalos 5K',
    steps: [
      {
        type: 'warmup',
        duration: { value: 600, unit: 'seconds' },
        pace_min: { value: 5.5, unit: 'min_per_km' },
        pace_max: { value: 6.0, unit: 'min_per_km' },
      },
      {
        type: 'repeat',
        repeats: 4,
        steps: [
          {
            type: 'work',
            duration: { value: 180, unit: 'seconds' },
            pace_min: { value: 3.8, unit: 'min_per_km' },
            pace_max: { value: 4.0, unit: 'min_per_km' },
          },
          {
            type: 'recovery',
            duration: { value: 120, unit: 'seconds' },
            pace_min: { value: 5.0, unit: 'min_per_km' },
            pace_max: { value: 6.0, unit: 'min_per_km' },
          },
        ],
      },
      {
        type: 'cooldown',
        duration: { value: 600, unit: 'seconds' },
        pace_min: { value: 5.5, unit: 'min_per_km' },
        pace_max: { value: 6.5, unit: 'min_per_km' },
      },
    ],
  },
};

async function main() {
  try {
    console.log('Criando treino de teste para hoje...\n');
    console.log(`Data: ${today}`);
    console.log(`Treino: ${workout.name}`);

    const event = await client.events.createEvent(workout);

    console.log('\n✅ Treino criado com sucesso!');
    console.log(`   ID: ${event.id}`);
    console.log(`   Nome: ${event.name}`);
    console.log(`   Data: ${event.start_date_local}`);
    console.log(`   Duração: ${event.moving_time}s`);
    console.log('\n📱 Verifique seu relógio para ver o treino sincronizado.');
    console.log('   Normalmente sincroniza em alguns minutos via Garmin Connect.');
  } catch (error: any) {
    console.error('❌ Erro:', error.message || error);
    console.error(error.response?.data || error.stack);
  }
}

main();
