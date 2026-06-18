'use client';

import { useRouter } from 'next/navigation';

interface ScheduleMatch {
  id: string;
  homeCity: { id: string; nome: string; siglaEstado: string };
  awayCity: { id: string; nome: string; siglaEstado: string };
  homeScore: number | null;
  awayScore: number | null;
  matchDate: string | null;
  location: string | null;
  status: string;
  fase: string;
  eventSport: {
    sport: { nome: string };
    event: { nome: string };
    displayName?: string;
  };
}

interface ScheduleCardProps {
  match: ScheduleMatch;
}

function isWithinHour(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return diff > 0 && diff <= 60 * 60 * 1000;
}

export default function ScheduleCard({ match }: ScheduleCardProps) {
  const router = useRouter();
  const isLive = match.status === 'IN_PROGRESS';
  const isDone = match.status === 'FINISHED';
  const isSoon = match.matchDate ? isWithinHour(match.matchDate) : false;

  const time = match.matchDate
    ? new Date(match.matchDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4 transition-colors hover:bg-muted/30">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {time && <span className="font-semibold tabular-nums">{time}</span>}
        <span className="truncate">{match.eventSport.displayName || match.eventSport.sport.nome}</span>
        {isLive && (
          <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
            AO VIVO
          </span>
        )}
        {isDone && (
          <span className="ml-auto rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white">
            FINALIZADO
          </span>
        )}
        {isSoon && !isLive && (
          <span className="ml-auto rounded-full bg-yellow-500 px-2 py-0.5 text-[10px] font-bold text-white">
            EM BREVE
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 text-right">
          <p className={`text-sm font-medium ${isDone && match.homeScore != null && match.awayScore != null && match.homeScore > match.awayScore ? 'font-bold text-foreground' : ''}`}>
            <span className="cursor-pointer hover:underline" onClick={() => router.push(`/cidades/${match.homeCity.id}`)}>{match.homeCity.nome}</span>
          </p>
          <p className="text-[10px] text-muted-foreground">{match.homeCity.siglaEstado}</p>
        </div>

        <div className="flex-shrink-0 text-center">
          <span className="text-lg font-bold tabular-nums">
            {isDone || isLive
              ? `${match.homeScore ?? '-'} x ${match.awayScore ?? '-'}`
              : 'vs'}
          </span>
        </div>

        <div className="flex-1 text-left">
          <p className={`text-sm font-medium ${isDone && match.homeScore != null && match.awayScore != null && match.awayScore > match.homeScore ? 'font-bold text-foreground' : ''}`}>
            <span className="cursor-pointer hover:underline" onClick={() => router.push(`/cidades/${match.awayCity.id}`)}>{match.awayCity.nome}</span>
          </p>
          <p className="text-[10px] text-muted-foreground">{match.awayCity.siglaEstado}</p>
        </div>
      </div>

      {match.location && (
        <p className="text-xs text-muted-foreground">{match.location}</p>
      )}
    </div>
  );
}
