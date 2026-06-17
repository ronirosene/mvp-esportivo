'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { citiesApi, type CityData } from '@/services/cities';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EditCityPage() {
  const params = useParams();
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [estado, setEstado] = useState('');
  const [siglaEstado, setSiglaEstado] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await citiesApi.get(params.id as string);
        setNome(data.nome);
        setEstado(data.estado);
        setSiglaEstado(data.siglaEstado);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar cidade');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await citiesApi.update(params.id as string, { nome, estado, siglaEstado });
      router.push(`/cities/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar cidade');
    }
  }

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Editar Cidade</h1>
        <Button variant="outline" onClick={() => router.push(`/cities/${params.id}`)}>Voltar</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Cidade</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input id="estado" value={estado} onChange={(e) => setEstado(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siglaEstado">Sigla</Label>
              <Input id="siglaEstado" value={siglaEstado} onChange={(e) => setSiglaEstado(e.target.value.toUpperCase())} maxLength={2} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">Salvar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
