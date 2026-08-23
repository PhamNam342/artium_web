import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import ArtistProfileHeader from '../features/artists/components/ArtistProfileHeader';
import ArtistProfileTabs, {
  type ProfileTab,
} from '../features/artists/components/ArtistProfileTabs';
import ArtistArtworkGrid from '../features/artists/components/ArtistArtworkGrid';

import {
  getPublicUserProfile,
  type PublicUserProfile,
} from '../services/userService';

import {
  getFollowCounts,
  getFollowStatus,
  followUser,
  unfollowUser,
  type FollowCounts,
} from '../services/followService';

import { useAuth } from '../features/auth/AuthContext';
import { useI18n } from '../i18n/I18nContext';

import { artworkService } from '../features/artworks/artworkService';

import type { Artwork } from '../features/artworks/types';

export default function ArtistProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { language, t } = useI18n();

  // ============================================================
  // Profile
  // ============================================================

  const [profile, setProfile] =
    useState<PublicUserProfile | null>(null);

  // ============================================================
  // Artworks
  // ============================================================

  const [artworks, setArtworks] =
    useState<Artwork[]>([]);

  const [artworkTotal, setArtworkTotal] =
    useState(0);

  // ============================================================
  // Follow
  // ============================================================

  const [counts, setCounts] =
    useState<FollowCounts>({
      followers: 0,
      following: 0,
    });

  const [isFollowing, setIsFollowing] =
    useState(false);

  const [followLoading, setFollowLoading] =
    useState(false);

  // ============================================================
  // Loading / Error
  // ============================================================

  const [profileLoading, setProfileLoading] =
    useState(true);

  const [artworksLoading, setArtworksLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  // ============================================================
  // Tabs
  // ============================================================

  const [activeTab, setActiveTab] =
    useState<ProfileTab>('overview');

  // ============================================================
  // Fetch profile + follow counts
  // ============================================================

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      return;
    }

    setProfileLoading(true);
    setError(null);

    try {
      const [profileData, countsData] =
        await Promise.all([
          getPublicUserProfile(userId),
          getFollowCounts(userId),
        ]);

      console.log('📌 PROFILE DATA:');
      console.log(profileData);

      // Artist profile page chỉ dành cho ARTIST
      if (profileData.role !== 'ARTIST') {
        setProfile(null);
        setError('Artist not found');
        return;
      }

      setProfile(profileData);
      setCounts(countsData);
    } catch {
      setProfile(null);
      setError('Artist not found');
    } finally {
      setProfileLoading(false);
    }
  }, [userId]);

  // ============================================================
  // Fetch follow status
  // ============================================================

  const fetchFollowStatus = useCallback(async () => {
    if (!userId || !user) {
      setIsFollowing(false);
      return;
    }

    // Không cần gọi API nếu đang xem chính mình
    if (user.id === userId) {
      setIsFollowing(false);
      return;
    }

    try {
      const status = await getFollowStatus(userId);

      setIsFollowing(status);
    } catch {
      setIsFollowing(false);
    }
  }, [userId, user]);

  // ============================================================
  // Fetch artist artworks
  // ============================================================

  const fetchArtworks = useCallback(async () => {
    if (!userId) {
      return;
    }

    setArtworksLoading(true);

    try {
      const response =
        await artworkService.getArtistArtworks(
          userId,
          20,
        );

      setArtworks(response.data ?? []);

      // Lấy tổng số artwork từ backend
      setArtworkTotal(
        response.meta?.total ?? 0,
      );
    } catch {
      setArtworks([]);
      setArtworkTotal(0);
    } finally {
      setArtworksLoading(false);
    }
  }, [userId]);

  // ============================================================
  // Initial load
  // ============================================================

  useEffect(() => {
    fetchProfile();
    fetchFollowStatus();
    fetchArtworks();
  }, [
    fetchProfile,
    fetchFollowStatus,
    fetchArtworks,
  ]);

  // ============================================================
  // Follow / Unfollow
  // ============================================================

  const handleFollowToggle = async () => {
    if (!userId || !user) {
      navigate('/login', {
        state: {
          from: `/artists/${userId}`,
        },
      });

      return;
    }

    // Không cho tự follow
    if (user.id === userId) {
      return;
    }

    setFollowLoading(true);

    try {
      if (isFollowing) {
        await unfollowUser(userId);

        setIsFollowing(false);

        setCounts((prev) => ({
          ...prev,
          followers: Math.max(
            0,
            prev.followers - 1,
          ),
        }));
      } else {
        await followUser(userId);

        setIsFollowing(true);

        setCounts((prev) => ({
          ...prev,
          followers: prev.followers + 1,
        }));
      }
    } catch {
      // Giữ nguyên state nếu API thất bại
    } finally {
      setFollowLoading(false);
    }
  };

  // ============================================================
  // Share
  // ============================================================

  const handleShare = async () => {
    const url = window.location.href;

    const displayName =
      profile?.full_name ||
      `@${userId?.slice(0, 8) ?? ''}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: displayName,
          url,
        });
      } catch {
        // User cancelled
      }

      return;
    }

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard unavailable
    }
  };

  // ============================================================
  // Loading
  // ============================================================

  if (!userId || profileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // ============================================================
  // Error
  // ============================================================

  if (error || !profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-slate-500">
          {error ?? 'Artist not found'}
        </p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Go back
        </button>
      </div>
    );
  }

  // ============================================================
  // Derived data
  // ============================================================

  const locale =
    language === 'en'
      ? 'en-US'
      : 'vi-VN';

  const isOwnProfile =
    user?.id === userId;

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="min-h-screen bg-white">

      {/* ======================================================
          Profile Header
          ====================================================== */}

      <ArtistProfileHeader
        profile={profile}
        counts={counts}
        artworkCount={artworkTotal}
        isFollowing={isFollowing}
        followLoading={followLoading}
        isOwnProfile={isOwnProfile}
        onFollowToggle={handleFollowToggle}
        onShare={handleShare}
        onBack={() => navigate(-1)}
      />

      {/* ======================================================
          Tabs
          ====================================================== */}

      <ArtistProfileTabs
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* ======================================================
          Tab Content
          ====================================================== */}

      <main className="mx-auto max-w-[1200px] px-6 py-10">

        {/* ==================================================
            Overview
            ================================================== */}

        {activeTab === 'overview' && (
          <section>

            {/* Artwork heading */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-950">
                {t('artistProfile.artworks', {
                  count: artworkTotal,
                })}
              </h2>

              {artworkTotal > 10 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveTab('artworks')
                  }
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {t('artistProfile.seeAll') ||
                    'SEE ALL'} →
                </button>
              )}
            </div>

            {/* Artwork grid */}
            <ArtistArtworkGrid
              artworks={artworks}
              isLoading={artworksLoading}
              locale={locale}
              priceOnRequest={
                t('artworks.priceOnRequest') ||
                'Price on request'
              }
              limit={10}
            />

          </section>
        )}

        {/* ==================================================
            All Artworks
            ================================================== */}

        {activeTab === 'artworks' && (
          <section>

            <h2 className="mb-6 text-xl font-bold text-slate-950">
              {t('artistProfile.allArtworks') ||
                'All Artworks'}

              {artworkTotal > 0 && (
                <span className="ml-2 text-base font-normal text-slate-500">
                  ({artworkTotal})
                </span>
              )}
            </h2>

            <ArtistArtworkGrid
              artworks={artworks}
              isLoading={artworksLoading}
              locale={locale}
              priceOnRequest={
                t('artworks.priceOnRequest') ||
                'Price on request'
              }
              masonry
            />

          </section>
        )}

      </main>

      {/* ======================================================
          Artist Bio
          Nằm NGOÀI tabs
          ====================================================== */}

      {profile.seller_profile?.bio && (
        <section className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-[1200px] px-6 py-10">

            <h2 className="mb-4 text-xl font-bold text-slate-950">
              {t('artistProfile.about') ||
                'About the artist'}
            </h2>

            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              {profile.seller_profile.bio}
            </p>

          </div>
        </section>
      )}

    </div>
  );
}
