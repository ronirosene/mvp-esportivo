import { api } from './api';

export interface OrganizationData {
  id: string;
  nome: string;
  slug: string;
  logoUrl: string | null;
  descricao: string | null;
  ativo: boolean;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  seoTitle: string | null;
  seoDescription: string | null;
  seoFavicon: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  organizations?: number;
  events: number;
  cities: number;
  sponsors?: number;
  matches?: number;
}

export interface CreateOrganizationPayload {
  nome: string;
  slug: string;
  logoUrl?: string;
  descricao?: string;
  ativo?: boolean;
  plan?: 'FREE' | 'PRO' | 'ENTERPRISE';
  seoTitle?: string;
  seoDescription?: string;
  seoFavicon?: string;
}

export type UpdateOrganizationPayload = Partial<CreateOrganizationPayload>;

export const organizationsApi = {
  list: () => api<OrganizationData[]>('/organizations'),
  get: (id: string) => api<OrganizationData>(`/organizations/${id}`),
  getBySlug: (slug: string) => api<OrganizationData>(`/organizations/slug/${slug}`),
  create: (data: CreateOrganizationPayload) =>
    api<OrganizationData>('/organizations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateOrganizationPayload) =>
    api<OrganizationData>(`/organizations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) =>
    api<void>(`/organizations/${id}`, { method: 'DELETE' }),
  getDashboard: () => api<DashboardData>('/organizations/dashboard'),
};
