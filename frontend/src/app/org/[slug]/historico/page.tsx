'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { eventsApi, type EventData } from '@/services/events';

interface ChampionEntry {
  id: string;
  cityName: string;
  siglaEstado: string;
  cityId: string;
  position: string;
  eventName: string;
  eventYear: number;
  sportName: string;
}

export default function OrgHistoricoPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [champions, setChampions] = useState<ChampionEntry[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventId, setEventId] = useState('');

  async function loadChampions() {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ orgSlug: slug });
      if (eventId) qs.set('eventId', eventId);
      const data = await api<ChampionEntry[]>(`/public/champions?${qs}`);
      setChampions(data);
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => {
    eventsApi.list({ orgSlug: slug }).then(setEvents).catch(() => {});
  }, [slug]);

  useEffect(() => { loadChampions(); }, [eventId]);

  const positionLabel: Record<string, string> = { CHAMPION: 'Campeão', RUNNER_UP: 'Vice-campeão', THIRD_PLACE: '3º Lugar' };
  const positionEmoji: Record<string, string> = { CHAMPION: '\u{1F947}', RUNNER_UP: '\u{1F948}', THIRD_PLACE: '\u{1F949}' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Histórico de Campeões</h1>
        <p className="text-sm text-muted-foreground">Todos os campeões, vices e terceiros colocados.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <select className="rounded-md border px-3 py-1.5 text-sm" value={eventId} onChange={(e) => setEventId(e.target.value)}>
          <option value="">Todos os Eventos</option>
          {events.map((evt) => <option key={evt.id} value={evt.id}>{evt.nome} ({evt.ano})</option>)}
        </select>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : champions.length === 0 ? (
        <p className="text-muted-foreground">Nenhum registro histórico encontrado.</p>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="p-3 font-medium">Posição</th>
                <th className="p-3 font-medium">Cidade</th>
                <th className="p-3 font-medium">Modalidade</th>
                <th className="p-3 font-medium">Evento</th>
              </tr>
            </thead>
            <tbody>
              {champions.map((c) => (
                <tr key={c.id} className="border-b last:border-0 cursor-pointer hover:bg-muted/30" onClick={() => router.push(`/org/${slug}/cidades/${c.cityId}`)}>
                  <td className="p-3 font-semibold">{positionEmoji[c.position] || ''} {positionLabel[c.position]}</td>
                  <td className="p-3 font-medium">{c.cityName} <span className="text-xs text-muted-foreground">{c.siglaEstado}</span></td>
                  <td className="p-3">{c.sportName}</td>
                  <td className="p-3 text-muted-foreground">{c.eventName} ({c.eventYear})</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
