import { api } from './api';

export interface SponsorData {
  id: string;
  nome: string;
  logoUrl: string | null;
  website: string | null;
  descricao: string | null;
  ativo: boolean;
  destaque: boolean;
  ordem: number;
  tipo: 'PATROCINADOR' | 'APOIADOR' | 'PARCEIRO' | 'PUBLICIDADE';
  views: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSponsorPayload {
  nome: string;
  logoUrl?: string;
  website?: string;
  descricao?: string;
  ativo?: boolean;
  destaque?: boolean;
  ordem?: number;
  tipo?: 'PATROCINADOR' | 'APOIADOR' | 'PARCEIRO' | 'PUBLICIDADE';
}

export type UpdateSponsorPayload = Partial<CreateSponsorPayload>;

export const sponsorsApi = {
  list: () => api<SponsorData[]>('/sponsors'),
  get: (id: string) => api<SponsorData>(`/sponsors/${id}`),
  create: (data: CreateSponsorPayload) =>
    api<SponsorData>('/sponsors', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateSponsorPayload) =>
    api<SponsorData>(`/sponsors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) =>
    api<void>(`/sponsors/${id}`, { method: 'DELETE' }),
  listPublic: () => api<SponsorData[]>('/public/sponsors'),
  registerView: (id: string) =>
    api<void>(`/public/sponsors/${id}/view`, { method: 'POST' }),
  registerClick: (id: string) =>
    api<void>(`/public/sponsors/${id}/click`, { method: 'POST' }),
};
