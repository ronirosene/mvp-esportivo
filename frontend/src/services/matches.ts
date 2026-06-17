import { api } from './api';

interface CityData {
  id: string;
  nome: string;
  siglaEstado: string;
}

export interface MatchData {
  id: string;
  groupId: string | null;
  eventSportId: string;
  homeCityId: string;
  awayCityId: string;
  matchDate: string | null;
  location: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  fase: string;
  round: number | null;
  displayOrder: number | null;
  createdAt: string;
  updatedAt: string;
  homeCity: CityData;
  awayCity: CityData;
}

export const matchesApi = {
  listByGroup: (groupId: string) =>
    api<MatchData[]>(`/groups/${groupId}/matches`),

  createManual: (groupId: string, data: {
    homeCityId: string;
    awayCityId: string;
    matchDate?: string;
    location?: string;
    round?: number;
    displayOrder?: number;
    fase?: string;
  }) => api<MatchData>(`/groups/${groupId}/matches`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  generate: (groupId: string) =>
    api<MatchData[]>(`/groups/${groupId}/matches/generate`, { method: 'POST' }),

  removeByGroup: (groupId: string) =>
    api<{ message: string }>(`/groups/${groupId}/matches`, { method: 'DELETE' }),

  update: (id: string, data: Partial<Pick<MatchData, 'homeScore' | 'awayScore' | 'matchDate' | 'location' | 'status'>>) =>
    api<MatchData>(`/matches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
