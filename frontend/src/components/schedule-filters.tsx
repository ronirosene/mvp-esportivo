'use client';

import { useState } from 'react';

interface ScheduleFiltersProps {
  onFilter: (filters: Record<string, string>) => void;
  sports?: { id: string; nome: string }[];
  events?: { id: string; nome: string }[];
  cities?: { id: string; nome: string }[];
}

export default function ScheduleFilters({ onFilter, sports, events, cities }: ScheduleFiltersProps) {
  const [search, setSearch] = useState('');
  const [cityId, setCityId] = useState('');
  const [sportId, setSportId] = useState('');
  const [eventId, setEventId] = useState('');
  const [status, setStatus] = useState('');

  function apply() {
    const f: Record<string, string> = {};
    if (search) f.search = search;
    if (cityId) f.cityId = cityId;
    if (sportId) f.sportId = sportId;
    if (eventId) f.eventId = eventId;
    if (status) f.status = status;
    onFilter(f);
  }

  function clear() {
    setSearch('');
    setCityId('');
    setSportId('');
    setEventId('');
    setStatus('');
    onFilter({});
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <input
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        placeholder="Pesquisar cidade, modalidade, evento, local..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {cities && (
          <select className="rounded-md border bg-background px-3 py-2 text-sm" value={cityId} onChange={(e) => setCityId(e.target.value)}>
            <option value="">Todas as cidades</option>
            {cities.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        )}
        {sports && (
          <select className="rounded-md border bg-background px-3 py-2 text-sm" value={sportId} onChange={(e) => setSportId(e.target.value)}>
            <option value="">Todas as modalidades</option>
            {sports.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        )}
        {events && (
          <select className="rounded-md border bg-background px-3 py-2 text-sm" value={eventId} onChange={(e) => setEventId(e.target.value)}>
            <option value="">Todos os eventos</option>
            {events.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
        )}
        <select className="rounded-md border bg-background px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos os status</option>
          <option value="SCHEDULED">Agendado</option>
          <option value="IN_PROGRESS">Em Andamento</option>
          <option value="FINISHED">Finalizado</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90" onClick={apply}>
          Filtrar
        </button>
        <button className="rounded-md border px-4 py-2 text-sm text-muted-foreground hover:bg-muted" onClick={clear}>
          Limpar
        </button>
      </div>
    </div>
  );
}
