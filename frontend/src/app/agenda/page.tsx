'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import ScheduleCard from '@/components/schedule-card';
import ScheduleFilters from '@/components/schedule-filters';

interface MatchData {
  id: string;
  homeCity: { nome: string; siglaEstado: string };
  awayCity: { nome: string; siglaEstado: string };
  homeScore: number | null;
  awayScore: number | null;
  matchDate: string | null;
  location: string | null;
  status: string;
  fase: string;
  eventSport: {
    sport: { nome: string; categoria: string };
    event: { nome: string };
  };
}

export default function AgendaPage() {
  const router = useRouter();
  const [today, setToday] = useState<MatchData[]>([]);
  const [upcoming, setUpcoming] = useState<MatchData[]>([]);
  const [results, setResults] = useState<MatchData[]>([]);
  const [filtered, setFiltered] = useState<MatchData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'results'>('today');

  const [sports, setSports] = useState<{ id: string; nome: string }[]>([]);
  const [events, setEvents] = useState<{ id: string; nome: string }[]>([]);
  const [cities, setCities] = useState<{ id: string; nome: string }[]>([]);

  async function loadData() {
    try {
      const [todayData, upcomingData, resultsData] = await Promise.all([
        api<MatchData[]>('/public/schedule/today'),
        api<MatchData[]>('/public/schedule/upcoming'),
        api<MatchData[]>('/public/schedule/results'),
      ]);
      setToday(todayData);
      setUpcoming(upcomingData);
      setResults(resultsData);
    } catch {}
  }

  async function loadFilters() {
    try {
      const [s, e, c] = await Promise.all([
        api<{ id: string; nome: string }[]>('/sports'),
        api<{ id: string; nome: string }[]>('/events'),
        api<{ id: string; nome: string }[]>('/cities'),
      ]);
      setSports(s);
      setEvents(e);
      setCities(c);
    } catch {}
  }

  useEffect(() => {
    Promise.all([loadData(), loadFilters()]).finally(() => setLoading(false));
  }, []);

  async function handleFilter(filters: Record<string, string>) {
    const qs = new URLSearchParams(filters).toString();
    if (!qs) {
      setFiltered(null);
      return;
    }
    try {
      const data = await api<MatchData[]>(`/public/schedule?${qs}`);
      setFiltered(data);
    } catch { setFiltered([]); }
  }

  function groupByDate(matches: MatchData[]) {
    const groups: Record<string, MatchData[]> = {};
    for (const m of matches) {
      const key = m.matchDate
        ? new Date(m.matchDate).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
        : 'Sem data';
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    }
    return groups;
  }

  const todayLabel = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  const displayMatches = filtered;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Agenda Oficial</h1>
        <p className="text-sm text-muted-foreground">
          Confira horários, locais, resultados e próximos jogos da Jornada Esportiva
        </p>
      </div>

      <ScheduleFilters onFilter={handleFilter} sports={sports} events={events} cities={cities} />

      {filtered !== null ? (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Resultados da Pesquisa</h2>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum jogo encontrado.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(groupByDate(filtered)).map(([date, ms]) => (
                <div key={date}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{date}</p>
                  <div className="space-y-2">
                    {ms.map((m) => <ScheduleCard key={m.id} match={m} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-4 flex gap-2 border-b">
            {[
              { key: 'today' as const, label: 'Hoje', count: today.length },
              { key: 'upcoming' as const, label: 'Próximos', count: upcoming.length },
              { key: 'results' as const, label: 'Últimos Resultados', count: results.length },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}{tab.count > 0 ? ` (${tab.count})` : ''}
              </button>
            ))}
          </div>

          {activeTab === 'today' && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{todayLabel}</p>
              {today.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum jogo programado para hoje.</p>
              ) : (
                <div className="space-y-2">
                  {today.map((m) => <ScheduleCard key={m.id} match={m} />)}
                </div>
              )}
            </div>
          )}

          {activeTab === 'upcoming' && (
            <div className="space-y-4">
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum jogo programado para os próximos dias.</p>
              ) : (
                Object.entries(groupByDate(upcoming)).map(([date, ms]) => (
                  <div key={date}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{date}</p>
                    <div className="space-y-2">
                      {ms.map((m) => <ScheduleCard key={m.id} match={m} />)}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-4">
              {results.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum resultado nos últimos 7 dias.</p>
              ) : (
                Object.entries(groupByDate(results)).map(([date, ms]) => (
                  <div key={date}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{date}</p>
                    <div className="space-y-2">
                      {ms.map((m) => <ScheduleCard key={m.id} match={m} />)}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
