'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { eventSportCitiesApi } from '@/services/event-sport-cities';
import { Button } from '@/components/ui/button';

interface CityOption {
  id: string;
  nome: string;
  siglaEstado: string;
}

export default function AddCityToSportPage() {
  const params = useParams();
  const router = useRouter();
  const [allCities, setAllCities] = useState<CityOption[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [citiesRes, enrolled] = await Promise.all([
          fetch('/api/cities').then((r) => r.json()),
          eventSportCitiesApi.list(params.eventSportId as string),
        ]);
        const enrolledIds = new Set(enrolled.map((e) => e.cityId));
        const available = citiesRes.filter((c: CityOption) => !enrolledIds.has(c.id));
        setAllCities(available);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar cidades');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.eventSportId]);

  function toggle(cityId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cityId)) next.delete(cityId);
      else next.add(cityId);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === allCities.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allCities.map((c) => c.id)));
    }
  }

  async function handleSubmit() {
    if (selected.size === 0) return;
    setSubmitting(true);
    setError('');
    try {
      await eventSportCitiesApi.addBulk(params.eventSportId as string, Array.from(selected));
      router.push(`/events/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao inscrever cidades');
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-muted-foreground">Carregando cidades...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Adicionar Cidades</h1>
          <p className="text-sm text-muted-foreground">
            Selecione as cidades que deseja inscrever{allCities.length > 0 && ` (${allCities.length} disponíveis)`}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/events/${params.id}`)}>Voltar</Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {allCities.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
          Todas as cidades já estão inscritas nesta modalidade.
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
            >
              {selected.size === allCities.length ? 'Desmarcar todas' : 'Selecionar todas'}
            </Button>
            <span className="text-xs text-muted-foreground">
              {selected.size} selecionada(s)
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allCities.map((city) => {
              const isSelected = selected.has(city.id);
              return (
                <label
                  key={city.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-accent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(city.id)}
                    className="h-4 w-4 rounded border-gray-300 text-primary"
                  />
                  <div>
                    <span className="text-sm font-medium">{city.nome}</span>
                    <span className="ml-1 text-xs text-muted-foreground">{city.siglaEstado}</span>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={selected.size === 0 || submitting}
            >
              {submitting ? 'Inscrevendo...' : `Inscrever ${selected.size} cidade(s)`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
