import { Palette, User, CheckCircle2 } from 'lucide-react';

import { AvatarSection } from './AvatarSection';
import { CollectorForm } from './CollectorForm';
import { ArtistForm } from './ArtistForm';

import { useI18n } from '../../../i18n/I18nContext';
import type { UserProfile } from '../../../services/userService';
interface ProfileInfoSectionProps {
  profile: UserProfile;
  onAvatarUpdate: (avatarUrl: string | null) => void;
}

export function ProfileInfoSection({
  profile,
  onAvatarUpdate,
}: ProfileInfoSectionProps) {
  const { t } = useI18n();

  const isArtist = profile.role === 'ARTIST';
  const isCollector = profile.role === 'COLLECTOR';

  const isVerified =
    isArtist &&
    profile.seller_profile?.is_verified === true;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Role + Verification */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {isArtist && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
            <Palette className="h-3.5 w-3.5" />
            {t('profile.artist')}
          </span>
        )}

        {isCollector && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            <User className="h-3.5 w-3.5" />
            {t('profile.collector')}
          </span>
        )}

        {isArtist && isVerified && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t('profile.verified')}
          </span>
        )}

        {isArtist && !isVerified && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t('profile.unverified')}
          </span>
        )}
      </div>

      {/* Avatar */}
      <AvatarSection
        profile={profile}
        onAvatarUpdate={onAvatarUpdate}
      />

      <hr className="my-6 border-gray-100" />

      {/* Profile form */}
      {isArtist && <ArtistForm profile={profile} />}

      {isCollector && <CollectorForm profile={profile} />}
    </section>
  );
}
