import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

import { useI18n } from '../../../i18n/I18nContext';
import { deleteMyAccount } from '../../../services/userService';

import { DeleteAccountModal } from './DeleteAccountModal';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../auth/AuthContext';
export function DeleteAccountSection() {
  const { t } = useI18n();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleDeleteAccount = async () => {
    try {
      setLoading(true);


      await deleteMyAccount();

      toast.success(
        t('profile.deleteAccount.success'),
      );

      setIsModalOpen(false);

      // TODO: logout + redirect
      logout();

      // Redirect outside profile
      navigate('/login');
    } catch (error) {
      console.error('Failed to delete account:', error);

      toast.error(
        t('profile.deleteAccount.error'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>

          <div className="flex-1">
            <h2 className="text-base font-semibold text-red-900">
              {t('profile.deleteAccount.title')}
            </h2>

            <p className="mt-1 text-sm leading-6 text-red-700">
              {t('profile.deleteAccount.description')}
            </p>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              disabled={loading}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('profile.deleteAccount.button')}
            </button>
          </div>
        </div>
      </section>

      <DeleteAccountModal
        open={isModalOpen}
        loading={loading}
        onConfirm={handleDeleteAccount}
        onCancel={() => setIsModalOpen(false)}
      />
    </>
  );
}
