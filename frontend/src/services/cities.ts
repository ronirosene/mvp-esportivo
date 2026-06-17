import { api } from './api';

export interface CityData {
  id: string;
  nome: string;
  estado: string;
  siglaEstado: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCityPayload {
  nome: string;
  estado: string;
  siglaEstado: string;
}

export type UpdateCityPayload = Partial<CreateCityPayload>;

export const citiesApi = {
  list: () => api<CityData[]>('/cities'),
  get: (id: string) => api<CityData>(`/cities/${id}`),
  create: (data: CreateCityPayload) =>
    api<CityData>('/cities', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateCityPayload) =>
    api<CityData>(`/cities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) =>
    api<void>(`/cities/${id}`, { method: 'DELETE' }),
};
