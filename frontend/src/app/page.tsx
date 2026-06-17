'use client';

import { useEffect, useState, useCallback } from 'react';

export default function Home() {
  const [backendStatus, setBackendStatus] = useState('Verificando...');
  const [me, setMe] = useState<string | null>(null);

  const check = useCallback(async () => {
    try {
      const [healthRes, token] = await Promise.all([
        fetch('/api/health'),
        Promise.resolve(localStorage.getItem('@mvp:token')),
      ]);
      const health = await healthRes.json();
      setBackendStatus(health.status === 'ok' ? 'Conectado' : 'Erro');

      if (token) {
        const meRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          setMe(meData.nome);
        }
      }
    } catch {
      setBackendStatus('Offline');
    }
  }, []);

  useEffect(() => { check(); }, [check]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        {me && <p className="mt-1 text-muted-foreground">Bem-vindo, {me}.</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
          <p className="mt-2 text-2xl font-bold">Operacional</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Backend</h3>
          <p className="mt-2 text-2xl font-bold" id="backend-status">
            {backendStatus}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Versão</h3>
          <p className="mt-2 text-2xl font-bold">0.1.0</p>
        </div>
      </div>
    </div>
  );
}
