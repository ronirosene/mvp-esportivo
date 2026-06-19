'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { sponsorsApi, type SponsorData } from '@/services/sponsors';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';

export default function SponsorsPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [sponsors, setSponsors] = useState<SponsorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSponsors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await sponsorsApi.list();
      setSponsors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar patrocinadores');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSponsors(); }, [fetchSponsors]);

  async function handleRemove(id: string) {
    try {
      await sponsorsApi.remove(id);
      fetchSponsors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;
  if (error) return <div className="space-y-4"><p className="text-destructive">{error}</p><Button onClick={fetchSponsors}>Tentar novamente</Button></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Patrocinadores</h1>
        {token && <Button onClick={() => router.push('/sponsors/new')}>Novo Patrocinador</Button>}
      </div>

      {sponsors.length === 0 ? (
        <p className="text-muted-foreground">Nenhum patrocinador cadastrado.</p>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Nome</th>
                <th className="px-4 py-3 text-left font-medium">Tipo</th>
                <th className="px-4 py-3 text-center font-medium">Destaque</th>
                <th className="px-4 py-3 text-center font-medium">Ativo</th>
                <th className="px-4 py-3 text-right font-medium">Views</th>
                <th className="px-4 py-3 text-right font-medium">Cliques</th>
                <th className="px-4 py-3 text-right font-medium">CTR</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sponsors.map((s) => {
                const ctr = s.views > 0 ? ((s.clicks / s.views) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{s.nome}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.tipo}</td>
                    <td className="px-4 py-3 text-center">{s.destaque ? 'Sim' : '-'}</td>
                    <td className="px-4 py-3 text-center">{s.ativo ? 'Sim' : 'Não'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{s.views}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{s.clicks}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{ctr}%</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/sponsors/${s.id}/edit`)}>
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { if (confirm('Excluir este patrocinador?')) handleRemove(s.id); }}>
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
