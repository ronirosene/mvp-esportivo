import { api } from './api';

export interface CityUserData {
  id: string;
  nome: string;
  email: string;
  role: string;
  cityId: string | null;
  ativo: boolean;
  createdAt: string;
  city: { id: string; nome: string; siglaEstado: string } | null;
}

export interface AvailableEvent {
  id: string;
  nome: string;
  ano: number;
  eventSports: {
    id: string;
    displayName: string;
    sport: { id: string; nome: string };
    eventSportCities: { cityId: string }[];
  }[];
}

export interface Registration {
  id: string;
  eventSportId: string;
  status: string;
  createdAt: string;
  eventSport: {
    event: { id: string; nome: string; ano: number };
    sport: { id: string; nome: string };
    displayName: string;
  };
}

export interface InviteResult {
  token: string;
  expiresAt: string;
  email: string;
  cityName: string;
}

export const cityPortalApi = {
  createUser: (data: { nome: string; email: string; senha: string; cityId: string }) =>
    api<CityUserData>('/admin/city-users', { method: 'POST', body: JSON.stringify(data) }),
  listUsers: () => api<CityUserData[]>('/admin/city-users'),
  toggleActive: (id: string) =>
    api<{ id: string; ativo: boolean }>(`/admin/city-users/${id}/toggle-active`, { method: 'PUT' }),
  resetPassword: (id: string, senha: string) =>
    api<void>(`/admin/city-users/${id}/reset-password`, { method: 'PUT', body: JSON.stringify({ senha }) }),
  generateInvite: (userId: string) =>
    api<InviteResult>('/admin/invites', { method: 'POST', body: JSON.stringify({ userId }) }),
  getEvents: () => api<AvailableEvent[]>('/city/events'),
  register: (eventSportId: string) =>
    api<void>(`/city/event-sports/${eventSportId}/register`, { method: 'POST' }),
  cancel: (eventSportId: string) =>
    api<void>(`/city/event-sports/${eventSportId}/register`, { method: 'DELETE' }),
  myRegistrations: () => api<Registration[]>('/city/registrations'),
};
