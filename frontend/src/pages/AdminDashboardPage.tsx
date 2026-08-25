import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { getAdminDashboardStats, type AdminDashboardStats } from '../services/adminService';
import { Users, Palette, UserCheck, ShieldAlert, Loader2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAdminDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const statCards = [
    {
      name: t('admin.dashboard.totalUsers') || 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: t('admin.dashboard.totalArtists') || 'Total Artists',
      value: stats?.totalArtists || 0,
      icon: Palette,
      color: 'bg-purple-500',
    },
    {
      name: t('admin.dashboard.totalCollectors') || 'Total Collectors',
      value: stats?.totalCollectors || 0,
      icon: UserCheck,
      color: 'bg-green-500',
    },
    {
      name: t('admin.dashboard.pendingVerifications') || 'Pending Verifications',
      value: stats?.totalPendingVerifications || 0,
      icon: ShieldAlert,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard.title') || 'Dashboard'}</h1>
        <p className="mt-2 text-sm text-gray-700">
          {t('admin.dashboard.subtitle') || 'Overview of your platform metrics and activities.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className={`absolute rounded-md ${item.color} p-3`}>
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
            </dd>
          </div>
        ))}
      </div>
    </div>
  );
}
