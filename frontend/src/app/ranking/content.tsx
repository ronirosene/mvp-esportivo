'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { rankingApi, type RankingEntry } from '@/services/ranking';
import SponsorsBar from '@/components/sponsors-bar';
import { eventsApi, type EventData } from '@/services/events';
import { sportsApi } from '@/services/sports';
import type { SportData } from '@/services/event-sports';

const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

export default function RankingContent() {
  const router = useRouter();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [sports, setSports] = useState<SportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventId, setEventId] = useState('');
  const [sportId, setSportId] = useState('');
  const [year, setYear] = useState('');

  async function loadRanking() {
    setLoading(true);
    try {
      const data = await rankingApi.get({ eventId: eventId || undefined, sportId: sportId || undefined, year: year || undefined });
      setRanking(data);
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => {
    async function load() {
      try {
        const [evts, sps] = await Promise.all([
          eventsApi.list(),
          sportsApi.list(),
        ]);
        setEvents(evts);
        setSports(sps);
      } catch {}
    }
    load();
  }, []);

  useEffect(() => {
    loadRanking();
  }, [eventId, sportId, year]);

  const topScore = ranking.length > 0 ? ranking[0].score : 0;
  const maxTitles = ranking.length > 0 ? Math.max(...ranking.map((r) => r.titles)) : 0;
  const maxRunnerUps = ranking.length > 0 ? Math.max(...ranking.map((r) => r.runnerUps)) : 0;

  const topTitlesCity = ranking.find((r) => r.titles === maxTitles);
  const topRunnerUpsCity = ranking.find((r) => r.runnerUps === maxRunnerUps);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Ranking Histórico das Cidades</h1>
        <p className="mt-1 text-sm text-muted-foreground">Veja quais cidades possuem mais títulos e melhores campanhas ao longo dos anos.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          className="rounded-md border px-3 py-1.5 text-sm"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        >
          <option value="">Todos os Eventos</option>
          {events.map((evt) => (
            <option key={evt.id} value={evt.id}>{evt.nome} ({evt.ano})</option>
          ))}
        </select>
        <select
          className="rounded-md border px-3 py-1.5 text-sm"
          value={sportId}
          onChange={(e) => setSportId(e.target.value)}
        >
          <option value="">Todas as Modalidades</option>
          {sports.map((sp) => (
            <option key={sp.id} value={sp.id}>{sp.nome}</option>
          ))}
        </select>
        <select
          className="rounded-md border px-3 py-1.5 text-sm"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="">Todos os Anos</option>
          {YEARS.map((y) => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
      </div>

      {ranking.length > 0 && (
        <div className="flex flex-wrap gap-4 text-sm">
          {topTitlesCity && (
            <div className="rounded-md bg-amber-50 px-4 py-2 text-amber-800">
              <span className="font-semibold">Maior Campeão:</span> {topTitlesCity.cityName} ({topTitlesCity.titles} título{topTitlesCity.titles !== 1 ? 's' : ''})
            </div>
          )}
          {topRunnerUpsCity && (
            <div className="rounded-md bg-slate-100 px-4 py-2 text-slate-700">
              <span className="font-semibold">Mais Vices:</span> {topRunnerUpsCity.cityName} ({topRunnerUpsCity.runnerUps} vice{topRunnerUpsCity.runnerUps !== 1 ? 's' : ''})
            </div>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Carregando ranking...</p>
      ) : ranking.length === 0 ? (
        <p className="text-muted-foreground">Nenhum dado disponível para o ranking.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="p-3 font-medium">#</th>
                <th className="p-3 font-medium">Cidade</th>
                <th className="p-3 text-center font-medium">Títulos</th>
                <th className="p-3 text-center font-medium">Vices</th>
                <th className="p-3 text-center font-medium">3os</th>
                <th className="p-3 text-center font-medium">Part.</th>
                <th className="p-3 text-right font-medium">Pontos</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((entry) => {
                const isFirst = entry.position === 1;
                const isSecond = entry.position === 2;
                const isThird = entry.position === 3;
                const barWidth = topScore > 0 ? (entry.score / topScore) * 100 : 0;
                return (
                  <tr
                    key={entry.cityId}
                    className={`cursor-pointer border-b last:border-0 hover:bg-muted/30 ${isFirst ? 'bg-amber-50' : isSecond ? 'bg-slate-50' : isThird ? 'bg-orange-50' : ''}`}
                    onClick={() => router.push(`/cidades/${entry.cityId}`)}
                  >
                    <td className="p-3 font-bold">
                      {isFirst ? '\u{1F947}' : isSecond ? '\u{1F948}' : isThird ? '\u{1F949}' : entry.position}
                    </td>
                    <td className="p-3 font-medium">{entry.cityName} <span className="text-xs text-muted-foreground">{entry.siglaEstado}</span></td>
                    <td className="p-3 text-center font-semibold tabular-nums">{entry.titles}</td>
                    <td className="p-3 text-center tabular-nums">{entry.runnerUps}</td>
                    <td className="p-3 text-center tabular-nums">{entry.thirdPlaces}</td>
                    <td className="p-3 text-center tabular-nums text-muted-foreground">{entry.participations}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-bold tabular-nums">{entry.score}</span>
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${barWidth}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-lg border p-4 text-xs text-muted-foreground">
        <p className="font-medium">Critério de Pontuação</p>
        <p>Campeão = 5 pontos | Vice-campeão = 3 pontos | 3º Lugar = 1 ponto</p>
      </div>

      <SponsorsBar className="border-t pt-6" />
    </div>
  );
}
