'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { eventSportCitiesApi } from '@/services/event-sport-cities';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface CityOption {
  id: string;
  nome: string;
  siglaEstado: string;
}

export default function AddCityToSportPage() {
  const params = useParams();
  const router = useRouter();
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/cities');
        if (!res.ok) throw new Error('Erro ao carregar cidades');
        const data = await res.json();
        setCities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar cidades');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleAdd(cityId: string) {
    try {
      await eventSportCitiesApi.add(params.eventSportId as string, cityId);
      router.push(`/events/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao inscrever cidade');
    }
  }

  if (loading) return <p className="text-muted-foreground">Carregando cidades...</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Adicionar Cidade</h1>
        <Button variant="outline" onClick={() => router.push(`/events/${params.id}`)}>Voltar</Button>
      </div>

      {cities.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma cidade disponível.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <Card key={city.id} className="cursor-pointer hover:bg-accent transition-colors" onClick={() => handleAdd(city.id)}>
              <CardHeader>
                <CardTitle className="text-base">{city.nome}</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-xs text-muted-foreground">{city.siglaEstado}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
