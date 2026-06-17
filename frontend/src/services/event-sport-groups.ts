import { api } from './api';

interface CityData {
  id: string;
  nome: string;
  siglaEstado: string;
}

interface EventSportCityData {
  id: string;
  city: CityData;
}

interface GroupParticipantData {
  id: string;
  eventSportCityId: string;
  eventSportCity: EventSportCityData;
}

export interface GroupData {
  id: string;
  nome: string;
  groupParticipants: GroupParticipantData[];
}

export const eventSportGroupsApi = {
  list: (eventSportId: string) =>
    api<GroupData[]>(`/event-sports/${eventSportId}/groups`),

  generate: (eventSportId: string, groupCount: number) =>
    api<GroupData[]>(`/event-sports/${eventSportId}/groups/generate`, {
      method: 'POST',
      body: JSON.stringify({ groupCount }),
    }),

  create: (eventSportId: string, nome: string) =>
    api<GroupData>(`/event-sports/${eventSportId}/groups`, {
      method: 'POST',
      body: JSON.stringify({ nome }),
    }),

  remove: (eventSportId: string) =>
    api<{ message: string }>(`/event-sports/${eventSportId}/groups`, { method: 'DELETE' }),
};
