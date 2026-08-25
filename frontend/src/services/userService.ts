import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SellerProfile {
  id: string;
  bio: string | null;
  website_url: string | null;
  is_visible: boolean;
  is_verified: boolean;
  verification_status: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface PublicSellerProfile {
  bio: string | null;
  website_url: string | null;
  is_verified: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'ARTIST' | 'COLLECTOR' | 'ADMIN' | null;
  avatar_url: string | null;
  location: string | null;
  has_password: boolean;
  seller_profile: SellerProfile | null;
}

export interface PublicUserProfile {
  id: string;
  full_name: string | null;
  role: 'ARTIST' | 'COLLECTOR' | 'ADMIN' | null;
  avatar_url: string | null;
  location: string | null;
  seller_profile: PublicSellerProfile | null;
}

export interface UpdateProfilePayload {
  full_name?: string;
  bio?: string;
  location?: string;
}

export interface UpdateSellerProfilePayload {
  bio?: string;
  websiteUrl?: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * GET /identity/users/:userId
 * Public artist/collector profile (no email)
 */
export async function getPublicUserProfile(userId: string): Promise<PublicUserProfile> {
  const res = await api.get<PublicUserProfile>(`/identity/users/${userId}`);
  return res.data;
}

/**
 * GET /identity/users/:userId
 * Lấy thông tin đầy đủ của user, bao gồm seller_profile nếu là ARTIST
 */
export async function getUserProfile(): Promise<UserProfile> {
  const res = await api.get<UserProfile>('/identity/users/me');
  return res.data;
}

/**
 * PATCH /identity/users/profile
 * Update full_name, bio, location (dùng chung cho cả Collector và Artist)
 */
export async function updateProfile(
  data: UpdateProfilePayload,
): Promise<UserProfile> {
  const res = await api.patch<UserProfile>('/identity/users/profile', data);
  return res.data;
}

/**
 * POST /identity/users/avatar
 * Upload avatar mới — gửi multipart/form-data với field name là "file"
 */
export async function uploadAvatar(file: File): Promise<UserProfile> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post<UserProfile>('/identity/users/avatar', formData, {
    headers: {
      // Để browser tự set Content-Type với boundary đúng
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

/**
 * PUT /identity/seller-profiles/:profileId
 * Update seller profile (chỉ dành cho ARTIST): bio, websiteUrl
 */
export async function updateSellerProfile(
  profileId: string,
  data: UpdateSellerProfilePayload,
): Promise<SellerProfile> {
  const res = await api.put<SellerProfile>(
    `/identity/seller-profiles/${profileId}`,
    data,
  );
  return res.data;
}

/**
 * PUT /identity/seller-profiles/:profileId/visibility
 * Bật/tắt hiển thị seller profile
 */
export async function updateSellerProfileVisibility(
  profileId: string,
  isVisible: boolean,
): Promise<SellerProfile> {
  const res = await api.put<SellerProfile>(
    `/identity/seller-profiles/${profileId}/visibility`,
    { isVisible },
  );
  return res.data;
}
export async function deleteMyAccount() {
  const response = await api.delete('/identity/users/me');

  return response.data;
}

/**
 * PUT /identity/seller-profiles/:profileId/verify-request
 * Gửi yêu cầu duyệt Artist
 */
export async function requestVerification(
  profileId: string,
): Promise<SellerProfile> {
  const res = await api.put<SellerProfile>(
    `/identity/seller-profiles/${profileId}/verify-request`,
  );
  return res.data;
}

/**
 * GET /admin/verify-requests
 * Lấy danh sách yêu cầu duyệt
 */
export async function getPendingVerifications(
  page: number = 1,
  limit: number = 10,
) {
  const res = await api.get(`/admin/verify-requests`, {
    params: { page, limit },
  });
  return res.data;
}

/**
 * POST /admin/verify-requests/:profileId/approve
 * Chấp nhận yêu cầu duyệt
 */
export async function approveVerification(
  profileId: string,
): Promise<SellerProfile> {
  const res = await api.post<SellerProfile>(
    `/admin/verify-requests/${profileId}/approve`,
  );
  return res.data;
}

/**
 * POST /admin/verify-requests/:profileId/reject
 * Từ chối yêu cầu duyệt
 */
export async function rejectVerification(
  profileId: string,
): Promise<SellerProfile> {
  const res = await api.post<SellerProfile>(
    `/admin/verify-requests/${profileId}/reject`,
  );
  return res.data;
}
