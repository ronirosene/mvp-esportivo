'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { cityPortalApi, type CityUserData, type InviteResult } from '@/services/city-portal';
import { citiesApi, type CityData } from '@/services/cities';

export default function CityUsersPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [users, setUsers] = useState<CityUserData[]>([]);
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newNome, setNewNome] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSenha, setNewSenha] = useState('');
  const [newCityId, setNewCityId] = useState('');
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [u, c] = await Promise.all([
        cityPortalApi.listUsers(),
        citiesApi.list(),
      ]);
      setUsers(u);
      setCities(c);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    try {
      await cityPortalApi.createUser({ nome: newNome, email: newEmail, senha: newSenha, cityId: newCityId });
      setNewNome(''); setNewEmail(''); setNewSenha(''); setNewCityId('');
      setShowNew(false);
      fetch();
      setMsg('Usuário criado com sucesso!');
    } catch (err: any) { setMsg(err.message); }
  }

  async function handleToggle(id: string) {
    try {
      await cityPortalApi.toggleActive(id);
      fetch();
    } catch (err: any) { setMsg(err.message); }
  }

  async function handleReset(id: string) {
    const senha = prompt('Nova senha:');
    if (!senha || senha.length < 4) return;
    try {
      await cityPortalApi.resetPassword(id, senha);
      setMsg('Senha redefinida com sucesso!');
    } catch (err: any) { setMsg(err.message); }
  }

  async function handleInvite(userId: string) {
    try {
      const result = await cityPortalApi.generateInvite(userId);
      setInviteLink(`${window.location.origin}/convite/${result.token}`);
      setMsg(`Convite gerado para ${result.cityName}!`);
    } catch (err: any) { setMsg(err.message); }
  }

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Usuários das Cidades</h1>
        {token && <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90" onClick={() => setShowNew(!showNew)}>{showNew ? 'Cancelar' : 'Novo Usuário'}</button>}
      </div>

      {msg && <div className="rounded-md bg-primary/10 px-4 py-2 text-sm text-primary">{msg} <button className="ml-2 font-medium" onClick={() => setMsg('')}>×</button></div>}

      {inviteLink && (
        <div className="rounded-md border p-4 text-sm">
          <p className="font-medium">Link de Convite</p>
          <p className="mt-1 break-all text-muted-foreground">{inviteLink}</p>
          <button className="mt-2 text-xs text-primary hover:underline" onClick={() => { navigator.clipboard.writeText(inviteLink); setMsg('Link copiado!'); }}>
            Copiar link
          </button>
          <button className="ml-3 text-xs text-muted-foreground hover:underline" onClick={() => setInviteLink(null)}>Fechar</button>
        </div>
      )}

      {showNew && (
        <form onSubmit={handleCreate} className="rounded-lg border p-4 space-y-3">
          <h3 className="font-medium">Novo Usuário da Cidade</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Nome" value={newNome} onChange={(e) => setNewNome(e.target.value)} required />
            <input className="rounded-md border bg-background px-3 py-2 text-sm" type="email" placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
            <input className="rounded-md border bg-background px-3 py-2 text-sm" type="password" placeholder="Senha" value={newSenha} onChange={(e) => setNewSenha(e.target.value)} required />
            <select className="rounded-md border bg-background px-3 py-2 text-sm" value={newCityId} onChange={(e) => setNewCityId(e.target.value)} required>
              <option value="">Selecione a cidade</option>
              {cities.map((c) => <option key={c.id} value={c.id}>{c.nome} - {c.siglaEstado}</option>)}
            </select>
          </div>
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Criar</button>
        </form>
      )}

      {users.length === 0 ? (
        <p className="text-muted-foreground">Nenhum usuário de cidade cadastrado.</p>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Nome</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Cidade</th>
                <th className="px-4 py-3 text-center font-medium">Ativo</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{u.nome}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">{u.city?.nome} {u.city?.siglaEstado && `- ${u.city.siglaEstado}`}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${u.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.ativo ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => handleToggle(u.id)}>
                        {u.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                      <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => handleReset(u.id)}>
                        Redefinir Senha
                      </button>
                      <button className="text-xs text-primary hover:underline" onClick={() => handleInvite(u.id)}>
                        Convidar
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
