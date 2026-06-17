'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { eventsApi } from '@/services/events';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const STATUS_OPTIONS = [
  { value: 'PLANEJAMENTO', label: 'Planejamento' },
  { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
  { value: 'FINALIZADO', label: 'Finalizado' },
];

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState({
    nome: '',
    ano: '',
    cidadeSede: '',
    dataInicio: '',
    dataFim: '',
    status: 'PLANEJAMENTO',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toDateInput(iso: string) {
    return iso ? iso.slice(0, 10) : '';
  }

  useEffect(() => {
    eventsApi
      .get(params.id as string)
      .then((ev) => {
        setForm({
          nome: ev.nome,
          ano: String(ev.ano),
          cidadeSede: ev.cidadeSede,
          dataInicio: toDateInput(ev.dataInicio),
          dataFim: toDateInput(ev.dataFim),
          status: ev.status,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setFetching(false));
  }, [params.id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await eventsApi.update(params.id as string, {
        nome: form.nome,
        ano: Number(form.ano),
        cidadeSede: form.cidadeSede,
        dataInicio: form.dataInicio,
        dataFim: form.dataFim,
        status: form.status as any,
      });
      router.push(`/events/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar evento');
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Editar Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={form.nome} onChange={(e) => setField('nome', e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ano">Ano</Label>
                <Input id="ano" type="number" value={form.ano} onChange={(e) => setField('ano', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidadeSede">Cidade Sede</Label>
                <Input id="cidadeSede" value={form.cidadeSede} onChange={(e) => setField('cidadeSede', e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data Início</Label>
                <Input id="dataInicio" type="date" value={form.dataInicio} onChange={(e) => setField('dataInicio', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataFim">Data Fim</Label>
                <Input id="dataFim" type="date" value={form.dataFim} onChange={(e) => setField('dataFim', e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => router.back()}>Cancelar</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
