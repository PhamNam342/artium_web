import { Loader2, Palette, User, CheckCircle2 } from 'lucide-react';

import { useProfile } from '../features/profile/hooks/useProfile';
import { AvatarSection } from '../features/profile/components/AvatarSection';
import { CollectorForm } from '../features/profile/components/CollectorForm';
import { ArtistForm } from '../features/profile/components/ArtistForm';
import { ChangePasswordSection } from '../features/profile/components/ChangePasswordSection';

import { useI18n } from '../i18n/I18nContext';

export default function ProfilePage() {
  const {
    profile,
    loading,
    updateAvatarUrl,
  } = useProfile();

  const { t } = useI18n();

  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // =====================================================
  // Error
  // =====================================================

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <p className="text-sm text-gray-500">
          {t('profile.loadError')}
        </p>
      </div>
    );
  }

  // =====================================================
  // Role
  // =====================================================

  const isArtist = profile.role === 'ARTIST';
  const isCollector = profile.role === 'COLLECTOR';

  // =====================================================
  // Verification
  // =====================================================

  const isVerified =
    isArtist &&
    profile.seller_profile?.is_verified === true;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* ================================================= */}
      {/* Header */}
      {/* ================================================= */}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('profile.title')}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {t('profile.subtitle')}
        </p>
      </div>

      {/* ================================================= */}
      {/* Profile Card */}
      {/* ================================================= */}

      <div className="space-y-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* ================================================= */}
        {/* Role + Verification */}
        {/* ================================================= */}

        <div className="flex flex-wrap items-center gap-2">
          {/* Artist */}
          {isArtist && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
              <Palette className="h-3.5 w-3.5" />

              {t('profile.artist')}
            </span>
          )}

          {/* Collector */}
          {isCollector && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              <User className="h-3.5 w-3.5" />

              {t('profile.collector')}
            </span>
          )}

          {/* ================================================= */}
          {/* Artist Verification */}
          {/* ================================================= */}

          {isArtist && (
            <>
              {/* Verified */}
              {isVerified && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />

                  {t('profile.verified')}
                </span>
              )}

              {/* Unverified */}
              {!isVerified && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                  <CheckCircle2 className="h-3.5 w-3.5" />

                  {t('profile.unverified')}
                </span>
              )}
            </>
          )}
        </div>

        {/* ================================================= */}
        {/* Avatar */}
        {/* ================================================= */}

        <AvatarSection
          profile={profile}
          onAvatarUpdate={updateAvatarUrl}
        />

        <hr className="border-gray-100" />

        {/* ================================================= */}
        {/* Profile Form */}
        {/* ================================================= */}

        {isArtist && (
          <ArtistForm profile={profile} />
        )}

        {isCollector && (
          <CollectorForm profile={profile} />
        )}

        <hr className="border-gray-100" />

        {/* ================================================= */}
        {/* Change Password */}
        {/* ================================================= */}

        <ChangePasswordSection
          hasPassword={profile.has_password}
        />
      </div>
    </div>
  );
}
