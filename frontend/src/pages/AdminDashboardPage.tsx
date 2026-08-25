import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { getAdminDashboardStats, type AdminDashboardStats } from '../services/adminService';
import {
  Users, Palette, UserCheck, ShieldAlert, Loader2,
  TrendingUp, ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

// Month key (YYYY-MM) → short name
function formatMonth(key: string): string {
  const [y, m] = key.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleString('default', { month: 'short', year: '2-digit' });
}

const PIE_COLORS = ['#6366f1', '#22c55e', '#94a3b8'];

const GRAD_ID = 'userGrad';

export default function AdminDashboardPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAdminDashboardStats()
      .then(setStats)
      .catch((err) => console.error('Failed to load admin stats', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const statCards = [
    {
      name: t('admin.dashboard.totalUsers') || 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      gradient: 'from-indigo-500 to-indigo-600',
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
    },
    {
      name: t('admin.dashboard.totalArtists') || 'Total Artists',
      value: stats?.totalArtists ?? 0,
      icon: Palette,
      gradient: 'from-violet-500 to-violet-600',
      bg: 'bg-violet-50',
      text: 'text-violet-600',
    },
    {
      name: t('admin.dashboard.totalCollectors') || 'Total Collectors',
      value: stats?.totalCollectors ?? 0,
      icon: UserCheck,
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
    },
    {
      name: t('admin.dashboard.pendingVerifications') || 'Pending Verifications',
      value: stats?.totalPendingVerifications ?? 0,
      icon: ShieldAlert,
      gradient: 'from-amber-400 to-amber-500',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
    },
  ];

  const chartData = (stats?.monthlyUsers ?? []).map((d) => ({
    ...d,
    label: formatMonth(d.month),
  }));

  const pieData = stats?.roleBreakdown ?? [];
  const maxMonthly = Math.max(...(stats?.monthlyUsers?.map((d) => d.users) ?? [0]), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('admin.dashboard.title') || 'Dashboard'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {t('admin.dashboard.subtitle') || 'Overview of your platform metrics and activities.'}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.name}
            className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-5 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Decorative gradient blob */}
            <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-br ${card.gradient} opacity-10`} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                  {card.name}
                </p>
                <p className="text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
              </div>
              <div className={`flex-shrink-0 rounded-xl p-2.5 ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.text}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs text-gray-400">{t('admin.dashboard.lastUpdated') || 'Live data'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Area Chart — User Growth */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {t('admin.dashboard.chart.userGrowth') || 'User Growth'}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {t('admin.dashboard.chart.last6Months') || 'New registrations — last 6 months'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1">
              <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-xs font-medium text-indigo-600">
                {stats?.totalUsers ?? 0} {t('admin.dashboard.totalUsers') || 'total'}
              </span>
            </div>
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={GRAD_ID} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, Math.ceil(maxMonthly * 1.2) || 1]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    fontSize: 12,
                  }}
                  labelStyle={{ fontWeight: 600, color: '#1e293b' }}
                  itemStyle={{ color: '#6366f1' }}
                  formatter={(v: number) => [v, t('admin.dashboard.chart.newUsers') || 'New Users']}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill={`url(#${GRAD_ID})`}
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-sm text-gray-400">
              {t('admin.dashboard.chart.noData') || 'No data available'}
            </div>
          )}
        </div>

        {/* Pie Chart — Role Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900">
              {t('admin.dashboard.chart.roleBreakdown') || 'User Roles'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {t('admin.dashboard.chart.distribution') || 'Distribution by account type'}
            </p>
          </div>

          {pieData.some((d) => d.value > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      fontSize: 12,
                    }}
                    formatter={(v: number, name: string) => [v, name]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="mt-2 space-y-2">
                {pieData.map((d, idx) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      <span className="text-xs text-gray-600">{d.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-[180px] items-center justify-center text-sm text-gray-400">
              {t('admin.dashboard.chart.noData') || 'No data available'}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: t('admin.verifyRequests.title') || 'Verify Requests',
            value: stats?.totalPendingVerifications ?? 0,
            href: '/admin/verify-requests',
            color: 'text-amber-600',
            bg: 'bg-amber-50 hover:bg-amber-100',
            badge: (stats?.totalPendingVerifications ?? 0) > 0,
          },
          {
            label: t('admin.users.title') || 'User Management',
            value: stats?.totalUsers ?? 0,
            href: '/admin/users',
            color: 'text-indigo-600',
            bg: 'bg-indigo-50 hover:bg-indigo-100',
            badge: false,
          },
          {
            label: t('admin.artworks.title') || 'Artwork Management',
            value: null,
            href: '/admin/artworks',
            color: 'text-violet-600',
            bg: 'bg-violet-50 hover:bg-violet-100',
            badge: false,
          },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`relative flex items-center justify-between rounded-xl px-5 py-4 transition-colors ${link.bg}`}
          >
            <span className={`text-sm font-semibold ${link.color}`}>{link.label}</span>
            <div className="flex items-center gap-2">
              {link.value !== null && (
                <span className={`text-sm font-bold ${link.color}`}>{link.value}</span>
              )}
              {link.badge && (
                <span className="flex h-2 w-2 rounded-full bg-amber-500 ring-2 ring-amber-200" />
              )}
              <ArrowUpRight className={`h-4 w-4 ${link.color}`} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
