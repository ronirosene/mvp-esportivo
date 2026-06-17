'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { eventsApi, type EventData } from '@/services/events';
import { eventSportsApi, type EventSportData } from '@/services/event-sports';
import { eventSportGroupsApi, type GroupData } from '@/services/event-sport-groups';
import { eventSportCitiesApi, type EventSportCityData } from '@/services/event-sport-cities';
import { playoffsApi } from '@/services/playoffs';
import type { MatchData } from '@/services/matches';
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
  const [groups, setGroups] = useState<Record<string, GroupData[]>>({});
const [playoffs, setPlayoffs] = useState<Record<string, MatchData[]>>({});
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

  const fetchGroups = useCallback(async (sportsData: EventSportData[]) => {
    const result: Record<string, GroupData[]> = {};
    for (const es of sportsData) {
      try {
        result[es.id] = await eventSportGroupsApi.list(es.id);
      } catch {
        result[es.id] = [];
      }
    }
    setGroups(result);
  }, []);

  const fetchPlayoffs = useCallback(async (sportsData: EventSportData[]) => {
    const result: Record<string, MatchData[]> = {};
    for (const es of sportsData) {
      try {
        result[es.id] = await playoffsApi.list(es.id);
      } catch {
        result[es.id] = [];
      }
    }
    setPlayoffs(result);
  }, []);

  useEffect(() => {
    async function load() {
      await fetchEvent();
      const sportsData = await fetchSports();
      if (sportsData.length > 0) {
        fetchParticipants(sportsData);
        fetchGroups(sportsData);
        fetchPlayoffs(sportsData);
      }
    }
    load();
  }, [fetchEvent, fetchSports, fetchParticipants, fetchGroups]);

  async function handleRemoveSport(sportId: string) {
    try {
      await eventSportsApi.remove(params.id as string, sportId);
      const data = await fetchSports();
      if (data.length > 0) {
        fetchParticipants(data);
        fetchGroups(data);
      }
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

  async function handleCreateGroup(eventSportId: string) {
    const nome = prompt('Nome do grupo (ex: Grupo A):');
    if (!nome) return;
    try {
      await eventSportGroupsApi.create(eventSportId, nome);
      fetchGroups(sports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar grupo');
    }
  }

  async function handleGenerateGroups(eventSportId: string) {
    const groupCountStr = prompt('Quantidade de grupos?');
    if (!groupCountStr) return;
    const groupCount = parseInt(groupCountStr, 10);
    if (isNaN(groupCount) || groupCount < 1) {
      setError('Informe um número válido de grupos.');
      return;
    }
    try {
      await eventSportGroupsApi.generate(eventSportId, groupCount);
      fetchGroups(sports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar grupos');
    }
  }

  async function handleRegenerateGroups(eventSportId: string) {
    if (!window.confirm('Tem certeza que deseja regerar os grupos? Os grupos atuais serão excluídos.')) return;
    const groupCountStr = prompt('Quantidade de grupos?');
    if (!groupCountStr) return;
    const groupCount = parseInt(groupCountStr, 10);
    if (isNaN(groupCount) || groupCount < 1) {
      setError('Informe um número válido de grupos.');
      return;
    }
    try {
      await eventSportGroupsApi.generate(eventSportId, groupCount);
      fetchGroups(sports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao regerar grupos');
    }
  }

  async function handleRemoveGroups(eventSportId: string) {
    if (!window.confirm('Tem certeza que deseja excluir todos os grupos?')) return;
    try {
      await eventSportGroupsApi.remove(eventSportId);
      fetchGroups(sports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir grupos');
    }
  }

  async function handleGeneratePlayoffs(eventSportId: string) {
    try {
      await playoffsApi.generate(eventSportId);
      fetchPlayoffs(sports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar eliminatórias');
    }
  }

  async function handleAdvancePlayoffs(eventSportId: string) {
    try {
      await playoffsApi.advance(eventSportId);
      fetchPlayoffs(sports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao avançar fase');
    }
  }

  async function handleToggleDrawMode(eventSportId: string) {
    const es = sports.find((s) => s.id === eventSportId);
    if (!es) return;
    const newMode = es.drawMode === 'MANUAL' ? 'AUTOMATIC' : 'MANUAL';
    try {
      await eventSportsApi.update(params.id as string, eventSportId, { drawMode: newMode as any });
      fetchSports();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar modo');
    }
  }

  async function handleUpdateConfig(eventSportId: string) {
    const countStr = prompt('Classificados por grupo? (padrão: 2)');
    if (!countStr) return;
    const count = parseInt(countStr, 10);
    if (isNaN(count) || count < 1) return;
    const third = window.confirm('Gerar partida de terceiro lugar?');
    try {
      await playoffsApi.updateConfig(params.id as string, eventSportId, {
        classificationCount: count,
        generateThirdPlace: third,
      });
      fetchPlayoffs(sports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar configuração');
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
                        <span className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${es.drawMode === 'MANUAL' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                          {es.drawMode === 'MANUAL' ? 'MANUAL' : 'AUTOMÁTICO'}
                        </span>
                      </div>
                      {token && (
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handleToggleDrawMode(es.id)}>
                            Modo {es.drawMode === 'MANUAL' ? 'Automático' : 'Manual'}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleRemoveSport(es.sport.id)}>
                            Remover
                          </Button>
                        </div>
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
                    <div className="border-t px-3 py-2">
                      {token && (
                        <div className="flex gap-2 mb-2">
                          <Button variant="outline" size="sm" onClick={() => handleUpdateConfig(es.id)}>
                            Config. Eliminatórias
                          </Button>
                        </div>
                      )}
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Grupos</h4>
                      {token && (
                        <div className="flex gap-2 mb-2 flex-wrap">
                          {es.drawMode === 'MANUAL' ? (
                            <Button variant="outline" size="sm" onClick={() => handleCreateGroup(es.id)}>
                              Criar Grupo
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => handleGenerateGroups(es.id)}>
                              Gerar Grupos
                            </Button>
                          )}
                          {(groups[es.id]?.length ?? 0) > 0 && (
                            <>
                              {es.drawMode !== 'MANUAL' && (
                                <Button variant="outline" size="sm" onClick={() => handleRegenerateGroups(es.id)}>
                                  Regerar Grupos
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleRemoveGroups(es.id)}>
                                Excluir Grupos
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                      {!groups[es.id] || groups[es.id].length === 0 ? (
                        <p className="text-xs text-muted-foreground">Nenhum grupo gerado.</p>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {groups[es.id].map((g) => (
                            <div key={g.id} className="rounded-md border bg-muted/20 p-2">
                              <p className="text-xs font-semibold mb-1">{g.nome}</p>
                              <ul className="text-xs space-y-0.5">
                                {g.groupParticipants.map((gp) => (
                                  <li key={gp.id}>{gp.eventSportCity.city.nome}</li>
                                ))}
                              </ul>
                              <Button variant="link" size="sm" className="h-auto p-0 text-xs mt-1" onClick={() => router.push(`/events/${event.id}/sports/${es.id}/groups/${g.id}`)}>
                                Ver Partidas
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="border-t px-3 py-2">
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Eliminatórias</h4>
                      {token && (
                        <div className="flex gap-2 mb-2">
                          <Button variant="outline" size="sm" onClick={() => handleGeneratePlayoffs(es.id)}>
                            Gerar Eliminatórias
                          </Button>
                          {(playoffs[es.id]?.length ?? 0) > 0 && (
                            <Button variant="outline" size="sm" onClick={() => handleAdvancePlayoffs(es.id)}>
                              Avançar Fase
                            </Button>
                          )}
                        </div>
                      )}
                      {!playoffs[es.id] || playoffs[es.id].length === 0 ? (
                        <p className="text-xs text-muted-foreground">Nenhum confronto gerado.</p>
                      ) : (
                        <div className="space-y-2">
                          {playoffs[es.id].map((m) => (
                            <div key={m.id} className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-1.5 text-sm">
                              <span>{m.homeCity.nome} ({m.homeCity.siglaEstado})</span>
                              <span className="text-xs font-semibold uppercase text-muted-foreground">vs</span>
                              <span>{m.awayCity.nome} ({m.awayCity.siglaEstado})</span>
                              <span className="text-xs text-muted-foreground capitalize">{m.status === 'FINISHED' ? `${m.homeScore ?? '?'} x ${m.awayScore ?? '?'}` : m.fase.toLowerCase()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
