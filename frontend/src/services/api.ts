const API_BASE = '/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('@mvp:token');
}

export async function api<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      body.message?.join?.(', ') || body.message || 'Erro desconhecido';
    throw new Error(message);
  }

  return res.json();
}

export const authApi = {
  login: (email: string, senha: string) =>
    api<{ accessToken: string; user: { id: string; nome: string; email: string; role: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, senha }) },
    ),
  me: () =>
    api<{ id: string; nome: string; email: string; role: string }>('/auth/me'),
};
