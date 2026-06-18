'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { eventsApi, type EventData } from '@/services/events';
import { eventSportsApi } from '@/services/event-sports';
import { eventSportCitiesApi } from '@/services/event-sport-cities';
import { api } from '@/services/api';
import { rankingApi, type RankingEntry } from '@/services/ranking';

const STATUS_LABEL: Record<string, string> = {
  PLANEJAMENTO: 'Planejamento',
  EM_ANDAMENTO: 'Em Andamento',
  FINALIZADO: 'Finalizado',
};

const STATUS_ORDER: Record<string, number> = {
  EM_ANDAMENTO: 0,
  PLANEJAMENTO: 1,
  FINALIZADO: 2,
};

export default function PublicHome() {
  const router = useRouter();
  const [events, setEvents] = useState<EventData[]>([]);
  const [counts, setCounts] = useState<Record<string, { sports: number; cities: number }>>({});
  const [loading, setLoading] = useState(true);
  const [todayMatches, setTodayMatches] = useState<any[]>([]);
  const [topRanking, setTopRanking] = useState<RankingEntry[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await eventsApi.list();
        setEvents(data.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.ano - a.ano));
        const c: Record<string, { sports: number; cities: number }> = {};
        for (const evt of data) {
          try {
            const sports = await eventSportsApi.list(evt.id);
            let cityCount = 0;
            for (const es of sports) {
              const cities = await eventSportCitiesApi.list(es.id);
              cityCount = Math.max(cityCount, cities.length);
            }
            c[evt.id] = { sports: sports.length, cities: cityCount };
          } catch { c[evt.id] = { sports: 0, cities: 0 }; }
        }
        setCounts(c);
        try {
          const td = await api<any[]>('/public/schedule/today');
          setTodayMatches(td);
        } catch {}
        try {
          const r = await rankingApi.get();
          setTopRanking(r.slice(0, 5));
        } catch {}
      } catch {} finally { setLoading(false); }
    }
    load();
  }, []);

  const grouped = {
    EM_ANDAMENTO: events.filter((e) => e.status === 'EM_ANDAMENTO'),
    PLANEJAMENTO: events.filter((e) => e.status === 'PLANEJAMENTO'),
    FINALIZADO: events.filter((e) => e.status === 'FINALIZADO'),
  };

  return (
    <div className="space-y-8">
      <section className="text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Eventos Esportivos</h1>
        <p className="mt-2 text-muted-foreground">Acompanhe resultados, classificação e jogos ao vivo.</p>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        {todayMatches.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Jogos de Hoje</h2>
              <button
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={() => router.push('/agenda')}
              >
                Ver Agenda Completa
              </button>
            </div>
            <div className="space-y-2">
              {todayMatches.slice(0, 4).map((m: any) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold tabular-nums text-muted-foreground">
                      {m.matchDate ? new Date(m.matchDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                    <span>{m.homeCity.nome}</span>
                    <span className="text-xs text-muted-foreground">vs</span>
                    <span>{m.awayCity.nome}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{m.eventSport?.sport?.nome}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {topRanking.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Ranking Histórico</h2>
              <button
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={() => router.push('/ranking')}
              >
                Ver Ranking Completo
              </button>
            </div>
            <div className="space-y-1.5">
              {topRanking.map((entry, i) => (
                <div
                  key={entry.cityId}
                  className="flex cursor-pointer items-center justify-between rounded-lg border px-4 py-2.5 text-sm transition-colors hover:bg-muted/30"
                  onClick={() => router.push(`/cidades/${entry.cityId}`)}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center font-bold">
                      {i === 0 ? '\u{1F947}' : i === 1 ? '\u{1F948}' : i === 2 ? '\u{1F949}' : entry.position}
                    </span>
                    <span className="font-medium">{entry.cityName} <span className="text-xs text-muted-foreground">{entry.siglaEstado}</span></span>
                  </div>
                  <span className="font-bold tabular-nums">{entry.score}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">Carregando eventos...</p>
      ) : events.length === 0 ? (
        <p className="text-center text-muted-foreground">Nenhum evento encontrado.</p>
      ) : (
        Object.entries(grouped).map(([status, list]) =>
          list.length === 0 ? null : (
            <section key={status}>
              <h2 className="mb-3 text-lg font-semibold">{STATUS_LABEL[status]}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((evt) => (
                  <div
                    key={evt.id}
                    className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    onClick={() => router.push(`/eventos/${evt.id}`)}
                  >
                    <h3 className="font-medium">{evt.nome}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {evt.ano} &middot; {evt.cidadeSede}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(evt.dataInicio).toLocaleDateString('pt-BR')} a {new Date(evt.dataFim).toLocaleDateString('pt-BR')}
                    </p>
                    {counts[evt.id] && (
                      <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                        <span>{counts[evt.id].sports} modalidade(s)</span>
                        <span>{counts[evt.id].cities} cidade(s)</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )
        )
      )}
    </div>
  );
}
