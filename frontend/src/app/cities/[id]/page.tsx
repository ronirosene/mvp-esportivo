'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { citiesApi, type CityData } from '@/services/cities';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function CityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [city, setCity] = useState<CityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCity = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await citiesApi.get(params.id as string);
      setCity(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar cidade');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { fetchCity(); }, [fetchCity]);

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!city) return <p className="text-muted-foreground">Cidade não encontrada.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{city.nome}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/cities')}>Voltar</Button>
          <Button onClick={() => router.push(`/cities/${city.id}/edit`)}>Editar</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cidade</span>
              <span>{city.nome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado</span>
              <span>{city.estado}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sigla</span>
              <span>{city.siglaEstado}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Em breve</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Participações em eventos, títulos e modalidades serão exibidos aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
