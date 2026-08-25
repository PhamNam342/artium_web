import {
  CheckCircle2,
  Globe,
  Loader2,
  MapPin,
  MessageCircle,
  Share2,
  UserRound,
} from 'lucide-react';

import { useI18n } from '../../../i18n/I18nContext';
import type { PublicUserProfile } from '../../../services/userService';

interface FollowCounts {
  followers: number;
  following: number;
}

interface ArtistProfileHeaderProps {
  profile: PublicUserProfile;
  counts: FollowCounts;
  artworkCount: number;
  isFollowing: boolean;
  followLoading: boolean;
  isOwnProfile: boolean;
  onFollowToggle: () => void;
  onShare: () => void;
  onBack: () => void;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
}

export default function ArtistProfileHeader({
  profile,
  counts,
  artworkCount,
  isFollowing,
  followLoading,
  isOwnProfile,
  onFollowToggle,
  onShare,
  onBack,
  onFollowersClick,
  onFollowingClick,
}: ArtistProfileHeaderProps) {
  const { t } = useI18n();

  const displayName =
    profile.full_name || `@${profile.id.slice(0, 8)}`;

  const handle = `@${profile.id.slice(0, 8)}`;

  const website = profile.seller_profile?.website_url;

  const isVerified =
    profile.seller_profile?.is_verified === true;

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1200px] px-6 py-10">

        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          className="mb-8 text-sm text-slate-600 hover:text-slate-950"
        >
          ← {t('common.back') || 'Back'}
        </button>

        {/* Main Header */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-slate-100 shadow-lg">
                <UserRound className="h-12 w-12 text-slate-400" />
              </div>
            )}

            {/* Verified badge */}
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5">
                <CheckCircle2 className="h-6 w-6 fill-blue-500 text-white" />
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="min-w-0 flex-1">

            {/* Name + Verified */}
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">
                {displayName}
              </h1>

              {isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                  <CheckCircle2 className="h-3.5 w-3.5 fill-blue-500 text-white" />
                  {t('artistProfile.verified') || 'Verified'}
                </span>
              )}
            </div>

            {/* Handle */}
            <p className="mt-1 text-sm text-slate-500">
              {handle}
            </p>

            {/* Location */}
            {profile.location && (
              <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                {profile.location}
              </p>
            )}

            {/* Website */}
            {website && (
              <p className="mt-1">
                <a
                  href={
                    website.startsWith('http')
                      ? website
                      : `https://${website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {website.replace(/^https?:\/\//, '')}
                </a>
              </p>
            )}
          </div>

          {/* Right Side - Stats + Actions */}
          <div className="flex flex-col gap-6 lg:ml-auto lg:min-w-[360px]">

            {/* Stats */}
            <div className="flex items-center justify-start gap-8 lg:justify-end">

              {/* Artworks */}
              <div className="min-w-[70px] text-center">
                <span className="block text-lg font-bold text-slate-950">
                  {artworkCount}
                </span>

                <p className="mt-1 text-xs text-slate-500">
                  {t('artistProfile.artworks', {
                    count: artworkCount,
                  })}
                </p>
              </div>

              <div className="h-8 w-px bg-slate-200" />

              {/* Followers */}
              <button
                type="button"
                onClick={onFollowersClick}
                className="min-w-[70px] text-center transition hover:opacity-70"
              >
                <span className="block text-lg font-bold text-slate-950">
                  {counts.followers}
                </span>

                <p className="mt-1 text-xs text-slate-500">
                  {t('artistProfile.followers', {
                    count: counts.followers,
                  })}
                </p>
              </button>

              <div className="h-8 w-px bg-slate-200" />

              {/* Following */}
              <button
                type="button"
                onClick={onFollowingClick}
                className="min-w-[70px] text-center transition hover:opacity-70"
              >
                <span className="block text-lg font-bold text-slate-950">
                  {counts.following}
                </span>

                <p className="mt-1 text-xs text-slate-500">
                  {t('artistProfile.following', {
                    count: counts.following,
                  })}
                </p>
              </button>
            </div>

            {/* Actions */}
            {!isOwnProfile && (
              <div className="flex flex-wrap items-center justify-start gap-3 lg:justify-end">

                {/* Follow */}
                <button
                  type="button"
                  onClick={onFollowToggle}
                  disabled={followLoading}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition ${
                    isFollowing
                      ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      : 'bg-slate-950 text-white hover:bg-slate-800'
                  }`}
                >
                  {followLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isFollowing ? (
                    t('artistProfile.followingAction') ||
                    'Following'
                  ) : (
                    t('artistProfile.follow') ||
                    'Follow'
                  )}
                </button>

                {/* Message */}
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <MessageCircle className="h-4 w-4" />

                  {t('artistProfile.message') ||
                    'Message'}
                </button>

                {/* Share */}
                <button
                  type="button"
                  onClick={onShare}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:bg-slate-50"
                  aria-label={
                    t('artistProfile.share') || 'Share'
                  }
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
