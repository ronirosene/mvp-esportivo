'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { organizationsApi } from '@/services/organizations';

export default function EditOrganization() {
  const router = useRouter();
  const params = useParams();
  const [nome, setNome] = useState('');
  const [slug, setSlug] = useState('');
  const [descricao, setDescricao] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [plan, setPlan] = useState<'FREE' | 'PRO' | 'ENTERPRISE'>('FREE');
  const [ativo, setAtivo] = useState(true);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    organizationsApi.get(params.id as string)
      .then((org) => {
        setNome(org.nome);
        setSlug(org.slug);
        setDescricao(org.descricao || '');
        setLogoUrl(org.logoUrl || '');
        setPlan(org.plan);
        setAtivo(org.ativo);
        setSeoTitle(org.seoTitle || '');
        setSeoDescription(org.seoDescription || '');
      })
      .catch(() => router.push('/organizations'))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await organizationsApi.update(params.id as string, { nome, slug, descricao: descricao || undefined, logoUrl: logoUrl || undefined, plan, ativo, seoTitle: seoTitle || undefined, seoDescription: seoDescription || undefined });
      router.push('/organizations');
    } catch (err: any) { setMsg(err.message); } finally { setSaving(false); }
  }

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Editar Organização</h1>
      {msg && <div className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">{msg}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nome *</label>
            <input className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Slug *</label>
            <input className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Descrição</label>
          <textarea className="w-full rounded-md border bg-background px-3 py-2 text-sm" rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Logo URL</label>
            <input className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Plano</label>
            <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={plan} onChange={(e) => setPlan(e.target.value as any)}>
              <option value="FREE">FREE</option>
              <option value="PRO">PRO</option>
              <option value="ENTERPRISE">ENTERPRISE</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="ativo" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} className="rounded border" />
          <label htmlFor="ativo" className="text-sm font-medium">Ativo</label>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">SEO Title</label>
          <input className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">SEO Description</label>
          <textarea className="w-full rounded-md border bg-background px-3 py-2 text-sm" rows={2} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
        </div>
        <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  );
}
