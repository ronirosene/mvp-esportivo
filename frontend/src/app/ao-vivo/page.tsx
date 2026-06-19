'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLiveMatches, LiveMatch } from '@/services/live';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'https://mvp-backend-little-woodland-6494.fly.dev';

export default function AoVivoPage() {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    getLiveMatches().then((data) => {
      setMatches(data);
      setLoading(false);
    });

    const socket = io(`${SOCKET_URL}/live`, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
    });

    socket.on('connect', () => {
      socket.emit('joinSport', 'all');
    });

    socket.on('scoreUpdated', (data: any) => {
      setMatches((prev) =>
        prev.map((m) =>
          m.id === data.id
            ? { ...m, homeScore: data.homeScore, awayScore: data.awayScore, status: data.status, updatedAt: data.updatedAt }
            : m,
        ),
      );
    });

    socket.on('matchStarted', (data: any) => {
      setMatches((prev) => {
        if (prev.find((m) => m.id === data.id)) {
          return prev.map((m) => (m.id === data.id ? data : m));
        }
        return [data, ...prev];
      });
    });

    socket.on('matchFinished', (id: string) => {
      setMatches((prev) => prev.filter((m) => m.id !== id));
    });

    socket.on('matchCancelled', (id: string) => {
      setMatches((prev) => prev.filter((m) => m.id !== id));
    });

    const timer = setInterval(() => setNow(new Date()), 1000);

    return () => {
      socket.disconnect();
      clearInterval(timer);
    };
  }, []);

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">🔴 Ao Vivo</h1>
        <p className="text-sm text-muted-foreground">
          Partidas em andamento &mdash; {matches.length} ao vivo
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
          Nenhuma partida ao vivo no momento.
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="rounded-lg border bg-card p-4 shadow-sm transition-colors hover:border-primary/50"
            >
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{match.event}</span>
                <span>{match.sport}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1 text-right font-medium">{match.homeCity}</div>
                <div className="mx-6 flex items-center gap-4">
                  <span className="text-3xl font-bold tabular-nums">
                    {match.homeScore ?? '-'}
                  </span>
                  <span className="text-xl text-muted-foreground">×</span>
                  <span className="text-3xl font-bold tabular-nums">
                    {match.awayScore ?? '-'}
                  </span>
                </div>
                <div className="flex-1 font-medium">{match.awayCity}</div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-semibold text-red-500">AO VIVO</span>
                </div>
                <span>Última atualização: {formatTime(match.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
