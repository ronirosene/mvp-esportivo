import { api } from './api';
import type { MatchData } from './matches';

export interface EventSportConfig {
  classificationCount: number;
  generateThirdPlace: boolean;
}

export const playoffsApi = {
  list: (eventSportId: string) =>
    api<MatchData[]>(`/event-sports/${eventSportId}/playoffs`),

  generate: (eventSportId: string) =>
    api<MatchData[]>(`/event-sports/${eventSportId}/playoffs/generate`, { method: 'POST' }),

  advance: (eventSportId: string) =>
    api<MatchData[]>(`/event-sports/${eventSportId}/playoffs/advance`, { method: 'POST' }),

  updateConfig: (eventId: string, eventSportId: string, config: EventSportConfig) =>
    api<void>(`/events/${eventId}/sports/${eventSportId}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    }),
};
