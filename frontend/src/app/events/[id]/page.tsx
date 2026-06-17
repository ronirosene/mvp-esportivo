'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { eventsApi, type EventData } from '@/services/events';
import { eventSportsApi, type EventSportData } from '@/services/event-sports';
import { eventSportCitiesApi, type EventSportCityData } from '@/services/event-sport-cities';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const STATUS_LABEL: Record<string, string> = {
  PLANEJAMENTO: 'Planejamento',
  EM_ANDAMENTO: 'Em Andamento',
  FINALIZADO: 'Finalizado',
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [event, setEvent] = useState<EventData | null>(null);
  const [sports, setSports] = useState<EventSportData[]>([]);
  const [participants, setParticipants] = useState<Record<string, EventSportCityData[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEvent = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventsApi.get(params.id as string);
      setEvent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar evento');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const fetchSports = useCallback(async () => {
    try {
      const data = await eventSportsApi.list(params.id as string);
      setSports(data);
      return data;
    } catch {
      return [];
    }
  }, [params.id]);

  const fetchParticipants = useCallback(async (sportsData: EventSportData[]) => {
    const result: Record<string, EventSportCityData[]> = {};
    for (const es of sportsData) {
      try {
        result[es.id] = await eventSportCitiesApi.list(es.id);
      } catch {
        result[es.id] = [];
      }
    }
    setParticipants(result);
  }, []);

  useEffect(() => {
    async function load() {
      await fetchEvent();
      const sportsData = await fetchSports();
      if (sportsData.length > 0) fetchParticipants(sportsData);
    }
    load();
  }, [fetchEvent, fetchSports, fetchParticipants]);

  async function handleRemoveSport(sportId: string) {
    try {
      await eventSportsApi.remove(params.id as string, sportId);
      const data = await fetchSports();
      if (data.length > 0) fetchParticipants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover modalidade');
    }
  }

  async function handleRemoveParticipant(eventSportId: string, cityId: string) {
    try {
      await eventSportCitiesApi.remove(eventSportId, cityId);
      fetchParticipants(sports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover participante');
    }
  }

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!event) return <p className="text-muted-foreground">Evento não encontrado.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{event.nome}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/events')}>Voltar</Button>
          <Button onClick={() => router.push(`/events/${event.id}/edit`)}>Editar</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ano</span>
              <span>{event.ano}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cidade Sede</span>
              <span>{event.cidadeSede}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span>{STATUS_LABEL[event.status]}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Datas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data Início</span>
              <span>{new Date(event.dataInicio).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data Fim</span>
              <span>{new Date(event.dataFim).toLocaleDateString('pt-BR')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Modalidades do Evento</CardTitle>
        </CardHeader>
        <CardContent>
          {sports.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma modalidade vinculada.</p>
          ) : (
            <div className="space-y-4">
              {sports.map((es) => {
                const parts = participants[es.id] || [];
                return (
                  <div key={es.id} className="rounded-md border">
                    <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2">
                      <div>
                        <span className="text-sm font-medium">{es.sport.nome}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{es.sport.categoria}</span>
                      </div>
                      {token && (
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleRemoveSport(es.sport.id)}>
                          Remover
                        </Button>
                      )}
                    </div>
                    {parts.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-muted-foreground">Nenhum participante.</p>
                    ) : (
                      <div className="divide-y">
                        {parts.map((p) => (
                          <div key={p.id} className="flex items-center justify-between px-3 py-1.5">
                            <span className="text-sm">{p.city.nome} <span className="text-xs text-muted-foreground">({p.city.siglaEstado})</span></span>
                            {token && (
                              <Button variant="ghost" size="sm" className="text-destructive h-6 text-xs" onClick={() => handleRemoveParticipant(es.id, p.cityId)}>
                                Remover
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {token && (
                      <div className="border-t px-3 py-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/events/${event.id}/sports/${es.id}/cities/new`)}>
                          Adicionar Cidade
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {token && (
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={() => router.push(`/events/${event.id}/sports/new`)}>
                Adicionar Modalidade
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
