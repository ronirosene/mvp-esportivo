import { api } from './api';
import type { SportData } from './event-sports';

export const sportsApi = {
  list: () => api<SportData[]>('/sports'),
  get: (id: string) => api<SportData>(`/sports/${id}`),
  create: (nome: string) =>
    api<SportData>('/sports', { method: 'POST', body: JSON.stringify({ nome }) }),
  update: (id: string, data: { nome?: string; ativo?: boolean }) =>
    api<SportData>(`/sports/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) =>
    api<SportData>(`/sports/${id}`, { method: 'DELETE' }),
};
