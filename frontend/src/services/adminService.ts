import api from './api';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: 'ARTIST' | 'COLLECTOR' | 'ADMIN' | null;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface PaginatedAdminUsers {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string; // 'true' | 'false' | ''
}

export async function getAdminUsers(params: GetUsersParams): Promise<PaginatedAdminUsers> {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  if (params.search) query.append('search', params.search);
  if (params.isActive !== undefined && params.isActive !== '') {
    query.append('isActive', params.isActive);
  }

  const res = await api.get<PaginatedAdminUsers>(`/identity/users/admin/list?${query.toString()}`);
  return res.data;
}

export async function getAdminUserDetail(userId: string): Promise<any> {
  const res = await api.get(`/identity/users/admin/${userId}`);
  return res.data;
}

export async function updateUserStatus(userId: string, isActive: boolean): Promise<unknown> {
  const res = await api.patch(`/identity/users/admin/${userId}/status`, { is_active: isActive });
  return res.data;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalArtists: number;
  totalCollectors: number;
  totalPendingVerifications: number;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const res = await api.get<AdminDashboardStats>('/identity/users/admin/dashboard');
  return res.data;
}
