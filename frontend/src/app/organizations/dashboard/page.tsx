'use client';

import { useEffect, useState } from 'react';
import { organizationsApi, type DashboardData } from '@/services/organizations';
import { useAuth } from '@/contexts/auth-context';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    organizationsApi.getDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isGlobal = user?.role === 'ADMIN_GLOBAL';

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;
  if (!data) return <p className="text-muted-foreground">Erro ao carregar dashboard.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard {isGlobal ? 'Global' : 'da Organização'}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isGlobal && (
          <div className="rounded-lg border p-4 text-center">
            <p className="text-3xl font-bold">{data.organizations}</p>
            <p className="text-sm text-muted-foreground">Organizações</p>
          </div>
        )}
        <div className="rounded-lg border p-4 text-center">
          <p className="text-3xl font-bold">{data.events}</p>
          <p className="text-sm text-muted-foreground">Eventos</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-3xl font-bold">{data.cities}</p>
          <p className="text-sm text-muted-foreground">Cidades</p>
        </div>
        {!isGlobal && data.sponsors !== undefined && (
          <div className="rounded-lg border p-4 text-center">
            <p className="text-3xl font-bold">{data.sponsors}</p>
            <p className="text-sm text-muted-foreground">Patrocinadores</p>
          </div>
        )}
        {!isGlobal && data.matches !== undefined && (
          <div className="rounded-lg border p-4 text-center">
            <p className="text-3xl font-bold">{data.matches}</p>
            <p className="text-sm text-muted-foreground">Partidas</p>
          </div>
        )}
      </div>
    </div>
  );
}
