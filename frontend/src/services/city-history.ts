import { api } from './api';

export interface CityPublicData {
  id: string;
  nome: string;
  estado: string;
  siglaEstado: string;
  brasaoUrl: string | null;
  totalTitulos: number;
  totalParticipacoes: number;
}

export interface CityDetailData {
  id: string;
  nome: string;
  estado: string;
  siglaEstado: string;
  brasaoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  totalTitulos: number;
  totalVices: number;
  totalTerceiros: number;
  totalParticipacoes: number;
}

export interface CityHistoryEntry {
  id: string;
  eventId: string;
  eventSportId: string;
  cityId: string;
  position: 'CHAMPION' | 'RUNNER_UP' | 'THIRD_PLACE';
  event: { id: string; nome: string; ano: number };
  eventSport: { id: string; displayName: string };
}

export interface CityStatsData {
  totalTitulos: number;
  totalVices: number;
  totalTerceiros: number;
  totalParticipacoes: number;
  modalidadesMaisVencedoras: { modalidade: string; titulos: number }[];
}

export const cityHistoryApi = {
  list: (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return api<CityPublicData[]>(`/public/cities${qs}`);
  },
  get: (id: string) => api<CityDetailData>(`/public/cities/${id}`),
  history: (id: string) => api<Record<string, CityHistoryEntry[]>>(`/public/cities/${id}/history`),
  stats: (id: string) => api<CityStatsData>(`/public/cities/${id}/stats`),
};
