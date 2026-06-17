import { api } from './api';

export interface SportData {
  id: string;
  nome: string;
  categoria: string;
  createdAt: string;
}

export interface EventSportData {
  id: string;
  eventId: string;
  sportId: string;
  classificationCount: number;
  generateThirdPlace: boolean;
  drawMode: 'AUTOMATIC' | 'MANUAL';
  createdAt: string;
  sport: SportData;
}

export const eventSportsApi = {
  list: (eventId: string) =>
    api<EventSportData[]>(`/events/${eventId}/sports`),

  add: (eventId: string, sportId: string) =>
    api<EventSportData>(`/events/${eventId}/sports`, {
      method: 'POST',
      body: JSON.stringify({ sportId }),
    }),

  remove: (eventId: string, sportId: string) =>
    api<void>(`/events/${eventId}/sports/${sportId}`, { method: 'DELETE' }),

  update: (eventId: string, id: string, data: Partial<Pick<EventSportData, 'classificationCount' | 'generateThirdPlace' | 'drawMode'>>) =>
    api<EventSportData>(`/events/${eventId}/sports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
