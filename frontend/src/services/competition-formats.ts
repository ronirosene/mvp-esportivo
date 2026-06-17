import { api } from './api';

export type FormatType = 'GROUP_STAGE' | 'ROUND_ROBIN' | 'KNOCKOUT' | 'MANUAL';

export interface CompetitionFormatData {
  id: string;
  eventSportId: string;
  formatType: FormatType;
  groupCount: number;
  qualifiedPerGroup: number;
  thirdPlaceMatch: boolean;
  manualBracket: boolean;
}

export const competitionFormatsApi = {
  get: (eventSportId: string) =>
    api<CompetitionFormatData>(`/event-sports/${eventSportId}/format`),

  upsert: (eventSportId: string, data: Partial<CompetitionFormatData>) =>
    api<CompetitionFormatData>(`/event-sports/${eventSportId}/format`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
