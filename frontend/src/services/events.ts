import { api } from './api';

export interface EventData {
  id: string;
  nome: string;
  ano: number;
  cidadeSede: string;
  dataInicio: string;
  dataFim: string;
  status: 'PLANEJAMENTO' | 'EM_ANDAMENTO' | 'FINALIZADO';
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventPayload {
  nome: string;
  ano: number;
  cidadeSede: string;
  dataInicio: string;
  dataFim: string;
  status: 'PLANEJAMENTO' | 'EM_ANDAMENTO' | 'FINALIZADO';
  logoUrl?: string;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

export const eventsApi = {
  list: (params?: { nome?: string; ano?: number }) => {
    const query = new URLSearchParams();
    if (params?.nome) query.set('nome', params.nome);
    if (params?.ano) query.set('ano', String(params.ano));
    const qs = query.toString();
    return api<EventData[]>(`/events${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => api<EventData>(`/events/${id}`),
  create: (data: CreateEventPayload) =>
    api<EventData>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateEventPayload) =>
    api<EventData>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    api<void>(`/events/${id}`, { method: 'DELETE' }),
};
