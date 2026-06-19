'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { organizationsApi } from '@/services/organizations';

export default function NewOrganization() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [slug, setSlug] = useState('');
  const [descricao, setDescricao] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [plan, setPlan] = useState<'FREE' | 'PRO' | 'ENTERPRISE'>('FREE');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  function handleNomeChange(val: string) {
    setNome(val);
    if (!slug || slug === nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await organizationsApi.create({ nome, slug, descricao: descricao || undefined, logoUrl: logoUrl || undefined, plan, seoTitle: seoTitle || undefined, seoDescription: seoDescription || undefined });
      router.push('/organizations');
    } catch (err: any) { setMsg(err.message); } finally { setSaving(false); }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Nova Organização</h1>
      {msg && <div className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">{msg}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nome *</label>
            <input className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={nome} onChange={(e) => handleNomeChange(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Slug *</label>
            <input className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))} required />
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
        <div className="space-y-1">
          <label className="text-sm font-medium">SEO Title</label>
          <input className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">SEO Description</label>
          <textarea className="w-full rounded-md border bg-background px-3 py-2 text-sm" rows={2} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
        </div>
        <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {saving ? 'Salvando...' : 'Criar Organização'}
        </button>
      </form>
    </div>
  );
}
