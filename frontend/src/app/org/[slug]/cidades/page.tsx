'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';

interface CitySummary {
  id: string;
  nome: string;
  siglaEstado: string;
  brasaoUrl: string | null;
  champions: number;
}

export default function OrgCidadesList() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [cities, setCities] = useState<CitySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<CitySummary[]>(`/public/cities?orgSlug=${slug}`)
      .then(setCities)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Cidades</h1>
      {cities.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma cidade encontrada.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <div key={city.id} className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/50"
              onClick={() => router.push(`/org/${slug}/cidades/${city.id}`)}>
              <div className="flex items-center gap-3">
                {city.brasaoUrl ? <img src={city.brasaoUrl} alt={city.nome} className="h-8 w-8 rounded-full object-cover" /> : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">{city.nome[0]}</div>}
                <div>
                  <p className="font-medium">{city.nome}</p>
                  <p className="text-xs text-muted-foreground">{city.siglaEstado}</p>
                </div>
              </div>
              {city.champions > 0 && <p className="mt-2 text-xs text-muted-foreground">{city.champions} título(s)</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
