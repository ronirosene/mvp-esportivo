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

export interface GroupParticipantData {
  id: string;
  groupId: string;
  eventSportCityId: string;
  eventSportCity: EventSportCityData;
}

export const groupParticipantsApi = {
  add: (groupId: string, eventSportCityId: string) =>
    api<GroupParticipantData>(`/groups/${groupId}/participants`, {
      method: 'POST',
      body: JSON.stringify({ eventSportCityId }),
    }),

  remove: (groupId: string, participantId: string) =>
    api<void>(`/groups/${groupId}/participants/${participantId}`, { method: 'DELETE' }),
};
