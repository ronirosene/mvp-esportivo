'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sponsorsApi } from '@/services/sponsors';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


export default function NewSponsorPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [website, setWebsite] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [destaque, setDestaque] = useState(false);
  const [ordem, setOrdem] = useState(0);
  const [tipo, setTipo] = useState<'PATROCINADOR' | 'APOIADOR' | 'PARCEIRO' | 'PUBLICIDADE'>('PATROCINADOR');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await sponsorsApi.create({
        nome,
        logoUrl: logoUrl || undefined,
        website: website || undefined,
        descricao: descricao || undefined,
        ativo,
        destaque,
        ordem,
        tipo,
      });
      router.push('/sponsors');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar patrocinador');
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Novo Patrocinador</h1>
        <Button variant="outline" onClick={() => router.push('/sponsors')}>Voltar</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <select id="tipo" className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={tipo} onChange={(e) => setTipo(e.target.value as any)}>
                <option value="PATROCINADOR">Patrocinador</option>
                <option value="APOIADOR">Apoiador</option>
                <option value="PARCEIRO">Parceiro</option>
                <option value="PUBLICIDADE">Publicidade</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">URL da Logo</Label>
              <Input id="logoUrl" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <textarea id="descricao" className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ordem">Ordem de Exibição</Label>
              <Input id="ordem" type="number" min={0} value={ordem} onChange={(e) => setOrdem(parseInt(e.target.value) || 0)} />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
                Ativo
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={destaque} onChange={(e) => setDestaque(e.target.checked)} />
                Destaque
              </label>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">Salvar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
