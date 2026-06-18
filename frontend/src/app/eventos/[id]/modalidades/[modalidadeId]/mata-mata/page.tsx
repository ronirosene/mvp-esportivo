'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { eventSportsApi, type EventSportData } from '@/services/event-sports';
import { eventSportCitiesApi, type EventSportCityData } from '@/services/event-sport-cities';
import { playoffsApi } from '@/services/playoffs';
import BracketView from '@/components/bracket-view';
import type { MatchData } from '@/services/matches';

export default function MataMataPage() {
  const params = useParams();
  const router = useRouter();
  const [eventSport, setEventSport] = useState<EventSportData | null>(null);
  const [participants, setParticipants] = useState<EventSportCityData[]>([]);
  const [bracket, setBracket] = useState<{
    quarters: MatchData[];
    semifinals: MatchData[];
    final: MatchData | null;
    thirdPlace: MatchData | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const eventoId = params.id as string;
        const modalidadeId = params.modalidadeId as string;

        const sports = await eventSportsApi.list(eventoId);
        const es = sports.find((s) => s.id === modalidadeId);
        setEventSport(es || null);

        const cities = await eventSportCitiesApi.list(modalidadeId);
        setParticipants(cities);

        const bracketData = await playoffsApi.bracket(modalidadeId);
        setBracket(bracketData);
      } catch {} finally { setLoading(false); }
    }
    load();
  }, [params.id, params.modalidadeId]);

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;
  if (!eventSport) return <p className="text-muted-foreground">Modalidade não encontrada.</p>;

  const hasBracketData =
    bracket &&
    (bracket.quarters.length > 0 ||
      bracket.semifinals.length > 0 ||
      bracket.final !== null);

  return (
    <div className="space-y-6">
      <button
        className="text-sm text-muted-foreground hover:text-foreground"
        onClick={() => router.push(`/eventos/${params.id}/modalidades/${params.modalidadeId}`)}
      >
        &larr; Voltar à modalidade
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{eventSport.displayName || eventSport.sport.nome}</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {participants.length} cidade(s) participantes
        </p>
      </div>

      {hasBracketData ? (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Chaveamento</h2>
          <BracketView
            quarters={bracket!.quarters}
            semifinals={bracket!.semifinals}
            final={bracket!.final}
            thirdPlace={bracket!.thirdPlace}
          />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nenhum confronto de mata-mata gerado para esta modalidade.
        </div>
      )}
    </div>
  );
}
