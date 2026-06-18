'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { eventSportsApi, type EventSportData } from '@/services/event-sports';
import { eventSportCitiesApi, type EventSportCityData } from '@/services/event-sport-cities';
import { eventSportGroupsApi, type GroupData } from '@/services/event-sport-groups';
import { matchesApi, type MatchData } from '@/services/matches';
import { playoffsApi } from '@/services/playoffs';

interface StandingData {
  id: string;
  groupId: string;
  cityId: string;
  position: number;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  city: { id: string; nome: string; siglaEstado: string };
}

interface GroupWithStandings extends GroupData {
  standings: StandingData[];
}

const FASE_LABEL: Record<string, string> = {
  QUARTAS: 'Quartas de Final',
  SEMIFINAL: 'Semifinal',
  FINAL: 'Final',
  TERCEIRO_LUGAR: 'Terceiro Lugar',
};

export default function ModalidadePublicDetail() {
  const params = useParams();
  const router = useRouter();
  const [eventSport, setEventSport] = useState<EventSportData | null>(null);
  const [participants, setParticipants] = useState<EventSportCityData[]>([]);
  const [groups, setGroups] = useState<GroupWithStandings[]>([]);
  const [matches, setMatches] = useState<Record<string, MatchData[]>>({});
  const [playoffMatches, setPlayoffMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const eventId = params.id as string;
        const esId = params.modalidadeId as string;

        const sports = await eventSportsApi.list(eventId);
        const es = sports.find((s) => s.id === esId);
        setEventSport(es || null);

        const cities = await eventSportCitiesApi.list(esId);
        setParticipants(cities);

        const groupsData = await eventSportGroupsApi.list(esId);
        const gws: GroupWithStandings[] = [];
        const ms: Record<string, MatchData[]> = {};

        for (const g of groupsData) {
          try {
            const res = await fetch(`/api/groups/${g.id}/standings`);
            const standings = await res.json();
            (g as GroupWithStandings).standings = standings;
          } catch { (g as GroupWithStandings).standings = []; }
          gws.push(g as GroupWithStandings);

          try {
            ms[g.id] = await matchesApi.listByGroup(g.id);
          } catch { ms[g.id] = []; }
        }
        setGroups(gws);
        setMatches(ms);

        try {
          setPlayoffMatches(await playoffsApi.list(esId));
        } catch { setPlayoffMatches([]); }
      } catch {} finally { setLoading(false); }
    }
    load();
  }, [params.id, params.modalidadeId]);

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;
  if (!eventSport) return <p className="text-muted-foreground">Modalidade não encontrada.</p>;

  const phases = ['QUARTAS', 'SEMIFINAL', 'TERCEIRO_LUGAR', 'FINAL'] as const;
  const groupedPlayoffs: Record<string, MatchData[]> = {};
  for (const fase of phases) {
    const ms = playoffMatches.filter((m) => m.fase === fase);
    if (ms.length > 0) groupedPlayoffs[fase] = ms;
  }

  return (
    <div className="space-y-6">
      <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => router.push(`/eventos/${params.id}`)}>&larr; Voltar ao evento</button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{eventSport.displayName || eventSport.sport.nome}</h1>
        <p className="mt-1 text-xs text-muted-foreground">{participants.length} cidade(s) participantes</p>
      </div>

      {groups.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Grupos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {groups.map((g) => (
              <div key={g.id} className="rounded-lg border">
                <div className="border-b bg-muted/30 px-3 py-2">
                  <p className="text-sm font-semibold">{g.nome}</p>
                </div>
                {g.standings.length > 0 ? (
                  <div className="divide-y text-sm">
                    {g.standings.map((s) => (
                      <div key={s.id} className="flex items-center justify-between px-3 py-1.5">
                        <span className="flex items-center gap-2">
                          <span className="w-5 text-center text-xs text-muted-foreground">{s.position}º</span>
                          <span>{s.city.nome}</span>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {s.points} pts | {s.played}J {s.wins}V {s.draws}E {s.losses}D | {s.goalsFor}:{s.goalsAgainst}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="px-3 py-2 text-xs text-muted-foreground">Classificação não disponível.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {playoffMatches.length > 0 && Object.keys(groupedPlayoffs).length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Mata-Mata</h2>
            <button
              className="rounded-md bg-muted px-3 py-1.5 text-xs font-medium hover:bg-muted/80"
              onClick={() => router.push(`/eventos/${params.id}/modalidades/${params.modalidadeId}/mata-mata`)}
            >
              Ver Chaveamento
            </button>
          </div>
          <div className="space-y-4">
            {Object.entries(groupedPlayoffs).map(([fase, ms]) => (
              <div key={fase}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{FASE_LABEL[fase] || fase}</p>
                <div className="space-y-1.5">
                  {ms.map((m) => (
                    <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm">
                      <span className="font-medium">{m.homeCity.nome} ({m.homeCity.siglaEstado})</span>
                      <span className="font-semibold tabular-nums">{m.homeScore ?? '?'} x {m.awayScore ?? '?'}</span>
                      <span className="font-medium">{m.awayCity.nome} ({m.awayCity.siglaEstado})</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {groups.map((g) => {
        const groupMatches = matches[g.id] || [];
        if (groupMatches.length === 0) return null;
        const finished = groupMatches.filter((m) => m.status === 'FINISHED');
        const upcoming = groupMatches.filter((m) => m.status !== 'FINISHED');
        return (
          <div key={g.id}>
            <h2 className="mb-3 text-lg font-semibold">Jogos - {g.nome}</h2>
            {upcoming.length > 0 && (
              <div className="mb-4">
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Próximos Jogos</p>
                <div className="space-y-1">
                  {upcoming.map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm">
                      <span>{m.homeCity.nome} ({m.homeCity.siglaEstado})</span>
                      <span className="text-xs text-muted-foreground">vs</span>
                      <span>{m.awayCity.nome} ({m.awayCity.siglaEstado})</span>
                      {m.matchDate && <span className="text-xs text-muted-foreground">{new Date(m.matchDate).toLocaleString('pt-BR')}</span>}
                      {m.location && <span className="text-xs text-muted-foreground">{m.location}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {finished.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Últimos Resultados</p>
                <div className="space-y-1">
                  {finished.map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm">
                      <span>{m.homeCity.nome}</span>
                      <span className="font-semibold">{m.homeScore} x {m.awayScore}</span>
                      <span>{m.awayCity.nome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
