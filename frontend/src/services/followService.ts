import api from './api';

export interface FollowUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'ARTIST' | 'COLLECTOR' | 'ADMIN' | null;
  location: string | null;
}

export interface FollowCounts {
  followers: number;
  following: number;
}

export interface FollowListResponse {
  data: FollowUser[];
  meta: {
    total: number;
    skip: number;
    take: number;
    hasMore: boolean;
  };
}

export interface FollowListParams {
  skip?: number;
  take?: number;
}

export async function getFollowCounts(userId: string): Promise<FollowCounts> {
  const res = await api.get<FollowCounts>(`/community/followers/counts/${userId}`);
  return res.data;
}

export async function getFollowers(
  userId: string,
  { skip = 0, take = 20 }: FollowListParams = {},
): Promise<FollowListResponse> {
  const res = await api.get<FollowListResponse>(
    `/community/followers/followers/${userId}`,
    { params: { skip, take } },
  );

  return res.data;
}

export async function getFollowStatus(userId: string): Promise<boolean> {
  const res = await api.get<{ isFollowing: boolean }>(`/community/followers/status/${userId}`);
  return res.data.isFollowing;
}

export async function followUser(userId: string): Promise<void> {
  await api.post(`/community/followers/${userId}`);
}

export async function unfollowUser(userId: string): Promise<void> {
  await api.delete(`/community/followers/${userId}`);
}

export async function getFollowing(
  userId: string,
  { skip = 0, take = 20 }: FollowListParams = {},
): Promise<FollowListResponse> {
  const res = await api.get<FollowListResponse>(
    `/community/followers/following/${userId}`,
    {
      params: {
        skip,
        take,
      },
    },
  );

  return res.data;
}
