import api from './api';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: 'ARTIST' | 'COLLECTOR' | 'ADMIN' | null;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
}

export interface AdminUserDetail extends AdminUser {
  location: string | null;
  seller_profile: {
    id: string;
    bio: string | null;
    website_url: string | null;
    is_visible: boolean;
    is_verified: boolean;
  } | null;
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

export async function getAdminUserDetail(
  userId: string,
): Promise<AdminUserDetail> {
  const res = await api.get<AdminUserDetail>(`/identity/users/admin/${userId}`);
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
  monthlyUsers: { month: string; users: number }[];
  roleBreakdown: { name: string; value: number }[];
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const res = await api.get<AdminDashboardStats>('/identity/users/admin/dashboard');
  return res.data;
}

// ---- Artworks ----

export interface AdminArtwork {
  id: string;
  title: string;
  sellerId: string;
  sellerName: string | null;
  sellerEmail: string | null;
  sellerAvatarUrl: string | null;
  status: string;
  isPublished: boolean;
  price: string | null;
  currency: string | null;
  images: Array<{ url: string; isPrimary?: boolean }>;
  createdAt: string;
}

export interface PaginatedAdminArtworks {
  data: AdminArtwork[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetArtworksParams {
  page?: number;
  limit?: number;
  search?: string;
  sellerId?: string;
}

export async function getAdminArtworks(
  params: GetArtworksParams,
): Promise<PaginatedAdminArtworks> {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  if (params.search) query.append('search', params.search);
  if (params.sellerId) query.append('sellerId', params.sellerId);

  const res = await api.get<{ data: AdminArtwork[]; meta: { page: number; limit: number; total: number; totalPages: number } }>(
    `/artworks/admin/list?${query.toString()}`,
  );
  const { data, meta } = res.data;
  return {
    data,
    total: meta.total,
    page: meta.page,
    limit: meta.limit,
    totalPages: meta.totalPages,
  };
}

export async function adminDeleteArtwork(
  artworkId: string,
  reason?: string,
): Promise<{ success: boolean }> {
  const res = await api.delete<{ success: boolean }>(
    `/artworks/admin/${artworkId}`,
    { data: { reason } },
  );
  return res.data;
}

