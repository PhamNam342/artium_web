import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { orderService } from '../features/orders/orderService';
import type { Order } from '../features/orders/types';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatArtworkPrice } from '../features/artworks/artworkService';

export default function OrdersPage() {
  const { user } = useAuth();
  const { t, language } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!user) return;
        setLoading(true);
        const data = await orderService.getUserOrders();
        setOrders(data);
      } catch (err) {
        console.error(err);
        setError(t('common.unexpectedError'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, t]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'SHIPPED':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-rose-500" />;
      default:
        return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SHIPPED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t('orders.title')}</h1>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
            <Package className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-slate-900">{t('orders.empty')}</h3>
          <p className="mt-2 text-sm text-slate-500">
            {t('artworks.subtitle')}
          </p>
          <Link
            to="/artworks"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {t('nav.artworks')}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col border-b border-slate-100 bg-slate-50/50 p-6 sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4 sm:gap-x-12">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      {t('orders.orderId')}
                    </p>
                    <p className="mt-1 font-mono text-sm font-medium text-slate-900">
                      #{order.id.slice(0, 8)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      {t('orders.date')}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {new Date(order.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      {t('orders.total')}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {order.totalAmount === null
                        ? '—'
                        : formatArtworkPrice(
                            order.totalAmount.toString(),
                            'USD',
                            language === 'en' ? 'en-US' : 'vi-VN',
                            '',
                          )}
                    </p>
                  </div>
                </div>
                <div className="flex sm:justify-end">
                  <Link
                    to={`/orders/${order.id}`}
                    className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    {t('orders.viewDetails')}
                  </Link>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
