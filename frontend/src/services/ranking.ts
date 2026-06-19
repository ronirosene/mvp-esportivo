import { api } from './api';

export interface RankingEntry {
  cityId: string;
  cityName: string;
  state: string;
  siglaEstado: string;
  titles: number;
  runnerUps: number;
  thirdPlaces: number;
  participations: number;
  score: number;
  position: number;
}

export const rankingApi = {
  get: (params?: { eventId?: string; sportId?: string; year?: string; orgSlug?: string }) => {
    const qs = new URLSearchParams();
    if (params?.eventId) qs.set('eventId', params.eventId);
    if (params?.sportId) qs.set('sportId', params.sportId);
    if (params?.year) qs.set('year', params.year);
    if (params?.orgSlug) qs.set('orgSlug', params.orgSlug);
    const q = qs.toString();
    return api<RankingEntry[]>(`/public/ranking${q ? `?${q}` : ''}`);
  },
};
