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
    setLoading(true);
    getUserProfile()
      .then(setProfile)
      .catch(() => toast.error(t('profile.loadError')))
      .finally(() => setLoading(false));
  }, [user, t]);

  const updateAvatarUrl = (avatarUrl: string | null) =>
    setProfile((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : prev));

  return { profile, loading, updateAvatarUrl };
}
