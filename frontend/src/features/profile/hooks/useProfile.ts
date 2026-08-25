import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/AuthContext';
import { useI18n } from '../../../i18n/I18nContext';
import {
  getUserProfile,
  type UserProfile,
} from '../../../services/userService';

export function useProfile() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let isCurrent = true;
    const loadProfile = async () => {
      setLoading(true);

      try {
        const nextProfile = await getUserProfile();
        if (isCurrent) setProfile(nextProfile);
      } catch {
        if (isCurrent) toast.error(t('profile.loadError'));
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    void loadProfile();

    return () => {
      isCurrent = false;
    };
  }, [user, t]);

  const updateAvatarUrl = (avatarUrl: string | null) =>
    setProfile((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : prev));

  return { profile, loading, updateAvatarUrl };
}
