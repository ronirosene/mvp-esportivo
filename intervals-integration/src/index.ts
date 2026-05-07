import { IntervalsClient } from 'intervals-icu';
import XLSX from 'xlsx';
import dotenv from 'dotenv';

dotenv.config();

const client = new IntervalsClient({
  apiKey: process.env.INTERVALS_API_KEY || '',
  athleteId: process.env.INTERVALS_ATHLETE_ID || '0',
});

const excelPath = 'C:\\Users\\Meu Computador\\Documents\\vscode\\atividades.xlsx';
const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rawData: any[] = XLSX.utils.sheet_to_json(sheet);

console.log(`📊 ${rawData.length} atividades carregadas\n`);

// Debug first run
const first = rawData[0];
console.log('DEBUG - First run data:');
console.log(`  pace: ${first.pace}`);
console.log(`  distance: ${first.distance}`);
console.log(`  moving_time: ${first.moving_time}`);
console.log(`  average_speed: ${first.average_speed}`);
console.log(`  description: ${first.description}`);
console.log('');

function formatPace(paceSecPerKm: number): string {
  if (!paceSecPerKm || paceSecPerKm <= 0 || paceSecPerKm > 600) return 'N/A';
  const mins = Math.floor(paceSecPerKm / 60);
  const secs = Math.round(paceSecPerKm % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}/km`;
}

function formatTime(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return 'N/A';
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.round(totalSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function parsePaceFromSpeed(speedMs: number): number {
  if (!speedMs || speedMs <= 0) return 0;
  return 1000 / speedMs; // sec/km
}

function parsePaceFromDistanceTime(distMeters: number, timeSeconds: number): number {
  if (!distMeters || !timeSeconds || distMeters <= 0 || timeSeconds <= 0) return 0;
  return (timeSeconds / distMeters) * 1000; // sec/km
}

function formatDate(dateStr: string): string {
  return dateStr.split('T')[0];
}

function analyzeRuns(data: any[]) {
  const runs = data.filter((d: any) =>
    ['Run', 'TrailRun', 'VirtualRun'].includes(d.type)
  );

  runs.forEach((r: any) => {
    r.date = formatDate(r.start_date_local);
    r.dateObj = new Date(r.start_date_local);
    r.distKm = parseFloat(r.distance || 0) / 1000;
    r.timeSec = parseFloat(r.moving_time || 0);
    r.timeMin = r.timeSec / 60;

    // Try multiple methods to get pace
    const speedMs = parseFloat(r.average_speed) / 1000; // mm/s to m/s
    r.paceSecKm = parsePaceFromSpeed(speedMs);

    // Fallback: calculate from distance/time
    if (r.paceSecKm <= 0 || r.paceSecKm > 600) {
      r.paceSecKm = parsePaceFromDistanceTime(r.distKm * 1000, r.timeSec);
    }

    r.paceMinKm = r.paceSecKm / 60;
    r.avgHR = parseInt(r.average_heartrate) || 0;
    r.maxHR = parseInt(r.max_heartrate) || 0;
    r.trainingLoad = parseFloat(r.icu_training_load) || 0;
    r.fatigue = parseFloat(r.icu_fatigue) || 0;
    r.elevGain = parseFloat(r.total_elevation_gain || 0);
  });

  runs.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  const validRuns = runs.filter((r: any) => r.paceSecKm > 60 && r.paceSecKm < 400);
  const totalRuns = runs.length;
  const totalDist = runs.reduce((s, r) => s + r.distKm, 0);
  const totalTime = runs.reduce((s, r) => s + r.timeMin, 0);
  const avgPace = validRuns.length > 0 ? validRuns.reduce((s, r) => s + r.paceSecKm, 0) / validRuns.length : 0;
  const avgHR = runs.filter((r) => r.avgHR > 0).reduce((s, r, i, arr) => s + r.avgHR / arr.length, 0);

  const recentRuns = runs.slice(-30);

  const best5k = runs
    .filter((r) => r.distKm >= 4.5 && r.distKm <= 5.5)
    .sort((a, b) => a.timeSec - b.timeSec)[0];

  const best1k = runs
    .filter((r) => r.distKm >= 0.9 && r.distKm <= 1.2)
    .sort((a, b) => a.paceSecKm - b.paceSecKm)[0];

  const longRuns = runs
    .filter((r) => r.distKm >= 8)
    .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
    .slice(0, 10);

  const intervalRuns = runs.filter((r) =>
    r.description && r.description.toLowerCase().includes('tiro')
  );

  const weeklyData = calculateWeeklyVolume(runs);
  const paceTrend = calculatePaceTrend(runs);
  const hrZones = analyzeHRZones(runs);

  const last30Days = runs.filter((r) => {
    const daysAgo = (Date.now() - r.dateObj.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 30;
  });

  const last60Days = runs.filter((r) => {
    const daysAgo = (Date.now() - r.dateObj.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 60;
  });

  return {
    totalRuns,
    totalDist,
    totalTime,
    avgPace,
    avgHR,
    recentRuns,
    best5k,
    best1k,
    longRuns,
    intervalRuns,
    weeklyData,
    paceTrend,
    hrZones,
    last30Days,
    last60Days,
    allRuns: runs,
    validRuns,
  };
}

function calculateWeeklyVolume(runs: any[]) {
  const weeks = new Map();

  runs.forEach((r) => {
    const d = r.dateObj;
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((day + 6) % 7));
    const key = monday.toISOString().split('T')[0];

    if (!weeks.has(key)) weeks.set(key, { dist: 0, count: 0, load: 0 });
    const w = weeks.get(key);
    w.dist += r.distKm;
    w.count++;
    w.load += r.trainingLoad;
  });

  return Array.from(weeks.entries())
    .map(([week, data]) => ({ week, ...data }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

function calculatePaceTrend(runs: any[]) {
  const grouped = new Map();

  runs.forEach((r) => {
    if (r.paceSecKm < 120 || r.paceSecKm > 360 || r.distKm < 3) return;
    const month = r.date.substring(0, 7);
    if (!grouped.has(month)) grouped.set(month, { paces: [], dates: [] });
    const g = grouped.get(month);
    g.paces.push(r.paceSecKm);
    g.dates.push(r.date);
  });

  return Array.from(grouped.entries())
    .map(([month, data]) => ({
      month,
      avgPace: data.paces.reduce((s, p) => s + p, 0) / data.paces.length,
      count: data.paces.length,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function analyzeHRZones(runs: any[]) {
  const runsWithHR = runs.filter((r) => r.avgHR > 0);

  const zones = [
    { zone: 'Z1 Recuperação', min: 0, max: 145, count: 0, totalPace: 0 },
    { zone: 'Z2 Aeróbico', min: 145, max: 153, count: 0, totalPace: 0 },
    { zone: 'Z3 Tempo', min: 153, max: 162, count: 0, totalPace: 0 },
    { zone: 'Z4 Limiar', min: 162, max: 171, count: 0, totalPace: 0 },
    { zone: 'Z5 VO2Max', min: 171, max: 176, count: 0, totalPace: 0 },
    { zone: 'Z6 Anaeróbico', min: 176, max: 181, count: 0, totalPace: 0 },
    { zone: 'Z7 Neuromuscular', min: 181, max: 999, count: 0, totalPace: 0 },
  ];

  runsWithHR.forEach((r) => {
    for (const z of zones) {
      if (r.avgHR >= z.min && r.avgHR < z.max) {
        z.count++;
        z.totalPace += r.paceSecKm;
      }
    }
  });

  return zones;
}

function generateSmartPlan(analysis: any, weeks = 4) {
  const { best5k, avgPace, recentRuns } = analysis;

  // Get realistic pace from valid runs
  const validPaces = analysis.validRuns.map((r) => r.paceSecKm).filter((p) => p > 0);
  const currentAvgPace = validPaces.length > 0 ? validPaces.reduce((a, b) => a + b, 0) / validPaces.length : 300;

  // Best 5K pace (sec/km)
  const best5kPace = best5k ? best5k.paceSecKm : currentAvgPace;
  const target5kPace = 3 * 60 + 48; // 3:48/km for sub-19 5K

  const currentHR = recentRuns.length > 0
    ? recentRuns.slice(-10).filter((r) => r.avgHR > 0).reduce((s, r, i, arr) => s + r.avgHR / arr.length, 0)
    : 155;

  const zones = {
    easy: { min: best5kPace * 1.35, max: best5kPace * 1.5 },
    marathon: { min: best5kPace * 1.2, max: best5kPace * 1.3 },
    threshold: { min: best5kPace * 0.95, max: best5kPace * 1.05 },
    vo2Max: { min: best5kPace * 0.9, max: best5kPace * 0.95 },
    speed: { min: best5kPace * 0.85, max: best5kPace * 0.9 },
    hrEasy: Math.round(currentHR * 0.82),
    hrThreshold: Math.round(currentHR * 0.95),
    hrVO2Max: Math.round(currentHR * 1.08),
  };

  const plan = [];
  const today = new Date();
  let current = new Date(today);
  current.setDate(today.getDate() + 1);

  for (let w = 0; w < weeks; w++) {
    const weekNum = w + 1;
    const isRecovery = w % 3 === 2;
    const volume = isRecovery ? 0.75 : 1.0;
    const intensity = isRecovery ? 0.6 : Math.min(1.0, 0.7 + w * 0.1);

    const days = [
      {
        day: 'Seg',
        name: `[S${weekNum}] Easy Run`,
        desc: `Corrida leve Z2 | Pace: ${formatPace(zones.easy.min)}-${formatPace(zones.easy.max)} | FC: <${zones.hrEasy} bpm | 40-50 min`,
        time: Math.round(45 * 60 * volume),
      },
      {
        day: 'Ter',
        name: `[S${weekNum}] Intervalos`,
        desc: isRecovery
          ? `Recuperação ativa | 30min leve + 4x30s progressivo`
          : `Aquec 15min + ${6 + w}x400m @ ${formatPace(zones.speed.min)} / 2min trote + 10min leve | FC alvo: >${zones.hrVO2Max}`,
        time: Math.round(50 * 60 * (isRecovery ? 0.6 : 1)),
      },
      {
        day: 'Qua',
        name: `[S${weekNum}] Descanso`,
        desc: 'Descanso total ou caminhada leve 20min',
        isRest: true,
      },
      {
        day: 'Qui',
        name: `[S${weekNum}] Tempo Run`,
        desc: isRecovery
          ? `20min leve + 10min @ ${formatPace(zones.threshold.min)}`
          : `Aquec 15min + ${15 + w * 5}min @ ${formatPace(zones.threshold.min)}-${formatPace(zones.threshold.max)} + 10min leve`,
        time: Math.round((40 + w * 5) * 60 * volume),
      },
      {
        day: 'Sex',
        name: `[S${weekNum}] Strides + Core`,
        desc: `20min leve + 6x100m strides + 15min core/mobilidade`,
        time: Math.round(35 * 60 * volume),
      },
      {
        day: 'Sáb',
        name: `[S${weekNum}] Descanso`,
        desc: 'Descanso ativo, alongamento, foam roller',
        isRest: true,
      },
      {
        day: 'Dom',
        name: `[S${weekNum}] Long Run`,
        desc: isRecovery
          ? `Corrida longa regenerativa | 45-50min @ Z2`
          : `Corrida longa | ${60 + w * 5}min @ Z2-Z3 | Pace: ${formatPace(zones.easy.max)}-${formatPace(zones.marathon.min)}`,
        time: Math.round((60 + w * 5) * 60 * volume),
      },
    ];

    days.forEach((d) => {
      plan.push({
        name: d.name,
        date: current.toISOString().split('T')[0],
        description: d.desc,
        type: 'Run',
        moving_time: d.isRest ? 0 : d.time,
      });
      current.setDate(current.getDate() + 1);
    });
  }

  return { plan, zones, best5kPace, target5kPace, gap: best5kPace - target5kPace };
}

async function deleteFutureWorkouts() {
  const today = new Date().toISOString().split('T')[0];
  const farFuture = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const events = await client.events.listEvents({
    oldest: today,
    newest: farFuture,
    category: ['WORKOUT'],
  });

  console.log(`\n🗑️  Encontrados ${events.length} treinos futuros...`);
  for (const e of events) {
    if (e.id) {
      try {
        await client.events.deleteEvent(e.id);
        console.log(`   ✓ ${e.name}`);
      } catch {
        console.log(`   ✗ ${e.name}`);
      }
    }
  }
  return events.length;
}

async function uploadPlan(plan) {
  let created = 0;
  let failed = 0;

  for (const workout of plan) {
    try {
      await client.events.createEvent({
        name: workout.name,
        start_date_local: `${workout.date}T06:30:00`,
        description: workout.description,
        category: 'WORKOUT',
        type: workout.type,
        moving_time: workout.moving_time,
      });
      created++;
    } catch {
      failed++;
    }
  }

  return { created, failed };
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║       ANÁLISE COMPLETA + PLANO 5K SUB 19MIN           ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  console.log('📊 ANALISANDO SEUS DADOS...\n');
  const analysis = analyzeRuns(rawData);

  console.log('═══ RESUMO GERAL (TODOS OS DADOS) ═══');
  console.log(`🏃 Total de corridas: ${analysis.totalRuns}`);
  console.log(`📏 Distância total: ${analysis.totalDist.toFixed(1)} km`);
  console.log(`⏱️  Tempo total: ${formatTime(analysis.totalTime * 60)}`);
  console.log(`📊 Pace médio geral: ${formatPace(analysis.avgPace)}`);
  console.log(`💓 FC média: ${Math.round(analysis.avgHR)} bpm`);
  console.log(`📅 Corridas últimos 30 dias: ${analysis.last30Days.length}`);
  console.log(`📅 Corridas últimos 60 dias: ${analysis.last60Days.length}`);
  console.log(`📊 Corridas com pace válido: ${analysis.validRuns.length}`);

  console.log('\n═══ MELHORES MARCAS ═══');
  if (analysis.best5k) {
    const b = analysis.best5k;
    console.log(`🏆 Melhor 5K: ${formatTime(b.timeSec)} | Pace: ${formatPace(b.paceSecKm)} | ${b.date} | ${b.name}`);
  }
  if (analysis.best1k) {
    const b = analysis.best1k;
    console.log(`🏆 Melhor 1K: ${formatTime(b.timeSec)} | Pace: ${formatPace(b.paceSecKm)} | ${b.date} | ${b.name}`);
  }

  console.log('\n═══ LONG RUNS RECENTES ═══');
  analysis.longRuns.slice(0, 5).forEach((r) => {
    console.log(`   ${r.date}: ${r.distKm.toFixed(1)}km | ${formatPace(r.paceSecKm)} | +${r.elevGain}m | ${r.name}`);
  });

  console.log('\n═══ TREINOS DE TIRO ═══');
  if (analysis.intervalRuns.length > 0) {
    analysis.intervalRuns.slice(-5).forEach((r) => {
      console.log(`   ${r.date}: ${r.distKm.toFixed(1)}km | ${formatPace(r.paceSecKm)} | FC: ${r.avgHR} bpm | ${r.name}`);
      if (r.description) console.log(`      → ${r.description.replace(/\\n/g, ' | ')}`);
    });
  } else {
    console.log('   Nenhum treino de tiro identificado');
  }

  console.log('\n═══ VOLUME SEMANAL ═══');
  const recentWeeks = analysis.weeklyData.slice(-8);
  recentWeeks.forEach((w) => {
    const bar = '█'.repeat(Math.round(w.dist / 2));
    console.log(`   ${w.week}: ${w.dist.toFixed(1)} km | ${w.count} treinos | Load: ${Math.round(w.load)} ${bar}`);
  });
  const avgWeekly = analysis.weeklyData.length > 0
    ? analysis.weeklyData.reduce((s, w) => s + w.dist, 0) / analysis.weeklyData.length
    : 0;
  console.log(`   📊 Média semanal: ${avgWeekly.toFixed(1)} km`);

  console.log('\n═══ EVOLUÇÃO DE PACE (MENSAL) ═══');
  analysis.paceTrend.forEach((t) => {
    const trend = t.avgPace < analysis.avgPace ? '↓' : t.avgPace > analysis.avgPace ? '↑' : '=';
    console.log(`   ${t.month}: ${formatPace(t.avgPace)} (${t.count} corridas) ${trend}`);
  });

  console.log('\n═══ ZONAS DE FREQUÊNCIA CARDÍACA ═══');
  const hrZones = analysis.hrZones.filter((z) => z.count > 0);
  hrZones.forEach((z) => {
    const pct = ((z.count / analysis.totalRuns) * 100).toFixed(0);
    const avgPace = z.count > 0 ? z.totalPace / z.count : 0;
    console.log(`   ${z.zone} (${z.min}-${z.max} bpm): ${z.count} treinos (${pct}%) | Pace médio: ${formatPace(avgPace)}`);
  });

  // 2. TRAINING PLAN
  console.log('\n' + '='.repeat(60));
  console.log('🎯 META: 5K SUB 19 MIN ATÉ DEZEMBRO 2026');
  console.log('='.repeat(60));

  const { plan, zones, best5kPace, target5kPace, gap } = generateSmartPlan(analysis, 4);

  console.log(`📊 Pace 5K atual: ${formatPace(best5kPace)}`);
  console.log(`🎯 Pace 5K alvo: ${formatPace(target5kPace)}`);
  console.log(`⏱️  Diferença: ${formatPace(gap)}/km`);
  console.log(`📅 Semanas até dez/26: ${Math.floor((new Date('2026-12-31').getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000))}`);
  console.log(`💪 Projeção: ${gap < 30 ? 'Meta muito próxima!' : gap < 90 ? 'Meta alcançável com treino consistente' : 'Desafiador mas possível com dedicação'}`);

  console.log('\n═══ ZONAS DE TREINO RECOMENDADAS ═══');
  console.log(`   🟢 Easy: ${formatPace(zones.easy.min)}-${formatPace(zones.easy.max)} | FC <${zones.hrEasy}`);
  console.log(`   🟡 Marathon: ${formatPace(zones.marathon.min)}-${formatPace(zones.marathon.max)}`);
  console.log(`   🟠 Threshold: ${formatPace(zones.threshold.min)}-${formatPace(zones.threshold.max)} | FC ~${zones.hrThreshold}`);
  console.log(`   🔴 VO2Max: ${formatPace(zones.vo2Max.min)}-${formatPace(zones.vo2Max.max)} | FC >${zones.hrVO2Max}`);
  console.log(`   ⚡ Speed: ${formatPace(zones.speed.min)}-${formatPace(zones.speed.max)}`);

  console.log('\n═══ PLANO 4 SEMANAS ═══');
  plan.forEach((p) => {
    const date = new Date(p.date + 'T12:00:00');
    const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()];
    const timeStr = p.moving_time && p.moving_time > 0 ? ` | ${Math.round(p.moving_time / 60)}min` : '';
    console.log(`   ${dayName} ${p.date.split('-').reverse().join('/')} ${p.name}${timeStr}`);
    console.log(`      ${p.description}`);
  });

  // 3. DELETE & UPLOAD
  console.log('\n' + '='.repeat(60));
  console.log('🔄 SINCRONIZANDO COM INTERVALS.ICU');
  console.log('='.repeat(60));

  console.log('\n🗑️  Limpando treinos futuros...');
  const deleted = await deleteFutureWorkouts();

  console.log(`\n📅 Criando ${plan.length} treinos no calendário...`);
  const { created, failed } = await uploadPlan(plan);

  console.log(`\n✅ ${created} treinos criados | ❌ ${failed} falhas`);
  console.log('\n📱 Abra o Intervals.icu/Garmin Connect para ver seus treinos!');
  console.log('   Sincronize o relógio para receber os treinos.');
}

main().catch((e) => console.error(e));
