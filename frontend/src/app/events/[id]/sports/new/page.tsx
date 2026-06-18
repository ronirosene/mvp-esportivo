'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { eventSportsApi } from '@/services/event-sports';
import { sportsApi } from '@/services/sports';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SportOption {
  id: string;
  nome: string;
}

const GENDER_OPTIONS = [
  { value: 'OPEN', label: 'Aberto' },
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'FEMININO', label: 'Feminino' },
  { value: 'MISTO', label: 'Misto' },
];

const AGE_OPTIONS = [
  { value: 'LIVRE', label: 'Livre' },
  { value: 'SUB_14', label: 'Sub-14' },
  { value: 'SUB_16', label: 'Sub-16' },
  { value: 'SUB_18', label: 'Sub-18' },
  { value: 'SUB_20', label: 'Sub-20' },
  { value: 'VETERANO', label: 'Veterano' },
  { value: 'MASTER', label: 'Master' },
];

export default function AddSportPage() {
  const params = useParams();
  const router = useRouter();
  const [sports, setSports] = useState<SportOption[]>([]);
  const [selectedSportId, setSelectedSportId] = useState('');
  const [gender, setGender] = useState('OPEN');
  const [ageCategory, setAgeCategory] = useState('LIVRE');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try { setSports(await sportsApi.list()); } catch {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  async function handleAdd() {
    if (!selectedSportId) return;
    try {
      await eventSportsApi.add(params.id as string, selectedSportId, gender, ageCategory, displayName || undefined);
      router.push(`/events/${params.id}`);
    } catch (err: any) {
      setError(err?.message || 'Erro ao adicionar modalidade');
    }
  }

  if (loading) return <p className="text-muted-foreground">Carregando modalidades...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Adicionar Modalidade</h1>
        <Button variant="outline" onClick={() => router.push(`/events/${params.id}`)}>Voltar</Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Gênero</label>
          <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={gender} onChange={(e) => setGender(e.target.value)}>
            {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Faixa Etária</label>
          <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={ageCategory} onChange={(e) => setAgeCategory(e.target.value)}>
            {AGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Nome de Exibição</label>
          <input className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Ex: Futsal Masculino Sub-14" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
      </div>

      {sports.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma modalidade disponível.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sports.map((sport) => (
            <Card
              key={sport.id}
              className={`cursor-pointer transition-colors hover:bg-accent ${selectedSportId === sport.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => {
                setSelectedSportId(sport.id);
                if (!displayName) setDisplayName(sport.nome + ' ' + GENDER_OPTIONS.find(o => o.value === gender)?.label + ' ' + AGE_OPTIONS.find(o => o.value === ageCategory)?.label);
              }}
            >
              <CardHeader>
                <CardTitle className="text-base">{sport.nome}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Button disabled={!selectedSportId} onClick={handleAdd}>
        Vincular Modalidade
      </Button>
    </div>
  );
}
