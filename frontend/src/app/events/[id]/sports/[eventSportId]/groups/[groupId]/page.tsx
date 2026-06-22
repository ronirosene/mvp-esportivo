'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { matchesApi, type MatchData } from '@/services/matches';
import { standingsApi, type StandingData } from '@/services/standings';
import { eventSportGroupsApi, type GroupData } from '@/services/event-sport-groups';
import { groupParticipantsApi } from '@/services/group-participants';
import { eventSportCitiesApi, type EventSportCityData } from '@/services/event-sport-cities';
import { eventSportsApi, type EventSportData } from '@/services/event-sports';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: 'Agendada',
  IN_PROGRESS: 'Em Andamento',
  FINISHED: 'Finalizada',
  CANCELLED: 'Cancelada',
};

export default function GroupMatchesPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [standings, setStandings] = useState<StandingData[]>([]);
  const [group, setGroup] = useState<GroupData | null>(null);
  const [eventSport, setEventSport] = useState<EventSportData | null>(null);
  const [availableCities, setAvailableCities] = useState<EventSportCityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualHome, setManualHome] = useState('');
  const [manualAway, setManualAway] = useState('');
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('');
  const [manualLocation, setManualLocation] = useState('');
  const [manualRound, setManualRound] = useState('');
  const [manualDisplayOrder, setManualDisplayOrder] = useState('');
  const [manualFase, setManualFase] = useState('GRUPOS');
  const [showAddCity, setShowAddCity] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');

  const fetchMatches = async () => {
    try {
      const data = await matchesApi.listByGroup(params.groupId as string);
      setMatches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar partidas');
    }
  };

  const fetchStandings = async () => {
    try {
      const data = await standingsApi.get(params.groupId as string);
      setStandings(data);
    } catch {
      setStandings([]);
    }
  };

  const fetchGroup = async () => {
    const groups = await eventSportGroupsApi.list(params.eventSportId as string);
    const g = groups.find((g) => g.id === params.groupId);
    setGroup(g || null);
  };

  const fetchEventSport = async () => {
    const list = await eventSportsApi.list(params.id as string);
    const es = list.find((s) => s.id === params.eventSportId);
    setEventSport(es || null);
  };

  const fetchAvailableCities = async () => {
    const participants = await eventSportCitiesApi.list(params.eventSportId as string);
    const groupCityIds = group?.groupParticipants.map((gp) => gp.eventSportCity.city.id) || [];
    setAvailableCities(participants.filter((p) => !groupCityIds.includes(p.city.id)));
  };

  useEffect(() => {
    async function load() {
      await fetchGroup();
      await fetchEventSport();
      await fetchMatches();
      await fetchStandings();
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (group) fetchAvailableCities();
  }, [group]);

  async function handleGenerate() {
    try {
      setLoading(true);
      await matchesApi.generate(params.groupId as string);
      await fetchMatches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar partidas');
      setLoading(false);
    }
  }

  async function handleRemove() {
    if (!window.confirm('Tem certeza que deseja excluir todas as partidas?')) return;
    try {
      setLoading(true);
      await matchesApi.removeByGroup(params.groupId as string);
      await fetchMatches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir partidas');
      setLoading(false);
    }
  }

  async function handleSave(match: MatchData, homeScore: string, awayScore: string, status: string) {
    const data: Record<string, unknown> = { status };
    if (homeScore !== '') data.homeScore = parseInt(homeScore, 10);
    if (awayScore !== '') data.awayScore = parseInt(awayScore, 10);
    try {
      await matchesApi.update(match.id, data as any);
      setEditingId(null);
      fetchMatches();
      fetchStandings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar partida');
    }
  }

  async function handleAddCity() {
    if (!selectedCity) return;
    try {
      const esc = availableCities.find((c) => c.city.id === selectedCity);
      if (!esc) return;
      await groupParticipantsApi.add(params.groupId as string, esc.id);
      fetchGroup();
      setSelectedCity('');
      setShowAddCity(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar cidade');
    }
  }

  async function handleRemoveCity(participantId: string) {
    try {
      await groupParticipantsApi.remove(params.groupId as string, participantId);
      fetchGroup();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover cidade');
    }
  }

  async function handleCreateManual() {
    if (!manualHome || !manualAway) {
      setError('Selecione mandante e visitante.');
      return;
    }
    if (manualHome === manualAway) {
      setError('Mandante e visitante devem ser diferentes.');
      return;
    }
    try {
      const matchDate = manualDate && manualTime ? `${manualDate}T${manualTime}:00` : undefined;
      await matchesApi.createManual(params.groupId as string, {
        homeCityId: manualHome,
        awayCityId: manualAway,
        matchDate,
        location: manualLocation || undefined,
        round: manualRound ? parseInt(manualRound, 10) : undefined,
        displayOrder: manualDisplayOrder ? parseInt(manualDisplayOrder, 10) : undefined,
        fase: manualFase,
      });
      setShowManualForm(false);
      setManualHome('');
      setManualAway('');
      setManualDate('');
      setManualTime('');
      setManualLocation('');
      setManualRound('');
      setManualDisplayOrder('');
      setManualFase('GRUPOS');
      fetchMatches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar partida');
    }
  }

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  const isManual = eventSport?.drawMode === 'MANUAL';
  const groupCityIds = group?.groupParticipants.map((gp) => gp.eventSportCity.city.id) || [];
  const groupCitiesForMatch = group?.groupParticipants.map((gp) => gp.eventSportCity.city) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Partidas do Grupo</h1>
        <Button variant="outline" onClick={() => router.push(`/events/${params.id}`)}>Voltar</Button>
      </div>

      {token && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Participantes do Grupo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {group && group.groupParticipants.length > 0 ? (
              <div className="space-y-1">
                {group.groupParticipants.map((gp) => (
                  <div key={gp.id} className="flex items-center justify-between rounded border px-3 py-1.5 text-sm">
                    <span>{gp.eventSportCity.city.nome} ({gp.eventSportCity.city.siglaEstado})</span>
                    <Button variant="ghost" size="sm" className="text-destructive h-6 text-xs" onClick={() => handleRemoveCity(gp.id)}>
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma cidade neste grupo.</p>
            )}
            {showAddCity ? (
              <div className="flex gap-2">
                <select
                  className="rounded border px-2 py-1 text-sm flex-1"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="">Selecione uma cidade...</option>
                  {availableCities.map((c) => (
                    <option key={c.id} value={c.city.id}>{c.city.nome} ({c.city.siglaEstado})</option>
                  ))}
                </select>
                <Button size="sm" onClick={handleAddCity}>Adicionar</Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowAddCity(false); setSelectedCity(''); }}>Cancelar</Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowAddCity(true)}>Adicionar Cidade</Button>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 flex-wrap">
        {(!isManual) && (
          <Button onClick={handleGenerate}>Gerar Partidas</Button>
        )}
        {token && (
          <Button onClick={() => setShowManualForm(!showManualForm)}>
            {showManualForm ? 'Cancelar' : 'Criar Partida'}
          </Button>
        )}
        {matches.length > 0 && (
          <Button variant="destructive" onClick={handleRemove}>Excluir Partidas</Button>
        )}
      </div>

      {showManualForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nova Partida</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Mandante</label>
                <select className="w-full rounded border px-2 py-1 text-sm" value={manualHome} onChange={(e) => setManualHome(e.target.value)}>
                  <option value="">Selecione...</option>
                  {groupCitiesForMatch.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Visitante</label>
                <select className="w-full rounded border px-2 py-1 text-sm" value={manualAway} onChange={(e) => setManualAway(e.target.value)}>
                  <option value="">Selecione...</option>
                  {groupCitiesForMatch.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Data</label>
                <input type="date" className="w-full rounded border px-2 py-1 text-sm" value={manualDate} onChange={(e) => setManualDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium">Horário</label>
                <input type="time" className="w-full rounded border px-2 py-1 text-sm" value={manualTime} onChange={(e) => setManualTime(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium">Local</label>
                <input className="w-full rounded border px-2 py-1 text-sm" value={manualLocation} onChange={(e) => setManualLocation(e.target.value)} placeholder="Ginásio Municipal" />
              </div>
              <div>
                <label className="text-xs font-medium">Rodada</label>
                <input type="number" min="1" className="w-full rounded border px-2 py-1 text-sm" value={manualRound} onChange={(e) => setManualRound(e.target.value)} placeholder="1" />
              </div>
              <div>
                <label className="text-xs font-medium">Ordem</label>
                <input type="number" min="1" className="w-full rounded border px-2 py-1 text-sm" value={manualDisplayOrder} onChange={(e) => setManualDisplayOrder(e.target.value)} placeholder="1" />
              </div>
              <div>
                <label className="text-xs font-medium">Fase</label>
                <select className="w-full rounded border px-2 py-1 text-sm" value={manualFase} onChange={(e) => setManualFase(e.target.value)}>
                  <option value="GRUPOS">Grupos</option>
                  <option value="QUARTAS">Quartas</option>
                  <option value="SEMIFINAL">Semifinal</option>
                  <option value="FINAL">Final</option>
                  <option value="TERCEIRO_LUGAR">Terceiro Lugar</option>
                </select>
              </div>
            </div>
            <Button onClick={handleCreateManual}>Salvar Partida</Button>
          </CardContent>
        </Card>
      )}

      {matches.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma partida gerada.</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Confrontos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">Data</th>
                    <th className="pb-2 font-medium">Mandante</th>
                    <th className="pb-2 font-medium">Visitante</th>
                    <th className="pb-2 font-medium">Placar</th>
                    <th className="pb-2 font-medium">Status</th>
                    {token && <th className="pb-2 font-medium">Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m, idx) => (
                    <tr key={m.id} className="border-b last:border-0">
                      {editingId === m.id ? (
                        <>
                          <td className="py-2 text-muted-foreground">{m.round || m.displayOrder || idx + 1}</td>
                          <td className="py-2 text-muted-foreground">
                            {m.matchDate ? new Date(m.matchDate).toLocaleDateString('pt-BR') : '-'}
                          </td>
                          <td className="py-2 font-medium">{m.homeCity.nome}</td>
                          <td className="py-2 font-medium">{m.awayCity.nome}</td>
                          <td className="py-2">
                            <input type="number" min="0" defaultValue={m.homeScore ?? ''} id={`home-${m.id}`} className="w-12 rounded border px-1 py-0.5 text-center" />{' '} x{' '}
                            <input type="number" min="0" defaultValue={m.awayScore ?? ''} id={`away-${m.id}`} className="w-12 rounded border px-1 py-0.5 text-center" />
                          </td>
                          <td className="py-2">
                            <select defaultValue={m.status} id={`status-${m.id}`} className="rounded border px-1 py-0.5 text-xs">
                              {Object.entries(STATUS_LABEL).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
                            </select>
                          </td>
                          <td className="py-2">
                            <div className="flex gap-1">
                              <Button size="sm" variant="default" onClick={() => {
                                const el = document.getElementById(`home-${m.id}`) as HTMLInputElement;
                                const el2 = document.getElementById(`away-${m.id}`) as HTMLInputElement;
                                const el3 = document.getElementById(`status-${m.id}`) as HTMLSelectElement;
                                handleSave(m, el.value, el2.value, el3.value);
                              }}>Salvar</Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancelar</Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-2 text-muted-foreground">{m.round || m.displayOrder || idx + 1}</td>
                          <td className="py-2 text-muted-foreground">
                            {m.matchDate ? new Date(m.matchDate).toLocaleDateString('pt-BR') : '-'}
                          </td>
                          <td className="py-2 font-medium">{m.homeCity.nome}</td>
                          <td className="py-2 font-medium">{m.awayCity.nome}</td>
                          <td className="py-2">{m.homeScore !== null && m.awayScore !== null ? `${m.homeScore} x ${m.awayScore}` : '-'}</td>
                          <td className="py-2">
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{STATUS_LABEL[m.status] || m.status}</span>
                          </td>
                          {token && (
                            <td className="py-2">
                              <Button size="sm" variant="outline" onClick={() => setEditingId(m.id)}>Editar</Button>
                            </td>
                          )}
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {standings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Classificação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium w-10">Pos</th>
                    <th className="pb-2 font-medium">Cidade</th>
                    <th className="pb-2 font-medium w-8">J</th>
                    <th className="pb-2 font-medium w-8">V</th>
                    <th className="pb-2 font-medium w-8">E</th>
                    <th className="pb-2 font-medium w-8">D</th>
                    <th className="pb-2 font-medium w-8">GP</th>
                    <th className="pb-2 font-medium w-8">GC</th>
                    <th className="pb-2 font-medium w-8">SG</th>
                    <th className="pb-2 font-medium w-10">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((s) => (
                    <tr key={s.id} className={`border-b last:border-0 ${s.position <= 2 ? 'font-semibold' : ''}`}>
                      <td className="py-2">
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${s.position === 1 ? 'bg-yellow-100 text-yellow-800' : s.position === 2 ? 'bg-gray-100 text-gray-800' : 'bg-muted text-muted-foreground'}`}>
                          {s.position}
                        </span>
                      </td>
                      <td className="py-2">{s.city.nome}</td>
                      <td className="py-2 text-center">{s.played}</td>
                      <td className="py-2 text-center">{s.wins}</td>
                      <td className="py-2 text-center">{s.draws}</td>
                      <td className="py-2 text-center">{s.losses}</td>
                      <td className="py-2 text-center">{s.goalsFor}</td>
                      <td className="py-2 text-center">{s.goalsAgainst}</td>
                      <td className="py-2 text-center">{s.goalDifference}</td>
                      <td className="py-2 text-center font-bold">{s.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
