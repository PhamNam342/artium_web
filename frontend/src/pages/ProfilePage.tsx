import { Loader2 } from 'lucide-react';

import { useProfile } from '../features/profile/hooks/useProfile';

import { ProfileInfoSection } from '../features/profile/components/ProfileInfoSection';
import { ChangePasswordSection } from '../features/profile/components/ChangePasswordSection';
import { DeleteAccountSection } from '../features/profile/components/DeleteAccountSection';

import { useI18n } from '../i18n/I18nContext';

export default function ProfilePage() {
  const {
    profile,
    loading,
    updateAvatarUrl,
  } = useProfile();

  const { t } = useI18n();

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
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left - Profile information */}
        <div className="lg:col-span-2">
          <ProfileInfoSection
            profile={profile}
            onAvatarUpdate={updateAvatarUrl}
          />
        </div>

        {/* Right - Change password */}
        <div>
          <ChangePasswordSection
            hasPassword={profile.has_password}
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-6">
        <DeleteAccountSection />
      </div>
    </div>
  );
}
