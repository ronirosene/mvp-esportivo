'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cityHistoryApi, type CityPublicData } from '@/services/city-history';

export default function CidadesContent() {
  const router = useRouter();
  const [cities, setCities] = useState<CityPublicData[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cityHistoryApi.list().then(setCities).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? cities.filter((c) => c.nome.toLowerCase().includes(search.toLowerCase()) || c.siglaEstado.toLowerCase().includes(search.toLowerCase()))
    : cities;

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cidades Participantes</h1>
        <p className="text-sm text-muted-foreground">
          {cities.length} cidade(s) cadastrada(s)
        </p>
      </div>

      <input
        className="w-full rounded-md border px-3 py-2 text-sm"
        placeholder="Pesquisar por nome ou estado..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma cidade encontrada.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/30"
              onClick={() => router.push(`/cidades/${c.id}`)}
            >
              <p className="font-semibold">{c.nome} - {c.siglaEstado}</p>
              <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                <span>{c.totalParticipacoes} participa{c.totalParticipacoes === 1 ? 'ção' : 'ções'}</span>
                {c.totalTitulos > 0 && <span>{c.totalTitulos} títul{c.totalTitulos === 1 ? 'o' : 'os'}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
