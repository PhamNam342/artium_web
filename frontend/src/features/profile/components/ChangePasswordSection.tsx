import { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../../../i18n/I18nContext';
import { changePassword } from '../../auth/authService';
import PasswordInput from '../../auth/components/PasswordInput';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

interface ChangePasswordSectionProps {
  hasPassword: boolean;
}

export function ChangePasswordSection({ hasPassword }: ChangePasswordSectionProps) {
  const { t } = useI18n();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  if (!hasPassword) {
    return (
      <div className="px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
        {t('profile.passwordGoogleOnly')}
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t('profile.passwordFillAll'));
      return;
    }

    if (newPassword.length < 8) {
      toast.error(t('profile.passwordMinLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('profile.passwordMismatch'));
      return;
    }

    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success(t('profile.passwordChangeSuccess'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? t('profile.passwordChangeError');
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5" />
        {t('profile.changePassword')}
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('profile.currentPasswordLabel')}
        </label>
        <PasswordInput
          id="current-password"
          value={currentPassword}
          onChange={setCurrentPassword}
          placeholder={t('profile.currentPasswordPlaceholder')}
          disabled={saving}
          autoComplete="current-password"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('profile.newPasswordLabel')}
        </label>
        <PasswordInput
          id="new-password"
          value={newPassword}
          onChange={setNewPassword}
          placeholder={t('profile.newPasswordPlaceholder')}
          disabled={saving}
        />
        <PasswordStrengthMeter password={newPassword} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('profile.confirmPasswordLabel')}
        </label>
        <PasswordInput
          id="confirm-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder={t('profile.confirmPasswordPlaceholder')}
          disabled={saving}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-2 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <Loader2 className="animate-spin h-4 w-4" />
            {t('profile.passwordChanging')}
          </>
        ) : (
          t('profile.updatePassword')
        )}
      </button>
    </form>
  );
}
