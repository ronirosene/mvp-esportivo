'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { eventsApi, type EventData } from '@/services/events';
import { eventSportsApi, type EventSportData } from '@/services/event-sports';
import { eventSportCitiesApi, type EventSportCityData } from '@/services/event-sport-cities';
import { matchesApi } from '@/services/matches';
import { playoffsApi } from '@/services/playoffs';

const STATUS_LABEL: Record<string, string> = {
  PLANEJAMENTO: 'Planejamento',
  EM_ANDAMENTO: 'Em Andamento',
  FINALIZADO: 'Finalizado',
};

export default function EventoPublicDetail() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [sports, setSports] = useState<EventSportData[]>([]);
  const [participants, setParticipants] = useState<Record<string, EventSportCityData[]>>({});
  const [matchCount, setMatchCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const evt = await eventsApi.get(params.id as string);
        setEvent(evt);
        const sportsData = await eventSportsApi.list(params.id as string);
        setSports(sportsData);

        let totalMatches = 0;
        const p: Record<string, EventSportCityData[]> = {};
        for (const es of sportsData) {
          const cities = await eventSportCitiesApi.list(es.id);
          p[es.id] = cities;
          try {
            const groups = await (await fetch(`/api/event-sports/${es.id}/groups`)).json();
            for (const g of groups) {
              const ms = await matchesApi.listByGroup(g.id);
              totalMatches += ms.length;
            }
          } catch {}
          try {
            const playoffMatches = await playoffsApi.list(es.id);
            totalMatches += playoffMatches.length;
          } catch {}
        }
        setParticipants(p);
        setMatchCount(totalMatches);
      } catch {} finally { setLoading(false); }
    }
    load();
  }, [params.id]);

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;
  if (!event) return <p className="text-muted-foreground">Evento não encontrado.</p>;

  const totalCities = new Set(Object.values(participants).flat().map((p) => p.cityId)).size;

  return (
    <div className="space-y-6">
      <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => router.push('/eventos')}>&larr; Voltar</button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{event.nome}</h1>
        <p className="mt-1 text-muted-foreground">{event.ano} &middot; {event.cidadeSede}</p>
        <span className="mt-2 inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase tracking-wide">{STATUS_LABEL[event.status]}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold">{sports.length}</p>
          <p className="text-xs text-muted-foreground">Modalidades</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold">{totalCities}</p>
          <p className="text-xs text-muted-foreground">Cidades</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold">{matchCount}</p>
          <p className="text-xs text-muted-foreground">Jogos</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold">{new Date(event.dataInicio).toLocaleDateString('pt-BR')}</p>
          <p className="text-xs text-muted-foreground">Início</p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Datas</h2>
        <p className="text-sm text-muted-foreground">
          {new Date(event.dataInicio).toLocaleDateString('pt-BR')} a {new Date(event.dataFim).toLocaleDateString('pt-BR')}
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Modalidades</h2>
        {sports.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma modalidade cadastrada.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sports.map((es) => (
              <div
                key={es.id}
                className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/50"
                onClick={() => router.push(`/eventos/${event.id}/modalidades/${es.id}`)}
              >
                <p className="font-medium">{es.displayName || es.sport.nome}</p>
                <p className="mt-1 text-xs text-muted-foreground">{participants[es.id]?.length ?? 0} cidade(s)</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
