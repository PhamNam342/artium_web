import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { useProfile } from '../features/profile/hooks/useProfile';

import { ProfileInfoSection } from '../features/profile/components/ProfileInfoSection';
import { ChangePasswordSection } from '../features/profile/components/ChangePasswordSection';
import { DeleteAccountSection } from '../features/profile/components/DeleteAccountSection';
import FollowListPopup from '../features/followers/components/FollowListPopup';
import {
  getFollowCounts,
  type FollowCounts,
} from '../services/followService';

import { useI18n } from '../i18n/I18nContext';

export default function ProfilePage() {
  const {
    profile,
    loading,
    updateAvatarUrl,
  } = useProfile();

  const { t } = useI18n();
  const [followListType, setFollowListType] = useState<
    'followers' | 'following' | null
  >(null);
  const [followCounts, setFollowCounts] = useState<FollowCounts | null>(null);

  useEffect(() => {
    if (!profile) return;

    let active = true;

    void getFollowCounts(profile.id)
      .then((counts) => {
        if (active) setFollowCounts(counts);
      })
      .catch(() => {
        if (active) setFollowCounts(null);
      });

    return () => {
      active = false;
    };
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <p className="text-sm text-gray-500">
          {t('profile.loadError')}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('profile.title')}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {t('profile.subtitle')}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          <button
            type="button"
            onClick={() => setFollowListType('following')}
            className="inline-flex items-baseline gap-2 text-left transition hover:opacity-65 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <span className="text-lg font-bold text-slate-950">
              {followCounts?.following ?? '—'}
            </span>
            <span className="text-sm font-medium text-slate-600">
              {t('profile.followingStat')}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFollowListType('followers')}
            className="inline-flex items-baseline gap-2 text-left transition hover:opacity-65 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <span className="text-lg font-bold text-slate-950">
              {followCounts?.followers ?? '—'}
            </span>
            <span className="text-sm font-medium text-slate-600">
              {t('profile.followersStat')}
            </span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <div>
          <ProfileInfoSection
            profile={profile}
            onAvatarUpdate={updateAvatarUrl}
          />
        </div>

        <div className="space-y-6">
          <ChangePasswordSection
            hasPassword={profile.has_password}
          />
          <DeleteAccountSection />
        </div>
      </div>

      {followListType && (
        <FollowListPopup
          userId={profile.id}
          type={followListType}
          onClose={() => setFollowListType(null)}
        />
      )}
    </div>
  );
}
