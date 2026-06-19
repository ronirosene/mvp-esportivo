'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { organizationsApi, type OrganizationData } from '@/services/organizations';

export default function OrganizationsList() {
  const router = useRouter();
  const { token } = useAuth();
  const [orgs, setOrgs] = useState<OrganizationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    organizationsApi.list()
      .then(setOrgs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(id: string, nome: string) {
    if (!confirm(`Excluir organização "${nome}"?`)) return;
    try {
      await organizationsApi.remove(id);
      setOrgs((prev) => prev.filter((o) => o.id !== id));
    } catch {}
  }

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Organizações</h1>
        <button
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          onClick={() => router.push('/organizations/new')}
        >
          Nova Organização
        </button>
      </div>

      {orgs.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma organização cadastrada.</p>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Plano</th>
                <th className="px-4 py-3 text-center font-medium">Ativo</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{org.nome}</td>
                  <td className="px-4 py-3 text-muted-foreground">{org.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      org.plan === 'ENTERPRISE' ? 'bg-purple-100 text-purple-700' :
                      org.plan === 'PRO' ? 'bg-blue-100 text-blue-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {org.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${org.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {org.ativo ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => router.push(`/organizations/${org.id}/edit`)}
                      >
                        Editar
                      </button>
                      <button
                        className="text-xs text-destructive hover:text-destructive/80"
                        onClick={() => handleRemove(org.id, org.nome)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
