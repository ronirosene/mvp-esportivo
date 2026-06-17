import { api } from './api';

interface CityData {
  id: string;
  nome: string;
  siglaEstado: string;
}

export interface StandingData {
  id: string;
  groupId: string;
  cityId: string;
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  city: CityData;
}

export const standingsApi = {
  get: (groupId: string) =>
    api<StandingData[]>(`/groups/${groupId}/standings`),
};
