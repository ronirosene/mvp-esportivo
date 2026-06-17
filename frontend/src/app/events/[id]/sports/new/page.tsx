'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { eventSportsApi } from '@/services/event-sports';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SportOption {
  id: string;
  nome: string;
  categoria: string;
}

export default function AddSportPage() {
  const params = useParams();
  const router = useRouter();
  const [sports, setSports] = useState<SportOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/sports');
        if (!res.ok) throw new Error('Erro ao carregar modalidades');
        const data = await res.json();
        setSports(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar modalidades');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleAdd(sportId: string) {
    try {
      await eventSportsApi.add(params.id as string, sportId);
      router.push(`/events/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar modalidade');
    }
  }

  if (loading) return <p className="text-muted-foreground">Carregando modalidades...</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Adicionar Modalidade</h1>
        <Button variant="outline" onClick={() => router.push(`/events/${params.id}`)}>Voltar</Button>
      </div>

      {sports.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma modalidade disponível.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sports.map((sport) => (
            <Card key={sport.id} className="cursor-pointer hover:bg-accent transition-colors" onClick={() => handleAdd(sport.id)}>
              <CardHeader>
                <CardTitle className="text-base">{sport.nome}</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-xs text-muted-foreground">{sport.categoria}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
