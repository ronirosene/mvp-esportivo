'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { cityPortalApi, type AvailableEvent, type Registration } from '@/services/city-portal';

export default function PortalCidadePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<AvailableEvent[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'CIDADE') {
      router.push('/login');
      return;
    }
    async function load() {
      try {
        const [evts, regs] = await Promise.all([
          cityPortalApi.getEvents(),
          cityPortalApi.myRegistrations(),
        ]);
        setEvents(evts);
        setRegistrations(regs);
      } catch {} finally { setLoading(false); }
    }
    load();
  }, [user, authLoading, router]);

  if (authLoading || loading) return <p className="text-muted-foreground">Carregando...</p>;
  if (!user) return null;

  const regMap = new Map(registrations.map((r) => [r.eventSportId, r]));
  const registeredIds = new Set(registrations.map((r) => r.eventSportId));

  async function handleRegister(id: string) {
    try {
      await cityPortalApi.register(id);
      const regs = await cityPortalApi.myRegistrations();
      setRegistrations(regs);
      setMsg('Inscrição realizada com sucesso!');
    } catch (err: any) { setMsg(err.message || 'Erro ao inscrever'); }
  }

  async function handleCancel(id: string) {
    try {
      await cityPortalApi.cancel(id);
      const regs = await cityPortalApi.myRegistrations();
      setRegistrations(regs);
      setMsg('Inscrição cancelada.');
    } catch (err: any) { setMsg(err.message || 'Erro ao cancelar'); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portal da Cidade</h1>
          {user.city && <p className="text-sm text-muted-foreground">{user.city.nome} - {user.city.siglaEstado}</p>}
        </div>
      </div>

      {msg && (
        <div className="rounded-md bg-primary/10 px-4 py-2 text-sm text-primary">
          {msg}
          <button className="ml-2 font-medium" onClick={() => setMsg('')}>×</button>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold">Eventos Disponíveis</h2>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum evento disponível no momento.</p>
        ) : (
          <div className="space-y-4">
            {events.map((evt) => (
              <div key={evt.id} className="rounded-lg border p-4">
                <h3 className="font-medium">{evt.nome} ({evt.ano})</h3>
                <div className="mt-2 space-y-1.5">
                  {evt.eventSports.map((es) => {
                    const isRegistered = es.eventSportCities.length > 0;
                    return (
                      <div key={es.id} className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2 text-sm">
                        <span>{es.displayName || es.sport.nome}</span>
                        {isRegistered ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-green-600">Inscrito</span>
                            <button className="text-xs text-destructive hover:underline" onClick={() => handleCancel(es.id)}>
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button className="text-xs font-medium text-primary hover:underline" onClick={() => handleRegister(es.id)}>
                            Inscrever
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {registrations.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Minhas Inscrições</h2>
          <div className="space-y-1.5">
            {registrations.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{r.eventSport.displayName || r.eventSport.sport.nome}</p>
                  <p className="text-xs text-muted-foreground">{r.eventSport.event.nome} ({r.eventSport.event.ano})</p>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
