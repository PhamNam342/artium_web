import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../../../i18n/I18nContext';
import { uploadAvatar, type UserProfile } from '../../../services/userService';

interface AvatarSectionProps {
  profile: UserProfile;
  onAvatarUpdate: (avatarUrl: string | null) => void;
}

export function AvatarSection({ profile, onAvatarUpdate }: AvatarSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { t } = useI18n();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.avatarFormatError'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.avatarSizeError'));
      return;
    }

    setUploading(true);
    try {
      const updated = await uploadAvatar(file);
      onAvatarUpdate(updated.avatar_url);
      toast.success(t('profile.avatarSuccess'));
    } catch {
      toast.error(t('profile.avatarError'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="relative w-24 h-24 rounded-full group focus:outline-none disabled:cursor-not-allowed"
        aria-label="Change profile picture"
      >
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-900 flex items-center justify-center border-2 border-gray-200">
            <span className="text-3xl font-semibold text-white">
              {profile.email[0].toUpperCase()}
            </span>
          </div>
        )}

        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      </button>

      <p className="text-xs text-gray-400">{t('profile.changeAvatar')}</p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
