'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { citiesApi, type CityData } from '@/services/cities';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';

function ConfirmModal({ open, onConfirm, onCancel }: { open: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-lg">
        <h3 className="text-lg font-semibold">Confirmar Exclusão</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Tem certeza que deseja excluir esta cidade? Esta ação não pode ser desfeita.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm}>Excluir</Button>
        </div>
      </div>
    </div>
  );
}

export default function CitiesPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCities = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await citiesApi.list();
      setCities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar cidades');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCities(); }, [fetchCities]);

  async function handleDelete(id: string) {
    try {
      await citiesApi.remove(id);
      setDeleteId(null);
      fetchCities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;
  if (error)
    return (
      <div className="space-y-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchCities}>Tentar novamente</Button>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Cidades</h1>
        {token && <Button onClick={() => router.push('/cities/new')}>Nova Cidade</Button>}
      </div>

      {cities.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma cidade cadastrada.</p>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Cidade</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
                <th className="px-4 py-3 text-left font-medium">Sigla</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((city) => (
                <tr key={city.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{city.nome}</td>
                  <td className="px-4 py-3">{city.estado}</td>
                  <td className="px-4 py-3">{city.siglaEstado}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/cities/${city.id}`)}>
                        Ver
                      </Button>
                      {token && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/cities/${city.id}/edit`)}>
                            Editar
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(city.id)}>
                            Excluir
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
