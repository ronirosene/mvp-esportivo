'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { eventsApi, type EventData } from '@/services/events';
import { eventSportsApi } from '@/services/event-sports';
import { eventSportCitiesApi } from '@/services/event-sport-cities';

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
