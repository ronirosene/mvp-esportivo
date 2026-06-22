'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sportsApi } from '@/services/sports';
import type { SportData } from '@/services/event-sports';

export default function SportsPage() {
  const router = useRouter();
  const [sports, setSports] = useState<SportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNome, setNewNome] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      setSports(await sportsApi.list());
      setError('');
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar modalidades');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    if (!newNome.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await sportsApi.create(newNome.trim());
      setNewNome('');
      await load();
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar modalidade');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm('Desativar esta modalidade?')) return;
    try {
      await sportsApi.remove(id);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Erro ao desativar modalidade');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Catálogo de Modalidades</h1>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Nova modalidade..."
          value={newNome}
          onChange={(e) => setNewNome(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <button
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          onClick={handleCreate}
          disabled={submitting}
        >
          {submitting ? 'Adicionando...' : 'Adicionar'}
        </button>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : sports.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma modalidade cadastrada.</p>
      ) : (
        <div className="divide-y rounded-lg border">
          {sports.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-medium">{s.nome}</p>
              <button
                className="text-xs text-destructive hover:text-destructive/80"
                onClick={() => handleRemove(s.id)}
              >
                Desativar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
