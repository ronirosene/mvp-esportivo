import { api } from './api';

export interface CityData {
  id: string;
  nome: string;
  estado: string;
  siglaEstado: string;
}

export interface EventSportCityData {
  id: string;
  eventSportId: string;
  cityId: string;
  status: string;
  createdAt: string;
  city: CityData;
}

export const eventSportCitiesApi = {
  list: (eventSportId: string) =>
    api<EventSportCityData[]>(`/event-sports/${eventSportId}/cities`),

  add: (eventSportId: string, cityId: string) =>
    api<EventSportCityData>(`/event-sports/${eventSportId}/cities`, {
      method: 'POST',
      body: JSON.stringify({ cityId }),
    }),

  addBulk: (eventSportId: string, cityIds: string[]) =>
    api<EventSportCityData[]>(`/event-sports/${eventSportId}/cities/bulk`, {
      method: 'POST',
      body: JSON.stringify({ cityIds }),
    }),

  remove: (eventSportId: string, cityId: string) =>
    api<void>(`/event-sports/${eventSportId}/cities/${cityId}`, { method: 'DELETE' }),
};
