import { ArrowRight, ArrowUpRight, Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';

const artworkImages = [
  { title: 'Amber Horizon', artist: 'Amelia Stone', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=700&q=85' },
  { title: 'Tidal Memory', artist: 'Minh Nguyen', image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=700&q=85' },
  { title: 'Garden After Rain', artist: 'Amelia Stone', image: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?auto=format&fit=crop&w=700&q=85' },
  { title: 'Violet Noon', artist: 'Amelia Stone', image: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=700&q=85' },
  { title: 'Red Thread', artist: 'Amelia Stone', image: 'https://images.unsplash.com/photo-1541961017774-1fb6e03b2f9d?auto=format&fit=crop&w=700&q=85' },
  { title: 'Saigon Windows', artist: 'Linh Tran', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=700&q=85' },
  { title: 'Indigo Current', artist: 'An Pham', image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=700&q=85' },
];

function ArtworkRail() {
  const { t } = useI18n();
  return (
    <div className="relative mt-10 overflow-hidden py-2 sm:mt-14">
      <div className="flex min-w-max gap-2 px-3 sm:gap-3">
        {artworkImages.concat(artworkImages).map((artwork, index) => (
          <article className="group relative h-44 w-28 overflow-hidden rounded-md bg-neutral-800 sm:h-56 sm:w-40" key={`${artwork.title}-${index}`}>
            <img alt={artwork.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={artwork.image} />
            {index % 4 === 0 && <div className="absolute inset-x-0 top-0 bg-[#f5b4c2] p-2 text-[9px] font-bold text-black sm:p-3 sm:text-xs">8,000+<span className="block text-[7px] font-medium sm:text-[9px]">{t('home.stats.collectors')}</span></div>}
            {index % 5 === 2 && <div className="absolute inset-x-0 bottom-0 bg-[#2fc9ed] p-2 text-[9px] font-bold text-black sm:p-3 sm:text-xs">6,000+<span className="block text-[7px] font-medium sm:text-[9px]">{t('home.stats.artworksSold')}</span></div>}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pb-2 pt-8 text-[8px] text-white opacity-0 transition group-hover:opacity-100 sm:text-[10px]"><p className="font-semibold">{artwork.title}</p><p className="text-white/70">{artwork.artist}</p></div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  const { t } = useI18n();
  return (
    <section className="overflow-hidden bg-black pb-12 pt-12 text-white sm:pb-20 sm:pt-20">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-80 opacity-50 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,.75)_1px,transparent_1px)] [background-size:52px_52px]" />
        <div className="relative grid gap-10 pt-5 lg:grid-cols-[1.15fr_.75fr] lg:items-end lg:gap-20">
          <h1 className="max-w-3xl text-5xl font-semibold leading-[.94] tracking-[-0.075em] sm:text-7xl md:text-8xl lg:text-[90px]">{t('home.hero.titleLine1')}<br />{t('home.hero.titleLine2')}<br />{t('home.hero.titleLine3')}<br />{t('home.hero.titleLine4')}</h1>
          <div className="max-w-sm pb-2 lg:pb-4"><p className="text-sm leading-6 text-white/65 sm:text-base">{t('home.hero.description')}</p><Link className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/80" to="/artworks">{t('home.hero.button')} <ArrowUpRight className="h-4 w-4" /></Link></div>
        </div>
      </div>
      <ArtworkRail />
      <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-lg px-5 sm:mt-16"><img alt="Artist working in a gallery" className="aspect-[1.35] w-full object-cover" src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1500&q=85" /></div>
    </section>
  );
}

function ToolsSection() {
  const { t } = useI18n();
  return (
    <section className="bg-[linear-gradient(116deg,#e8b7f5_0%,#f1d2fb_45%,#b8d5fa_100%)] px-5 py-16 text-black sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl"><div className="mx-auto max-w-xl text-center"><p className="text-4xl font-semibold leading-none tracking-[-0.06em] sm:text-6xl">{t('home.tools.titleLine1')}<br />{t('home.tools.titleLine2')}</p><p className="mx-auto mt-5 max-w-md text-sm leading-6 text-black/65">{t('home.tools.description')}</p></div>
        <div className="mt-12 grid overflow-hidden rounded-xl bg-white/65 shadow-[0_25px_75px_rgba(42,32,85,.18)] md:grid-cols-2"><div className="p-8 sm:p-12"><span className="text-sm font-medium text-black/60">{t('home.tools.portfolioLabel')}</span><p className="mt-2 max-w-sm text-xl font-semibold leading-tight sm:text-2xl">{t('home.tools.portfolioDescription')}</p><ul className="mt-7 space-y-4 text-sm font-semibold sm:text-base">{[t('home.tools.featureNewsletter'), t('home.tools.featureSell')].map((item) => <li className="flex items-center gap-2" key={item}><Check className="h-4 w-4" /> {item}</li>)}</ul><Link className="mt-8 inline-flex rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black/75" to="/pricing">{t('home.tools.button')}</Link></div><img alt={t('home.tools.portfolioAlt')} className="h-full min-h-64 w-full object-cover" src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1100&q=85" /></div>
      </div>
    </section>
  );
}

function DesignedForEveryStage() {
  const { t } = useI18n();
  const stageCards = [
    { title: t('home.stage.artists.title'), description: t('home.stage.artists.description'), image: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=900&q=85' },
    { title: t('home.stage.collectors.title'), description: t('home.stage.collectors.description'), image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=900&q=85' },
  ];
  return (
    <section className="bg-black px-5 py-20 text-white sm:px-8 sm:py-28"><div className="mx-auto max-w-5xl text-center"><h2 className="text-4xl font-semibold leading-[.9] tracking-[-0.065em] sm:text-6xl">{t('home.stage.titleLine1')}<br />{t('home.stage.titleLine2')}</h2><p className="mx-auto mt-5 max-w-md text-sm leading-6 text-white/60">{t('home.stage.description')}</p><div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">{stageCards.map((card) => <article className="overflow-hidden rounded-xl bg-white p-2 text-left text-black" key={card.title}><img alt="" className="h-48 w-full rounded-lg object-cover sm:h-56" src={card.image} /><div className="flex items-center justify-between gap-4 px-2 pb-2 pt-4"><div><h3 className="font-semibold">{card.title}</h3><p className="mt-1 text-xs text-black/55">{card.description}</p></div><Link aria-label={t('home.stage.learnMore', { audience: card.title })} className="shrink-0 rounded-full bg-blue-600 p-2 text-white transition hover:bg-blue-500" to="/artworks"><ArrowRight className="h-4 w-4" /></Link></div></article>)}</div></div></section>
  );
}

function CommunityStories() {
  const { t } = useI18n();
  const stories = [
    { quote: t('home.stories.items.0.quote'), name: 'Anchan Kunakorn', role: t('home.stories.items.0.role'), color: 'bg-[#eef53f]' },
    { quote: t('home.stories.items.1.quote'), name: 'Vincenzo Cestari', role: t('home.stories.items.1.role'), color: 'bg-[#f8c5c9]' },
    { quote: t('home.stories.items.2.quote'), name: 'Tammy Lee', role: t('home.stories.items.2.role'), color: 'bg-[#ff8055]' },
    { quote: t('home.stories.items.3.quote'), name: 'Buuan Washington', role: t('home.stories.items.3.role'), color: 'bg-[#f6d966]' },
  ];
  return (
    <section className="overflow-hidden bg-black pb-24 pt-8 text-white sm:pb-32"><div className="mx-auto max-w-4xl px-5 text-center sm:px-8"><h2 className="text-4xl font-semibold leading-[.95] tracking-[-0.065em] sm:text-6xl">{t('home.stories.titleLine1')}<br />{t('home.stories.titleLine2')}</h2></div><div className="mt-12 flex w-max gap-3 px-4 sm:mt-16 sm:gap-4">{stories.concat(stories).map((story, index) => <article className={`${story.color} flex h-64 w-52 flex-col justify-between rounded-lg p-4 text-left text-black sm:h-72 sm:w-60 sm:p-5`} key={`${story.name}-${index}`}><p className="text-xs font-medium leading-[1.35] sm:text-sm">“{story.quote}”</p><div><div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/15 text-xs font-bold">{story.name[0]}</div><p className="text-xs font-bold">{story.name}</p><p className="mt-0.5 text-[10px] text-black/60">{story.role}</p></div></article>)}</div></section>
  );
}

function ClosingCta() {
  const { t } = useI18n();
  return (
    <section className="bg-black px-5 pb-24 text-center text-white sm:pb-32"><Sparkles className="mx-auto h-5 w-5 text-white/35" /><p className="mt-8 text-3xl font-medium tracking-[-0.055em] text-white/40 sm:text-5xl">{t('home.closing.line1')}</p><p className="mt-1 text-3xl font-semibold tracking-[-0.055em] sm:text-5xl">{t('home.closing.line2')}</p><Link className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold transition hover:bg-blue-500" to="/artworks">{t('home.closing.button')} <ArrowRight className="h-4 w-4" /></Link></section>
  );
}

export default function HomePage() {
  return <div className="bg-black"><Hero /><ToolsSection /><DesignedForEveryStage /><CommunityStories /><ClosingCta /></div>;
}
