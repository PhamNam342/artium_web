import type { AdminUser } from '../../../services/adminService';
import { User, Shield, Briefcase, Ban, CheckCircle, Eye } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';

interface UserTableProps {
  users: AdminUser[];
  isLoading: boolean;
  onActionClick: (user: AdminUser) => void;
  onViewClick: (user: AdminUser) => void;
}

export default function UserTable({ users, isLoading, onActionClick, onViewClick }: UserTableProps) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-gray-500">
        <User className="w-12 h-12 mb-4 text-gray-400" />
        <p>{t('admin.users.table.empty')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              {t('admin.users.table.user')}
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {t('admin.users.table.role')}
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {t('admin.users.table.status')}
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {t('admin.users.table.joinedDate')}
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">{t('admin.users.table.actions')}</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    {user.avatar_url ? (
                      <img className="h-10 w-10 rounded-full object-cover" src={user.avatar_url} alt="" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-gray-900">{user.full_name || 'No name provided'}</div>
                    <div className="text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  {user.role === 'ADMIN' && <Shield className="w-4 h-4 text-red-500" />}
                  {user.role === 'ARTIST' && <Briefcase className="w-4 h-4 text-blue-500" />}
                  {user.role === 'COLLECTOR' && <User className="w-4 h-4 text-green-500" />}
                  <span>{user.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : 'N/A'}</span>
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_active ? t('admin.users.table.active') : t('admin.users.table.inactive')}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onViewClick(user)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onActionClick(user)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md ${
                      user.is_active 
                        ? 'text-red-700 bg-red-50 hover:bg-red-100' 
                        : 'text-green-700 bg-green-50 hover:bg-green-100'
                    }`}
                  >
                    {user.is_active ? (
                    <>
                      <Ban className="w-4 h-4" />
                      {t('admin.users.actions.disable')}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {t('admin.users.actions.enable')}
                    </>
                  )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
