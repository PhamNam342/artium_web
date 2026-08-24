import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Clock3, XCircle } from 'lucide-react';
import { orderService } from '../features/orders/orderService';
import type { Order } from '../features/orders/types';
import { useI18n } from '../i18n/I18nContext';

interface PaymentResultPageProps {
  cancelled?: boolean;
}

export default function PaymentResultPage({
  cancelled = false,
}: PaymentResultPageProps) {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadPaymentResult = async () => {
      if (!orderId) {
        setError(t('payment.missingOrder'));
        setLoading(false);
        return;
      }

      try {
        if (cancelled) {
          await orderService.cancelPayment(orderId).catch(() => undefined);
        }

        let currentOrder: Order | null = null;
        for (let attempt = 0; attempt < 5; attempt += 1) {
          currentOrder = await orderService.getOrderById(orderId);
          if (cancelled || currentOrder.paymentStatus !== 'PENDING') break;
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        if (active) setOrder(currentOrder);
      } catch (requestError) {
        console.error(requestError);
        if (active) setError(t('payment.lookupError'));
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadPaymentResult();
    return () => {
      active = false;
    };
  }, [cancelled, orderId, t]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Clock3 className="mx-auto h-10 w-10 animate-pulse text-blue-600" />
          <p className="mt-4 text-sm text-slate-600">{t('payment.checking')}</p>
        </div>
      </div>
    );
  }

  const isPaid = order?.paymentStatus === 'PAID';
  const isCancelled = order?.paymentStatus === 'CANCELLED' || cancelled;
  const Icon = isPaid ? CheckCircle : isCancelled ? XCircle : Clock3;
  const title = isPaid
    ? t('payment.successTitle')
    : isCancelled
      ? t('payment.cancelledTitle')
      : t('payment.pendingTitle');

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <Icon
        className={`mx-auto h-14 w-14 ${isPaid ? 'text-emerald-600' : isCancelled ? 'text-rose-600' : 'text-amber-500'}`}
      />
      <h1 className="mt-6 text-3xl font-bold text-slate-900">{title}</h1>
      {error ? (
        <p className="mt-3 text-slate-600">{error}</p>
      ) : (
        <p className="mt-3 text-slate-600">{t('payment.statusDescription')}</p>
      )}
      <div className="mt-8 flex justify-center gap-3">
        {order && (
          <Link
            to={`/orders/${order.id}`}
            className="inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {t('payment.viewOrder')}
          </Link>
        )}
        <Link
          to="/artworks"
          className="inline-flex rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {t('artworks.backToArtworks')}
        </Link>
      </div>
    </div>
  );
}
