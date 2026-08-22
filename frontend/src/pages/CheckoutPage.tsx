import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { artworkService, formatArtworkPrice } from '../features/artworks/artworkService';
import { orderService } from '../features/orders/orderService';
import type { Artwork } from '../features/artworks/types';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { artworkId } = useParams<{ artworkId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useI18n();

  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    country: '',
    postalCode: '',
    phone: '',
  });

  useEffect(() => {
    const fetchArtwork = async () => {
      if (!artworkId) return;
      try {
        setLoading(true);
        const data = await artworkService.getArtwork(artworkId);
        setArtwork(data);
      } catch (err) {
        console.error(err);
        setError(t('artworks.detailError'));
      } finally {
        setLoading(false);
      }
    };
    fetchArtwork();
  }, [artworkId, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !artwork || !artwork.price) return;
    
    // Very basic validation
    if (!formData.fullName || !formData.addressLine1 || !formData.city || !formData.country) {
      toast.error(t('common.requiredFields'));
      return;
    }

    try {
      setSubmitting(true);
      const orderData = {
        artworkId: artwork.id,
        shippingAddress: formData,
      };

      const newOrder = await orderService.createOrder(orderData);
      toast.success(t('checkout.success'));
      navigate(`/orders/${newOrder.id}`);
    } catch (err) {
      console.error(err);
      toast.error(t('checkout.error'));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  if (error || !artwork) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('common.unexpectedError')}</h1>
        <p className="mt-3 text-slate-600">{error}</p>
        <Link
          to="/artworks"
          className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {t('artworks.backToArtworks')}
        </Link>
      </div>
    );
  }

  const priceValue = artwork.price ? Number(artwork.price) : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-8">{t('checkout.title')}</h1>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('checkout.shippingAddress')}</h2>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">Full name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="addressLine1" className="block text-sm font-medium text-slate-700">Address line 1 *</label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    required
                    value={formData.addressLine1}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="addressLine2" className="block text-sm font-medium text-slate-700">Address line 2</label>
                  <input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-slate-700">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-slate-700">Postal code</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-slate-700">Country *</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting || !artwork.price}
                className="w-full rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t('checkout.processing') : t('checkout.confirm')}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">{t('checkout.orderSummary')}</h2>
            
            <div className="flex gap-4 pb-6 border-b border-slate-200">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
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
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-900 line-clamp-2">{artwork.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{t('artworks.originalArtwork')}</p>
                </div>
                <p className="text-sm font-medium text-slate-900 mt-2">
                  {formatArtworkPrice(artwork.price, artwork.currency, language === 'en' ? 'en-US' : 'vi-VN', t('artworks.priceOnRequest'))}
                </p>
              </div>
            </div>

            <dl className="mt-6 space-y-4 text-sm text-slate-600">
              <div className="flex justify-between">
                <dt>{t('orders.subtotal')}</dt>
                <dd className="font-medium text-slate-900">
                  {formatArtworkPrice(priceValue.toString(), 'USD', language === 'en' ? 'en-US' : 'vi-VN', '')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>{t('orders.shipping')}</dt>
                <dd className="font-medium text-slate-900">
                  {formatArtworkPrice('0', 'USD', language === 'en' ? 'en-US' : 'vi-VN', '')}
                </dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-4 text-base font-semibold text-slate-900">
                <dt>{t('orders.total')}</dt>
                <dd>
                  {formatArtworkPrice(priceValue.toString(), 'USD', language === 'en' ? 'en-US' : 'vi-VN', '')}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
