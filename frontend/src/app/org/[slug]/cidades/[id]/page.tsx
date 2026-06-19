'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { rankingApi } from '@/services/ranking';

interface CityDetail {
  id: string;
  nome: string;
  siglaEstado: string;
  brasaoUrl: string | null;
  champions: { id: string; eventName: string; eventYear: number; sportName: string; position: string }[];
  stats: { totalTitles: number; totalRunnerUps: number; totalThirdPlaces: number; totalParticipations: number };
}

export default function OrgCidadeDetail() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [city, setCity] = useState<CityDetail | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api<CityDetail>(`/public/cities/${params.id}?orgSlug=${slug}`);
        setCity(data);
        try {
          const ranking = await rankingApi.get({ orgSlug: slug });
          const pos = ranking.findIndex((r: any) => r.cityId === params.id);
          if (pos >= 0) setRank(pos + 1);
        } catch {}
      } catch { router.push(`/org/${slug}/cidades`); } finally { setLoading(false); }
    }
    load();
  }, [params.id, slug, router]);

  const positionEmoji: Record<string, string> = { CHAMPION: '\u{1F947}', RUNNER_UP: '\u{1F948}', THIRD_PLACE: '\u{1F949}' };

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;
  if (!city) return null;

  return (
    <div className="space-y-6">
      <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => router.push(`/org/${slug}/cidades`)}>&larr; Voltar</button>
      <div className="flex items-center gap-4">
        {city.brasaoUrl ? <img src={city.brasaoUrl} alt={city.nome} className="h-16 w-16 rounded-full object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-2xl font-bold">{city.nome[0]}</div>}
        <div>
          <h1 className="text-2xl font-bold">{city.nome}</h1>
          <p className="text-muted-foreground">{city.siglaEstado}</p>
          {rank && <p className="text-sm text-muted-foreground">{rank}º no Ranking Histórico</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold">{city.stats.totalTitles}</p>
          <p className="text-xs text-muted-foreground">Títulos</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold">{city.stats.totalRunnerUps}</p>
          <p className="text-xs text-muted-foreground">Vices</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold">{city.stats.totalThirdPlaces}</p>
          <p className="text-xs text-muted-foreground">3os Lugares</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold">{city.stats.totalParticipations}</p>
          <p className="text-xs text-muted-foreground">Participações</p>
        </div>
      </div>
      {city.champions.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Títulos</h2>
          <div className="space-y-2">
            {city.champions.map((c) => (
              <div key={c.id} className="rounded-lg border px-4 py-3 text-sm">
                <span className="mr-2">{positionEmoji[c.position] || ''}</span>
                <span className="font-medium">{c.sportName}</span>
                <span className="text-muted-foreground"> - {c.eventName} ({c.eventYear})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
