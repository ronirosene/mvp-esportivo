'use client';

import { useEffect, useState } from 'react';
import { championsApi, type ChampionData } from '@/services/champions';
import { api } from '@/services/api';

const POSITION_EMOJI: Record<string, string> = {
  CHAMPION: '\u{1F947}',
  RUNNER_UP: '\u{1F948}',
  THIRD_PLACE: '\u{1F949}',
};

const POSITION_LABEL: Record<string, string> = {
  CHAMPION: 'Campeão',
  RUNNER_UP: 'Vice-campeão',
  THIRD_PLACE: '3º Lugar',
};

interface FilterOption {
  id: string;
  nome: string;
}

export default function HistoricoContent() {
  const [champions, setChampions] = useState<ChampionData[]>([]);
  const [filtered, setFiltered] = useState<ChampionData[]>([]);
  const [loading, setLoading] = useState(true);

  const [events, setEvents] = useState<FilterOption[]>([]);
  const [sports, setSports] = useState<FilterOption[]>([]);
  const [cities, setCities] = useState<FilterOption[]>([]);

  const [eventFilter, setEventFilter] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [champs, e, s, c] = await Promise.all([
          championsApi.list(),
          api<FilterOption[]>('/events'),
          api<FilterOption[]>('/sports'),
          api<FilterOption[]>('/cities'),
        ]);
        setChampions(champs);
        setFiltered(champs);
        setEvents(e);
        setSports(s);
        setCities(c);
      } catch {} finally { setLoading(false); }
    }
    load();
  }, []);

  useEffect(() => {
    let result = [...champions];
    if (eventFilter) result = result.filter((ch) => ch.event.id === eventFilter);
    if (sportFilter) result = result.filter((ch) => ch.eventSport.id === sportFilter);
    if (cityFilter) result = result.filter((ch) => ch.city.id === cityFilter);
    if (yearFilter) result = result.filter((ch) => ch.event.ano === parseInt(yearFilter));
    setFiltered(result);
  }, [eventFilter, sportFilter, cityFilter, yearFilter, champions]);

  const years = Array.from(new Set(champions.map((ch) => ch.event.ano))).sort((a, b) => b - a);
  const groupedByYear: Record<number, ChampionData[]> = {};
  for (const ch of filtered) {
    if (!groupedByYear[ch.event.ano]) groupedByYear[ch.event.ano] = [];
    if (!groupedByYear[ch.event.ano].find((x) => x.eventSportId === ch.eventSportId && x.position === ch.position)) {
      groupedByYear[ch.event.ano].push(ch);
    }
  }

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Histórico de Campeões</h1>
        <p className="text-sm text-muted-foreground">
          Consulte campeões, vice-campeões e terceiros colocados de todas as edições.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select className="rounded-md border px-3 py-2 text-sm" value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
          <option value="">Todos os Eventos</option>
          {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.nome}</option>)}
        </select>
        <select className="rounded-md border px-3 py-2 text-sm" value={sportFilter} onChange={(e) => setSportFilter(e.target.value)}>
          <option value="">Todas as Modalidades</option>
          {sports.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
        <select className="rounded-md border px-3 py-2 text-sm" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
          <option value="">Todas as Cidades</option>
          {cities.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <select className="rounded-md border px-3 py-2 text-sm" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
          <option value="">Todos os Anos</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {Object.keys(groupedByYear).length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>
      ) : (
        Object.entries(groupedByYear).sort(([a], [b]) => Number(b) - Number(a)).map(([year, entries]) => (
          <div key={year}>
            <h2 className="mb-3 text-lg font-semibold">{year}</h2>
            <div className="space-y-2">
              {entries.map((ch) => (
                <div key={ch.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <span className="text-xl">{POSITION_EMOJI[ch.position]}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{ch.eventSport.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {POSITION_LABEL[ch.position]}: {ch.city.nome} - {ch.city.siglaEstado}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
