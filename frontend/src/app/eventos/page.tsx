'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { eventsApi, type EventData } from '@/services/events';

const STATUS_LABEL: Record<string, string> = {
  PLANEJAMENTO: 'Planejamento',
  EM_ANDAMENTO: 'Em Andamento',
  FINALIZADO: 'Finalizado',
};

export default function EventosList() {
  const router = useRouter();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.list().then(setEvents).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Todos os Eventos</h1>
      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : events.length === 0 ? (
        <p className="text-muted-foreground">Nenhum evento encontrado.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/50"
              onClick={() => router.push(`/eventos/${evt.id}`)}
            >
              <h3 className="font-medium">{evt.nome}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{evt.ano} &middot; {evt.cidadeSede}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(evt.dataInicio).toLocaleDateString('pt-BR')} a {new Date(evt.dataFim).toLocaleDateString('pt-BR')}
              </p>
              <span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">{STATUS_LABEL[evt.status]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
