'use client';

import { useState } from 'react';
import type { MatchData } from '@/services/matches';

interface BracketViewProps {
  quarters: MatchData[];
  semifinals: MatchData[];
  final: MatchData | null;
  thirdPlace: MatchData | null;
}

const FASE_LABEL: Record<string, string> = {
  QUARTAS: 'Quartas de Final',
  SEMIFINAL: 'Semifinal',
  FINAL: 'Final',
  TERCEIRO_LUGAR: 'Terceiro Lugar',
};

const STATUS_LABEL: Record<string, string> = {
  FINISHED: 'Finalizado',
  IN_PROGRESS: 'Em Andamento',
  SCHEDULED: 'Agendado',
  AWAITING_PREVIOUS_MATCH: 'Aguardando',
};

const CARD_W = 200;
const CARD_H = 72;
const GAP = 28;
const COL_GAP = 64;

function getWinner(m: MatchData): 'home' | 'away' | null {
  if (m.status !== 'FINISHED' || m.homeScore === null || m.awayScore === null) return null;
  if (m.homeScore > m.awayScore) return 'home';
  if (m.awayScore > m.homeScore) return 'away';
  return null;
}

function MatchCard({ m, label }: { m: MatchData; label: string }) {
  const w = getWinner(m);
  const isDone = m.status === 'FINISHED';
  const isLive = m.status === 'IN_PROGRESS';
  const isAwait = m.status === 'AWAITING_PREVIOUS_MATCH';
  const isThird = m.fase === 'TERCEIRO_LUGAR';

  const borderCls = isAwait
    ? 'border-dashed border-muted-foreground/40 bg-muted/20'
    : isLive
      ? 'border-yellow-400 bg-yellow-50/80 dark:bg-yellow-950/20 shadow-[0_0_8px_rgba(234,179,8,0.3)]'
      : isDone
        ? 'border-green-500 bg-green-50/80 dark:bg-green-950/20'
        : 'border-border bg-card';

  const homeCls = w === 'home' ? 'font-bold text-foreground' : isDone && w ? 'text-muted-foreground line-through' : '';
  const awayCls = w === 'away' ? 'font-bold text-foreground' : isDone && w ? 'text-muted-foreground line-through' : '';

  return (
    <div
      className={`relative flex cursor-pointer flex-col justify-center rounded-lg border-2 px-3 py-2 text-sm transition-all hover:shadow-md ${borderCls}`}
      style={{ width: CARD_W, height: CARD_H }}
    >
      <div className="flex items-center justify-between">
        <span className={`truncate text-sm ${homeCls}`}>{m.homeCity.nome}</span>
        <span className="ml-2 min-w-[1.5rem] text-right font-semibold tabular-nums">
          {isAwait ? '-' : m.homeScore ?? '-'}
        </span>
      </div>
      <div className="mt-0.5 flex items-center justify-between border-t border-border/30 pt-0.5">
        <span className={`truncate text-sm ${awayCls}`}>{m.awayCity.nome}</span>
        <span className="ml-2 min-w-[1.5rem] text-right font-semibold tabular-nums">
          {isAwait ? '-' : m.awayScore ?? '-'}
        </span>
      </div>
      {isAwait && (
        <span className="absolute -bottom-2.5 left-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          Aguardando
        </span>
      )}
      {isThird && (
        <span className="absolute -top-2.5 right-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          3º Lugar
        </span>
      )}
    </div>
  );
}

function Connectors({
  count, pairSize, colH, left, width,
}: {
  count: number; pairSize: number; colH: number; left: number; width: number;
}) {
  if (count === 0) return null;
  const pairs = Math.floor(count / pairSize);
  const lines: { y1: number; y2: number }[] = [];
  for (let p = 0; p < pairs; p++) {
    const y1 = (p * pairSize * 2 + 0.5) * (CARD_H + GAP) + CARD_H / 2 - GAP / 2;
    const y2 = (p * pairSize * 2 + pairSize - 0.5) * (CARD_H + GAP) + CARD_H / 2 - GAP / 2;
    lines.push({ y1, y2 });
  }
  if (lines.length === 0) return null;
  return (
    <svg className="absolute pointer-events-none" style={{ left, top: 0, height: colH, width }}>
      {lines.map((l, i) => {
        const midX = width * 0.6;
        const midY = (l.y1 + l.y2) / 2;
        return (
          <g key={i}>
            <line x1="0" y1={l.y1} x2={midX} y2={l.y1} stroke="hsl(var(--border))" strokeWidth="1.5" />
            <line x1="0" y1={l.y2} x2={midX} y2={l.y2} stroke="hsl(var(--border))" strokeWidth="1.5" />
            <line x1={midX} y1={l.y1} x2={midX} y2={l.y2} stroke="hsl(var(--border))" strokeWidth="1.5" />
            <line x1={midX} y1={midY} x2={width} y2={midY} stroke="hsl(var(--border))" strokeWidth="1.5" />
          </g>
        );
      })}
    </svg>
  );
}

export default function BracketView({ quarters, semifinals, final, thirdPlace }: BracketViewProps) {
  const [modal, setModal] = useState<{ m: MatchData; label: string } | null>(null);

  const hasQ = quarters.length > 0;
  const hasS = semifinals.length > 0;
  const hasF = final !== null;
  const has3 = thirdPlace !== null;

  const cols: { label: string; fase: string; items: MatchData[] }[] = [];
  if (hasQ) cols.push({ label: 'Quartas', fase: 'QUARTAS', items: quarters });
  if (hasS) cols.push({ label: 'Semifinal', fase: 'SEMIFINAL', items: semifinals });
  if (has3) cols.push({ label: '3º Lugar', fase: 'TERCEIRO_LUGAR', items: [thirdPlace!] });
  if (hasF) cols.push({ label: 'Final', fase: 'FINAL', items: [final!] });

  if (cols.length === 0) return null;

  const tallCount = hasQ ? quarters.length : hasS ? semifinals.length * 2 : 2;
  const colH = tallCount * (CARD_H + GAP) - GAP;

  return (
    <div className="relative overflow-x-auto pb-4">
      <div className="flex" style={{ gap: COL_GAP, minWidth: 'max-content' }}>
        {cols.map((col, ci) => {
          return (
            <div key={ci} className="relative flex flex-col" style={{ width: CARD_W, height: colH }}>
              <div className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {col.label}
              </div>
              {col.items.map((m, idx) => {
                let top: number;
                if (col.fase === 'FINAL') {
                  top = (colH - CARD_H) / 2;
                } else if (col.fase === 'TERCEIRO_LUGAR') {
                  top = (colH - CARD_H) / 2;
                } else if (col.fase === 'SEMIFINAL' && hasQ) {
                  top = idx * 2 * (CARD_H + GAP) + (CARD_H + GAP) / 2 - CARD_H / 2;
                } else {
                  top = idx * (CARD_H + GAP);
                }
                return (
                  <div
                    key={m.id}
                    className="absolute left-0 w-full cursor-pointer"
                    style={{ top }}
                    onClick={() => setModal({ m, label: FASE_LABEL[col.fase] })}
                  >
                    <MatchCard m={m} label={FASE_LABEL[col.fase]} />
                  </div>
                );
              })}

              {ci < cols.length - 1 && cols[ci + 1].fase !== 'TERCEIRO_LUGAR' && (
                <Connectors
                  count={col.items.length}
                  pairSize={2}
                  colH={colH}
                  left={CARD_W + 4}
                  width={COL_GAP - 8}
                />
              )}
            </div>
          );
        })}
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl border bg-background p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{modal.label}</p>
              <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setModal(null)}>
                ✕
              </button>
            </div>

            <div className="mb-3 flex items-center justify-between gap-3">
              <span className={`text-sm font-medium ${getWinner(modal.m) === 'home' ? 'text-foreground font-bold' : ''}`}>
                {modal.m.homeCity.nome}
              </span>
              <span className="text-lg font-bold tabular-nums">
                {modal.m.homeScore ?? '-'} x {modal.m.awayScore ?? '-'}
              </span>
              <span className={`text-sm font-medium ${getWinner(modal.m) === 'away' ? 'text-foreground font-bold' : ''}`}>
                {modal.m.awayCity.nome}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground">
              {modal.m.matchDate && (
                <p>
                  <span className="font-medium text-foreground">Data:</span>{' '}
                  {new Date(modal.m.matchDate).toLocaleDateString('pt-BR', {
                    day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              )}
              {modal.m.location && (
                <p><span className="font-medium text-foreground">Local:</span> {modal.m.location}</p>
              )}
              <p>
                <span className="font-medium text-foreground">Status:</span>{' '}
                {STATUS_LABEL[modal.m.status] || modal.m.status}
              </p>
            </div>

            <button
              className="mt-4 w-full rounded-md bg-muted px-3 py-2 text-sm hover:bg-muted/80"
              onClick={() => setModal(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
