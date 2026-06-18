import { api } from './api';

export interface ChampionData {
  id: string;
  eventId: string;
  eventSportId: string;
  cityId: string;
  position: 'CHAMPION' | 'RUNNER_UP' | 'THIRD_PLACE';
  createdAt: string;
  event: { id: string; nome: string; ano: number };
  eventSport: { id: string; displayName: string };
  city: { id: string; nome: string; siglaEstado: string };
}

export interface CityStats {
  totalTitulos: number;
  totalVices: number;
  totalTerceiros: number;
}

export const championsApi = {
  list: () => api<ChampionData[]>('/public/champions'),

  byEvent: (eventId: string) =>
    api<ChampionData[]>(`/public/champions/event/${eventId}`),

  byEventSport: (eventSportId: string) =>
    api<ChampionData[]>(`/public/champions/sport/${eventSportId}`),

  byCity: (cityId: string) =>
    api<ChampionData[]>(`/public/champions/city/${cityId}`),

  cityStats: (cityId: string) =>
    api<CityStats>(`/public/champions/city/${cityId}/stats`),
};
