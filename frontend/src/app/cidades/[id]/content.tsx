'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cityHistoryApi, type CityDetailData, type CityHistoryEntry, type CityStatsData } from '@/services/city-history';

const POSITION_EMOJI: Record<string, string> = {
  CHAMPION: '\u{1F947}',
  RUNNER_UP: '\u{1F948}',
  THIRD_PLACE: '\u{1F949}',
};

const POSITION_LABEL: Record<string, string> = {
  CHAMPION: 'Campeão',
  RUNNER_UP: 'Vice-campeão',
  THIRD_PLACE: '3\u00ba Lugar',
};

export default function CityDetailContent() {
  const params = useParams();
  const router = useRouter();
  const [city, setCity] = useState<CityDetailData | null>(null);
  const [history, setHistory] = useState<Record<string, CityHistoryEntry[]>>({});
  const [stats, setStats] = useState<CityStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const cid = params.id as string;
        const [c, h, s] = await Promise.all([
          cityHistoryApi.get(cid),
          cityHistoryApi.history(cid),
          cityHistoryApi.stats(cid),
        ]);
        setCity(c);
        setHistory(h);
        setStats(s);
      } catch {} finally { setLoading(false); }
    }
    load();
  }, [params.id]);

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;
  if (!city) return <p className="text-muted-foreground">Cidade não encontrada.</p>;

  const sortedYears = Object.keys(history).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => router.push('/cidades')}>
          &larr; Todas as Cidades
        </button>
        <button className="text-sm font-medium text-primary hover:underline" onClick={() => router.push(`/ranking`)}>
          Ver posição no ranking
        </button>
      </div>

      <div className="rounded-lg border p-6">
        <h1 className="text-2xl font-bold tracking-tight">{city.nome} - {city.siglaEstado}</h1>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <div className="rounded-md bg-muted px-3 py-1.5">
            <p className="text-xs text-muted-foreground">Participações</p>
            <p className="text-lg font-bold">{city.totalParticipacoes}</p>
          </div>
          <div className="rounded-md bg-muted px-3 py-1.5">
            <p className="text-xs text-muted-foreground">Títulos</p>
            <p className="text-lg font-bold">{city.totalTitulos}</p>
          </div>
          <div className="rounded-md bg-muted px-3 py-1.5">
            <p className="text-xs text-muted-foreground">Vices</p>
            <p className="text-lg font-bold">{city.totalVices}</p>
          </div>
          <div className="rounded-md bg-muted px-3 py-1.5">
            <p className="text-xs text-muted-foreground">3os Lugares</p>
            <p className="text-lg font-bold">{city.totalTerceiros}</p>
          </div>
        </div>
      </div>

      {sortedYears.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Histórico</h2>
          <div className="space-y-4">
            {sortedYears.map((year) => (
              <div key={year}>
                <p className="mb-2 text-sm font-semibold text-muted-foreground">{year}</p>
                <div className="space-y-1.5">
                  {history[year].map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <span className="text-lg">{POSITION_EMOJI[entry.position]}</span>
                      <div>
                        <p className="text-sm font-medium">{entry.eventSport.displayName}</p>
                        <p className="text-xs text-muted-foreground">{POSITION_LABEL[entry.position]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats && stats.modalidadesMaisVencedoras.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Modalidades Mais Vencedoras</h2>
          <div className="space-y-1.5">
            {stats.modalidadesMaisVencedoras.map((m, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <span>{m.modalidade}</span>
                <span className="font-semibold">{m.titulos} título{m.titulos === 1 ? '' : 's'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {sortedYears.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum registro histórico para esta cidade.</p>
      )}
    </div>
  );
}
