'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { matchesApi, type MatchData } from '@/services/matches';
import { standingsApi, type StandingData } from '@/services/standings';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

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

  useEffect(() => {
    async function load() {
      await fetchMatches();
      await fetchStandings();
      setLoading(false);
    }
    load();
  }, []);

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

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Partidas do Grupo</h1>
        <Button variant="outline" onClick={() => router.push(`/events/${params.id}`)}>Voltar</Button>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleGenerate}>Gerar Partidas</Button>
        {matches.length > 0 && (
          <Button variant="destructive" onClick={handleRemove}>Excluir Partidas</Button>
        )}
      </div>

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
                    <th className="pb-2 font-medium">Data</th>
                    <th className="pb-2 font-medium">Mandante</th>
                    <th className="pb-2 font-medium">Visitante</th>
                    <th className="pb-2 font-medium">Placar</th>
                    <th className="pb-2 font-medium">Status</th>
                    {token && <th className="pb-2 font-medium">Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m) => (
                    <tr key={m.id} className="border-b last:border-0">
                      {editingId === m.id ? (
                        <>
                          <td className="py-2 text-muted-foreground">
                            {m.matchDate ? new Date(m.matchDate).toLocaleDateString('pt-BR') : '-'}
                          </td>
                          <td className="py-2 font-medium">{m.homeCity.nome}</td>
                          <td className="py-2 font-medium">{m.awayCity.nome}</td>
                          <td className="py-2">
                            <input
                              type="number" min="0"
                              defaultValue={m.homeScore ?? ''}
                              id={`home-${m.id}`}
                              className="w-12 rounded border px-1 py-0.5 text-center"
                            />{' '}
                            x{' '}
                            <input
                              type="number" min="0"
                              defaultValue={m.awayScore ?? ''}
                              id={`away-${m.id}`}
                              className="w-12 rounded border px-1 py-0.5 text-center"
                            />
                          </td>
                          <td className="py-2">
                            <select
                              defaultValue={m.status}
                              id={`status-${m.id}`}
                              className="rounded border px-1 py-0.5 text-xs"
                            >
                              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                              ))}
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
                          <td className="py-2 text-muted-foreground">
                            {m.matchDate ? new Date(m.matchDate).toLocaleDateString('pt-BR') : '-'}
                          </td>
                          <td className="py-2 font-medium">{m.homeCity.nome}</td>
                          <td className="py-2 font-medium">{m.awayCity.nome}</td>
                          <td className="py-2">
                            {m.homeScore !== null && m.awayScore !== null
                              ? `${m.homeScore} x ${m.awayScore}`
                              : '-'}
                          </td>
                          <td className="py-2">
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                              {STATUS_LABEL[m.status] || m.status}
                            </span>
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
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          s.position === 1
                            ? 'bg-yellow-100 text-yellow-800'
                            : s.position === 2
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-muted text-muted-foreground'
                        }`}>
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
