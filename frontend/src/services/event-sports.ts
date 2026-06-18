import { api } from './api';

export interface SportData {
  id: string;
  nome: string;
  categoria: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventSportData {
  id: string;
  eventId: string;
  sportId: string;
  gender: 'MASCULINO' | 'FEMININO' | 'MISTO' | 'OPEN';
  ageCategory: 'LIVRE' | 'SUB_14' | 'SUB_16' | 'SUB_18' | 'SUB_20' | 'VETERANO' | 'MASTER';
  displayName: string;
  classificationCount: number;
  generateThirdPlace: boolean;
  drawMode: 'AUTOMATIC' | 'MANUAL';
  createdAt: string;
  sport: SportData;
}

export const eventSportsApi = {
  list: (eventId: string) =>
    api<EventSportData[]>(`/events/${eventId}/sports`),

  add: (eventId: string, sportId: string, gender?: string, ageCategory?: string, displayName?: string) =>
    api<EventSportData>(`/events/${eventId}/sports`, {
      method: 'POST',
      body: JSON.stringify({ sportId, gender, ageCategory, displayName }),
    }),

  remove: (eventId: string, sportId: string) =>
    api<void>(`/events/${eventId}/sports/${sportId}`, { method: 'DELETE' }),

  update: (eventId: string, id: string, data: any) =>
    api<EventSportData>(`/events/${eventId}/sports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
