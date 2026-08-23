import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, ImageOff, Maximize2, MessageCircle, Ruler, ShoppingCart, Tag, X } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { artworkService, formatArtworkPrice, getArtworkImage } from '../features/artworks/artworkService';
import { useAuth } from '../features/auth/AuthContext';
import type { Artwork } from '../features/artworks/types';
import { useI18n } from '../i18n/I18nContext';

function formatDimensions(artwork: Artwork) {
  const dimensions = artwork.dimensions;
  if (!dimensions) return null;
  const values = [dimensions.height, dimensions.width, dimensions.depth].filter((value) => value !== undefined);
  return values.length > 0 ? `${values.join(' × ')} ${dimensions.unit || 'cm'}` : null;
}

function formatWeight(artwork: Artwork) {
  const { weight } = artwork;
  if (weight === null || weight === undefined) return null;
  if (typeof weight === 'string' || typeof weight === 'number') return String(weight);
  if (weight.value === undefined) return null;
  return `${weight.value}${weight.unit ? ` ${weight.unit}` : ''}`;
}

export default function ArtworkDetailPage() {
  const { language, t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;

    artworkService.getArtwork(id)
      .then((response) => {
        if (active) {
          setArtwork(response);
          setError(null);
          setSelectedIndex(0);
        }
      })
      .catch(() => {
        if (active) setError(t('artworks.detailError'));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, [id, t]);

  const images = useMemo(() => {
    if (!artwork) return [];
    return [...artwork.images].sort((first, second) => {
      if (first.isPrimary !== second.isPrimary) return first.isPrimary ? -1 : 1;
      return (first.order ?? 0) - (second.order ?? 0);
    });
  }, [artwork]);
  const currentImage = images[selectedIndex] || getArtworkImage(artwork?.images);
  const dimensions = artwork ? formatDimensions(artwork) : null;
  const weight = artwork ? formatWeight(artwork) : null;

  const selectRelativeImage = (offset: number) => {
    if (images.length < 2) return;
    setSelectedIndex((current) => (current + offset + images.length) % images.length);
  };

  const handleFavorite = () => {
    setIsFavorited((current) => {
      toast.success(t(current ? 'artworks.favoriteRemoved' : 'artworks.favoriteAdded'));
      return !current;
    });
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login', { state: { from: `${location.pathname}${location.search}${location.hash}` } });
      return;
    }

    setIsInCart(true);
    toast.success(t('artworks.cartAdded'));
  };

  const handleBuyNow = () => {
    if (!artwork) return;
    if (!user) {
      navigate('/login', { state: { from: `/checkout/${artwork.id}` } });
      return;
    }

    navigate(`/checkout/${artwork.id}`);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (event.key === 'Escape') setIsLightboxOpen(false);
      if (event.key === 'ArrowLeft') selectRelativeImage(-1);
      if (event.key === 'ArrowRight') selectRelativeImage(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]"><div className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-200" /><div className="space-y-4"><div className="h-10 w-3/4 animate-pulse rounded bg-slate-200" /><div className="h-5 w-1/2 animate-pulse rounded bg-slate-100" /><div className="h-24 animate-pulse rounded bg-slate-100" /></div></div></div>;
  }

  if (error || !artwork) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6"><h1 className="text-2xl font-bold text-slate-900">{t('artworks.detailUnavailable')}</h1><p className="mt-3 text-slate-600">{error}</p><Link to="/artworks" className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">{t('artworks.backToArtworks')}</Link></div>;
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
        <Link to="/artworks" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"><ArrowLeft className="h-4 w-4" aria-hidden="true" />{t('artworks.allArtworks')}</Link>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)] lg:gap-12">
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
              {currentImage ? <img src={currentImage.secureUrl || currentImage.url} alt={currentImage.altText || currentImage.alt || artwork.title} className="h-full w-full cursor-zoom-in object-contain p-4 sm:p-8" onClick={() => setIsLightboxOpen(true)} /> : <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400"><ImageOff className="h-10 w-10" /><span className="text-sm">{t('artworks.imageUnavailable')}</span></div>}
              {currentImage && <button type="button" onClick={() => setIsLightboxOpen(true)} className="absolute right-4 bottom-4 rounded-full bg-white/90 p-2.5 text-slate-700 shadow-sm transition hover:bg-white" aria-label={t('artworks.viewFullscreen')}><Maximize2 className="h-4 w-4" /></button>}
              {images.length > 1 && <><button type="button" onClick={() => selectRelativeImage(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-slate-700 shadow-sm transition hover:bg-white" aria-label={t('artworks.previousImage')}><ChevronLeft className="h-5 w-5" /></button><button type="button" onClick={() => selectRelativeImage(1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-slate-700 shadow-sm transition hover:bg-white" aria-label={t('artworks.nextImage')}><ChevronRight className="h-5 w-5" /></button></>}
            </div>
            {images.length > 1 && <div className="mt-4 flex gap-3 overflow-x-auto pb-1">{images.map((image, index) => <button type="button" key={`${image.publicId || image.url}-${index}`} onClick={() => setSelectedIndex(index)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${selectedIndex === index ? 'border-blue-600' : 'border-transparent hover:border-slate-300'}`} aria-label={t('artworks.viewImage', { index: index + 1 })}><img src={image.secureUrl || image.url} alt="" className="h-full w-full object-cover" /></button>)}</div>}
          </div>

          <article className="lg:sticky lg:top-24">
            <div className="flex flex-wrap gap-2">{artwork.tags.map((tag) => <span key={tag.id} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"><Tag className="h-3 w-3" />{tag.name}</span>)}</div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{artwork.title}</h1>
            {artwork.materials && <p className="mt-3 text-base text-slate-600">{artwork.materials}</p>}
            {dimensions && <p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><Ruler className="h-4 w-4" aria-hidden="true" />{dimensions}</p>}
            {weight && <p className="mt-1 text-sm text-slate-600">{t('artworks.weight', { weight })}</p>}
            <div className="mt-7 border-y border-slate-200 py-5">
              <p className="text-2xl font-bold text-slate-950">
                {formatArtworkPrice(artwork.price, artwork.currency, language === 'en' ? 'en-US' : 'vi-VN', t('artworks.priceOnRequest'))}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2" aria-label={t('artworks.actionsLabel')}>
                <button type="button" onClick={handleFavorite} className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${isFavorited ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`} aria-label={t(isFavorited ? 'artworks.unfavorite' : 'artworks.favorite')}>
                  <Heart className="h-5 w-5" fill={isFavorited ? 'currentColor' : 'none'} />
                </button>
                <button type="button" onClick={() => toast(t('artworks.commentComingSoon'))} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:bg-slate-50" aria-label={t('artworks.comment')}>
                  <MessageCircle className="h-5 w-5" />
                </button>
                <button type="button" onClick={handleAddToCart} disabled={isInCart} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-blue-600 px-4 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-default disabled:border-emerald-600 disabled:text-emerald-700">
                  <ShoppingCart className="h-4 w-4" />
                  {t(isInCart ? 'artworks.addedToCart' : 'artworks.addToCart')}
                </button>
                <button type="button" onClick={handleBuyNow} className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:flex-none">
                  {t('artworks.buyNow')}
                </button>
              </div>
              <p className="mt-3 text-sm text-slate-500">{t('artworks.contactArtist')}</p>
            </div>
            {artwork.description && <div className="mt-7"><h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900">{t('artworks.aboutArtwork')}</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{artwork.description}</p></div>}
          </article>
        </div>
      </div>

      {isLightboxOpen && currentImage && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-4" role="dialog" aria-modal="true" aria-label={t('artworks.lightboxLabel', { title: artwork.title })} onClick={() => setIsLightboxOpen(false)}><button type="button" className="absolute right-4 top-4 rounded-full p-2 text-white transition hover:bg-white/10" aria-label={t('artworks.close')} onClick={() => setIsLightboxOpen(false)}><X className="h-6 w-6" /></button>{images.length > 1 && <button type="button" onClick={(event) => { event.stopPropagation(); selectRelativeImage(-1); }} className="absolute left-3 rounded-full p-3 text-white transition hover:bg-white/10 sm:left-6" aria-label={t('artworks.previousImage')}><ChevronLeft className="h-7 w-7" /></button>}<img src={currentImage.secureUrl || currentImage.url} alt={currentImage.altText || currentImage.alt || artwork.title} className="max-h-[85vh] max-w-[85vw] object-contain" onClick={(event) => event.stopPropagation()} />{images.length > 1 && <button type="button" onClick={(event) => { event.stopPropagation(); selectRelativeImage(1); }} className="absolute right-3 rounded-full p-3 text-white transition hover:bg-white/10 sm:right-6" aria-label={t('artworks.nextImage')}><ChevronRight className="h-7 w-7" /></button>}</div>}
    </div>
  );
}
