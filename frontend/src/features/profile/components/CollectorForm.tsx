import { useState } from 'react';
import { Mail, User, MapPin, Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../../../i18n/I18nContext';
import { updateProfile, type UserProfile } from '../../../services/userService';

interface CollectorFormProps {
  profile: UserProfile;
}

export function CollectorForm({ profile }: CollectorFormProps) {
  const [fullName, setFullName] = useState(profile.full_name ?? '');
  const [location, setLocation] = useState(profile.location ?? '');
  const [showLocation, setShowLocation] = useState(!!profile.location);
  const [saving, setSaving] = useState(false);
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim() || undefined,
        location: showLocation ? location.trim() || undefined : undefined,
      });
      toast.success(t('profile.updateSuccess'));
    } catch {
      toast.error(t('profile.updateError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('profile.emailLabel')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="email"
            value={profile.email}
            readOnly
            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('profile.nameLabel')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={100}
            placeholder={t('profile.namePlaceholder')}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {showLocation ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('profile.locationLabel')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={255}
              placeholder={t('profile.locationPlaceholder')}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowLocation(true)}
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          {t('profile.addLocation')}
        </button>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-semibold"
      >
        {saving ? (
          <>
            <Loader2 className="animate-spin h-4 w-4" />
            {t('profile.saving')}
          </>
        ) : (
          t('profile.saveChanges')
        )}
      </button>
    </form>
  );
}
