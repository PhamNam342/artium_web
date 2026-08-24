import { useState } from 'react';
import {
  Mail,
  User,
  MapPin,
  Globe,
  FileText,
  CheckCircle2,
  Loader2,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../../../i18n/I18nContext';
import {
  updateProfile,
  updateSellerProfile,
  updateSellerProfileVisibility,
  type UserProfile,
} from '../../../services/userService';

interface ArtistFormProps {
  profile: UserProfile;
}

export function ArtistForm({ profile }: ArtistFormProps) {
  const seller = profile.seller_profile;
  const { t } = useI18n();

  const [fullName, setFullName] = useState(profile.full_name ?? '');
  const [location, setLocation] = useState(profile.location ?? '');
  const [bio, setBio] = useState(seller?.bio ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(seller?.website_url ?? '');
  const [isVisible, setIsVisible] = useState(seller?.is_visible ?? true);

  const [showLocation, setShowLocation] = useState(!!profile.location);
  const [showBio, setShowBio] = useState(!!seller?.bio);
  const [showWebsite, setShowWebsite] = useState(!!seller?.website_url);

  const [saving, setSaving] = useState(false);
  const [togglingVisibility, setTogglingVisibility] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seller) return;
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim() || undefined,
        location: showLocation ? location.trim() || undefined : undefined,
      });
      await updateSellerProfile(seller.id, {
        bio: showBio ? bio.trim() || undefined : undefined,
        websiteUrl: showWebsite ? websiteUrl.trim() || undefined : undefined,
      });
      toast.success(t('profile.updateSuccess'));
    } catch {
      toast.error(t('profile.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async () => {
    if (!seller) return;
    setTogglingVisibility(true);
    try {
      await updateSellerProfileVisibility(seller.id, !isVisible);
      setIsVisible((v) => !v);
      toast.success(t('profile.visibilitySuccess'));
    } catch {
      toast.error(t('profile.visibilityError'));
    } finally {
      setTogglingVisibility(false);
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

      {seller ? (
        <>
          {(showBio || showWebsite || seller.is_verified) && (
            <>
              <hr className="border-gray-200" />
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                {t('profile.artistInfo')}
              </p>
            </>
          )}

          {showBio ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.bioLabel')}
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder={t('profile.bioPlaceholder')}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <p className="text-xs text-gray-400 text-right mt-1">{bio.length}/500</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowBio(true)}
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              {t('profile.addBio')}
            </button>
          )}

          {showWebsite ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.websiteLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder={t('profile.websitePlaceholder')}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowWebsite(true)}
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              {t('profile.addWebsite')}
            </button>
          )}

          {seller.is_verified && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span className="text-sm text-green-700 font-medium">
                {t('profile.verifiedAccount')}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between px-3 py-3 border border-gray-200 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">{t('profile.publicVisibility')}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {isVisible ? t('profile.visibleHelp') : t('profile.hiddenHelp')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleVisibility}
              disabled={togglingVisibility}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                isVisible ? 'bg-blue-600' : 'bg-gray-300'
              } ${togglingVisibility ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                  isVisible ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </>
      ) : (
        <div className="px-3 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
          {t('profile.profileNotCreated')}
        </div>
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
