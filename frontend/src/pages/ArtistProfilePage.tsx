import { useEffect, useState } from 'react';

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

import FollowListPopup from '../features/followers/components/FollowListPopup';

export default function ArtistProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { language, t } = useI18n();

  // ============================================================
  // Follow popup
  // ============================================================

  const [followPopup, setFollowPopup] = useState<
    'followers' | 'following' | null
  >(null);

  // ============================================================
  // Profile
  // ============================================================

  const [profile, setProfile] =
    useState<PublicUserProfile | null>(null);

  // ============================================================
  // Artworks
  // ============================================================

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [artworkTotal, setArtworkTotal] = useState(0);

  // ============================================================
  // Follow
  // ============================================================

  const [counts, setCounts] = useState<FollowCounts>({
    followers: 0,
    following: 0,
  });

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // ============================================================
  // Loading / Error
  // ============================================================

  const [profileLoading, setProfileLoading] = useState(true);
  const [artworksLoading, setArtworksLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // Tabs
  // ============================================================

  const [activeTab, setActiveTab] =
    useState<ProfileTab>('overview');

  // ============================================================
  // Derived values
  // ============================================================

  const isOwnProfile =
    Boolean(user?.id && user.id === userId);

  const locale =
    language === 'en'
      ? 'en-US'
      : 'vi-VN';

  // ============================================================
  // Load profile
  // ============================================================

  useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;

    // Reset state when changing artist
    setProfile(null);
    setError(null);
    setProfileLoading(true);

    setCounts({
      followers: 0,
      following: 0,
    });

    setActiveTab('overview');
    setFollowPopup(null);

    void Promise.all([
      getPublicUserProfile(userId),
      getFollowCounts(userId),
    ])
      .then(([profileData, countsData]) => {
        if (cancelled) {
          return;
        }

        // Only Artist profile can be displayed here
        if (profileData.role !== 'ARTIST') {
          setProfile(null);
          setError('Artist not found');
          return;
        }

        setProfile(profileData);
        setCounts(countsData);
        setError(null);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setProfile(null);
        setError('Artist not found');
      })
      .finally(() => {
        if (!cancelled) {
          setProfileLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // ============================================================
  // Load artworks
  // ============================================================

  useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;

    setArtworks([]);
    setArtworkTotal(0);
    setArtworksLoading(true);

    void artworkService
      .getArtistArtworks(userId, 20)
      .then((response) => {
        if (cancelled) {
          return;
        }

        setArtworks(response.data ?? []);
        setArtworkTotal(response.meta?.total ?? 0);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setArtworks([]);
        setArtworkTotal(0);
      })
      .finally(() => {
        if (!cancelled) {
          setArtworksLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // ============================================================
  // Load follow status
  // ============================================================

  useEffect(() => {
    if (!userId) {
      return;
    }

    // Own profile cannot follow itself
    if (!user || user.id === userId) {
      setIsFollowing(false);
      return;
    }

    let cancelled = false;

    setIsFollowing(false);

    void getFollowStatus(userId)
      .then((status) => {
        if (!cancelled) {
          setIsFollowing(status);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsFollowing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user, userId]);

  // ============================================================
  // Follow / Unfollow
  // ============================================================

  const handleFollowToggle = async () => {
    if (!userId) {
      return;
    }

    // User is not authenticated
    if (!user) {
      navigate('/login', {
        state: {
          from: `/artists/${userId}`,
        },
      });

      return;
    }

    // Cannot follow yourself
    if (user.id === userId) {
      return;
    }

    if (followLoading) {
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
      // Keep current state if API fails.
      // Could add toast notification here later.
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

    // Native share
    if (navigator.share) {
      try {
        await navigator.share({
          title: displayName,
          url,
        });
      } catch {
        // User cancelled share.
      }

      return;
    }

    // Fallback: clipboard
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard unavailable.
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
        onFollowersClick={() =>
          setFollowPopup('followers')
        }
        onFollowingClick={() =>
          setFollowPopup('following')
        }
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
                    'SEE ALL'}{' '}
                  →
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
          Outside tabs
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

      {/* ======================================================
          Followers / Following Popup
          ====================================================== */}

      {followPopup && (
        <FollowListPopup
          userId={userId}
          type={followPopup}
          onClose={() => setFollowPopup(null)}
        />
      )}
    </div>
  );
}
