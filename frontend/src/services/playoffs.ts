import { api } from './api';
import type { MatchData } from './matches';

export interface BracketData {
  quarters: MatchData[];
  semifinals: MatchData[];
  final: MatchData | null;
  thirdPlace: MatchData | null;
}

export interface EventSportConfig {
  classificationCount: number;
  generateThirdPlace: boolean;
}

export const playoffsApi = {
  bracket: (eventSportId: string) =>
    api<BracketData>(`/event-sports/${eventSportId}/playoffs/bracket`),

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
