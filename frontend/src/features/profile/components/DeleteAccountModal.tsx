import { AlertTriangle, X } from 'lucide-react';

import { useI18n } from '../../../i18n/I18nContext';

interface DeleteAccountModalProps {
  open: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteAccountModal({
  open,
  loading = false,
  onConfirm,
  onCancel,
}: DeleteAccountModalProps) {
  const { t } = useI18n();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={loading ? undefined : onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Close */}
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>

        {/* Content */}
        <div className="mt-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('profile.deleteAccount.confirmTitle')}
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {t('profile.deleteAccount.confirmDescription')}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('profile.deleteAccount.cancel')}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? t('profile.deleteAccount.deleting')
              : t('profile.deleteAccount.confirmButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
