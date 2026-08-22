import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { orderService } from '../features/orders/orderService';
import { artworkService, formatArtworkPrice } from '../features/artworks/artworkService';
import type { Order } from '../features/orders/types';
import type { Artwork } from '../features/artworks/types';
import { ArrowLeft, MapPin, CreditCard } from 'lucide-react';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t, language } = useI18n();
  const [order, setOrder] = useState<Order | null>(null);
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (!user || !id) return;
        setLoading(true);
        setError(null);
        setArtwork(null);
        const orderData = await orderService.getOrderById(id);
        setOrder(orderData);

        if (orderData.artworkId) {
          try {
            const artworkData = await artworkService.getArtwork(orderData.artworkId);
            setArtwork(artworkData);
          } catch {
            // Reserved and sold artworks are intentionally hidden from the public artwork API.
          }
        }
      } catch (err) {
        console.error(err);
        setError(t('common.unexpectedError'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, user, t]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('common.unexpectedError')}</h1>
        <p className="mt-3 text-slate-600">{error}</p>
        <Link
          to="/orders"
          className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {t('orders.backToList')}
        </Link>
      </div>
    );
  }

  const formatOrderAmount = (amount: number | null) => {
    if (amount === null) {
      return '—';
    }

    return formatArtworkPrice(
      amount.toString(),
      'USD',
      language === 'en' ? 'en-US' : 'vi-VN',
      '',
    );
  };

  const handleVnpayPayment = async () => {
    setPaying(true);
    try {
      const { paymentUrl } = await orderService.createVnpayPayment(order.id);
      window.location.assign(paymentUrl);
    } catch {
      setPaying(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/orders"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('orders.backToList')}
      </Link>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t('orders.orderId')} #{order.id.slice(0, 8)}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {t('orders.date')}: {new Date(order.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN')}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
          <span className="text-sm font-medium text-slate-700">{t('orders.status')}:</span>
          <span className="text-sm font-bold text-slate-900">{order.status}</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">{t('checkout.orderSummary')}</h2>
            {artwork && (
              <div className="flex flex-col sm:flex-row gap-6 pb-6 border-b border-slate-100">
                <div className="h-32 w-32 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {artwork.images && artwork.images[0] ? (
                    <img
                      src={artwork.images[0].secureUrl || artwork.images[0].url}
                      alt={artwork.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400 text-xs">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-lg font-medium text-slate-900">{artwork.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{t('artworks.originalArtwork')}</p>
                </div>
              </div>
            )}
            
            <dl className="mt-6 space-y-4 text-sm text-slate-600">
              <div className="flex justify-between">
                <dt>{t('orders.subtotal')}</dt>
                <dd className="font-medium text-slate-900">
                  {formatOrderAmount(order.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>{t('orders.shipping')}</dt>
                <dd className="font-medium text-slate-900">
                  {formatOrderAmount(order.shippingCost)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-4 text-base font-semibold text-slate-900">
                <dt>{t('orders.total')}</dt>
                <dd>
                  {formatOrderAmount(order.totalAmount)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
              <MapPin className="h-5 w-5 text-slate-400" />
              {t('orders.address')}
            </h2>
            <div className="text-sm text-slate-600">
              {order.shippingAddress?.fullName && <p className="font-medium text-slate-900">{order.shippingAddress.fullName}</p>}
              <p className="mt-1">{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.country}</p>
              <p>{order.shippingAddress?.postalCode}</p>
              {order.shippingAddress?.phone && <p className="mt-2">{order.shippingAddress.phone}</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
              <CreditCard className="h-5 w-5 text-slate-400" />
              {t('orders.payment')}
            </h2>
            <div className="text-sm text-slate-600">
              <p>{order.paymentStatus || 'PENDING'}</p>
              {order.paymentStatus !== 'PAID' && order.status !== 'CANCELLED' && (
                <button type="button" onClick={handleVnpayPayment} disabled={paying} className="mt-4 rounded-full bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50">
                  {paying ? 'Đang chuyển sang VNPay...' : 'Thanh toán qua VNPay'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
