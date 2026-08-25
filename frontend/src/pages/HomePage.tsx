import { ArrowRight, ArrowUpRight, Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const artworkImages = [
  { title: 'Amber Horizon', artist: 'Amelia Stone', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=700&q=85' },
  { title: 'Tidal Memory', artist: 'Minh Nguyen', image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=700&q=85' },
  { title: 'Garden After Rain', artist: 'Amelia Stone', image: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?auto=format&fit=crop&w=700&q=85' },
  { title: 'Violet Noon', artist: 'Amelia Stone', image: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=700&q=85' },
  { title: 'Red Thread', artist: 'Amelia Stone', image: 'https://images.unsplash.com/photo-1541961017774-1fb6e03b2f9d?auto=format&fit=crop&w=700&q=85' },
  { title: 'Saigon Windows', artist: 'Linh Tran', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=700&q=85' },
  { title: 'Indigo Current', artist: 'An Pham', image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=700&q=85' },
];

const stories = [
  { quote: 'As an international artist showcasing at Superfine Art Fair, Artium made the process feel seamless and transparent.', name: 'Anchan Kunakorn', role: 'Artist, Chiang Mai', color: 'bg-[#eef53f]' },
  { quote: 'Working with Artium was wonderful. They were very helpful at each step, and their care in supporting artists is unmistakable.', name: 'Vincenzo Cestari', role: 'Painter, Italy', color: 'bg-[#f8c5c9]' },
  { quote: 'The platform brings thoughtful work together and makes it simple to discover artists I would not otherwise have met.', name: 'Tammy Lee', role: 'Collector, Singapore', color: 'bg-[#ff8055]' },
  { quote: 'A clear, friendly place to show work and develop meaningful connections with people who love art.', name: 'Buuan Washington', role: 'Artist, New York', color: 'bg-[#f6d966]' },
];

const stageCards = [
  { title: 'For Artists', description: 'Show your work, manage sales, and grow your audience.', image: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=900&q=85' },
  { title: 'For Collectors', description: 'Discover original work and follow artists you love.', image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=900&q=85' },
];

function ArtworkRail() {
  return (
    <div className="relative mt-10 overflow-hidden py-2 sm:mt-14">
      <div className="flex min-w-max gap-2 px-3 sm:gap-3">
        {artworkImages.concat(artworkImages).map((artwork, index) => (
          <article className="group relative h-44 w-28 overflow-hidden rounded-md bg-neutral-800 sm:h-56 sm:w-40" key={`${artwork.title}-${index}`}>
            <img alt={artwork.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={artwork.image} />
            {index % 4 === 0 && <div className="absolute inset-x-0 top-0 bg-[#f5b4c2] p-2 text-[9px] font-bold text-black sm:p-3 sm:text-xs">8,000+<span className="block text-[7px] font-medium sm:text-[9px]">Active Collectors</span></div>}
            {index % 5 === 2 && <div className="absolute inset-x-0 bottom-0 bg-[#2fc9ed] p-2 text-[9px] font-bold text-black sm:p-3 sm:text-xs">6,000+<span className="block text-[7px] font-medium sm:text-[9px]">in Artwork Sold</span></div>}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pb-2 pt-8 text-[8px] text-white opacity-0 transition group-hover:opacity-100 sm:text-[10px]"><p className="font-semibold">{artwork.title}</p><p className="text-white/70">{artwork.artist}</p></div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="overflow-hidden bg-black pb-12 pt-12 text-white sm:pb-20 sm:pt-20">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-80 opacity-50 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,.75)_1px,transparent_1px)] [background-size:52px_52px]" />
        <div className="relative grid gap-10 pt-5 lg:grid-cols-[1.15fr_.75fr] lg:items-end lg:gap-20">
          <h1 className="max-w-3xl text-5xl font-semibold leading-[.94] tracking-[-0.075em] sm:text-7xl md:text-8xl lg:text-[90px]">Discover art.<br />Manage your<br />business.<br />All in one platform.</h1>
          <div className="max-w-sm pb-2 lg:pb-4"><p className="text-sm leading-6 text-white/65 sm:text-base">Connect with collectors through AI-powered discovery while running your gallery or art studio with professional tools for inventory, payments, website hosting, email, and client management.</p><Link className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/80" to="/artworks">Get started <ArrowUpRight className="h-4 w-4" /></Link></div>
        </div>
      </div>
      <ArtworkRail />
      <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-lg px-5 sm:mt-16"><img alt="Artist working in a gallery" className="aspect-[1.35] w-full object-cover" src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1500&q=85" /></div>
    </section>
  );
}

function ToolsSection() {
  return (
    <section className="bg-[linear-gradient(116deg,#e8b7f5_0%,#f1d2fb_45%,#b8d5fa_100%)] px-5 py-16 text-black sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl"><div className="mx-auto max-w-xl text-center"><p className="text-4xl font-semibold leading-none tracking-[-0.06em] sm:text-6xl">The Only Art<br />Tools You'll Need</p><p className="mx-auto mt-5 max-w-md text-sm leading-6 text-black/65">You don't have to do it alone — we help you showcase, sell, and grow your audience effortlessly.</p></div>
        <div className="mt-12 grid overflow-hidden rounded-xl bg-white/65 shadow-[0_25px_75px_rgba(42,32,85,.18)] md:grid-cols-2"><div className="p-8 sm:p-12"><span className="text-sm font-medium text-black/60">Portfolio</span><p className="mt-2 max-w-sm text-xl font-semibold leading-tight sm:text-2xl">Create a professional portfolio, display your artworks for sale, and collect subscribers for your newsletter.</p><ul className="mt-7 space-y-4 text-sm font-semibold sm:text-base">{['Send Newsletters', 'Sell Anywhere'].map((item) => <li className="flex items-center gap-2" key={item}><Check className="h-4 w-4" /> {item}</li>)}</ul><Link className="mt-8 inline-flex rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black/75" to="/pricing">Sign Up</Link></div><img alt="Artium portfolio workspace" className="h-full min-h-64 w-full object-cover" src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1100&q=85" /></div>
      </div>
    </section>
  );
}

function DesignedForEveryStage() {
  return (
    <section className="bg-black px-5 py-20 text-white sm:px-8 sm:py-28"><div className="mx-auto max-w-5xl text-center"><h2 className="text-4xl font-semibold leading-[.9] tracking-[-0.065em] sm:text-6xl">Designed for Every<br />Stage of the Art Journey</h2><p className="mx-auto mt-5 max-w-md text-sm leading-6 text-white/60">No matter your role in the art world, Artium brings everyone into one seamless platform.</p><div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">{stageCards.map((card) => <article className="overflow-hidden rounded-xl bg-white p-2 text-left text-black" key={card.title}><img alt="" className="h-48 w-full rounded-lg object-cover sm:h-56" src={card.image} /><div className="flex items-center justify-between gap-4 px-2 pb-2 pt-4"><div><h3 className="font-semibold">{card.title}</h3><p className="mt-1 text-xs text-black/55">{card.description}</p></div><Link aria-label={`Learn more for ${card.title}`} className="shrink-0 rounded-full bg-blue-600 p-2 text-white transition hover:bg-blue-500" to="/artworks"><ArrowRight className="h-4 w-4" /></Link></div></article>)}</div></div></section>
  );
}

function CommunityStories() {
  return (
    <section className="overflow-hidden bg-black pb-24 pt-8 text-white sm:pb-32"><div className="mx-auto max-w-4xl px-5 text-center sm:px-8"><h2 className="text-4xl font-semibold leading-[.95] tracking-[-0.065em] sm:text-6xl">Meet the Community Using<br />Artium to Scale Their Success</h2></div><div className="mt-12 flex w-max gap-3 px-4 sm:mt-16 sm:gap-4">{stories.concat(stories).map((story, index) => <article className={`${story.color} flex h-64 w-52 flex-col justify-between rounded-lg p-4 text-left text-black sm:h-72 sm:w-60 sm:p-5`} key={`${story.name}-${index}`}><p className="text-xs font-medium leading-[1.35] sm:text-sm">“{story.quote}”</p><div><div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/15 text-xs font-bold">{story.name[0]}</div><p className="text-xs font-bold">{story.name}</p><p className="mt-0.5 text-[10px] text-black/60">{story.role}</p></div></article>)}</div></section>
  );
}

function ClosingCta() {
  return (
    <section className="bg-black px-5 pb-24 text-center text-white sm:pb-32"><Sparkles className="mx-auto h-5 w-5 text-white/35" /><p className="mt-8 text-3xl font-medium tracking-[-0.055em] text-white/40 sm:text-5xl">The art world's future is creator-first</p><p className="mt-1 text-3xl font-semibold tracking-[-0.055em] sm:text-5xl">The future is Artium</p><Link className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold transition hover:bg-blue-500" to="/artworks">Get Started <ArrowRight className="h-4 w-4" /></Link></section>
  );
}

export default function HomePage() {
  return <div className="bg-black"><Hero /><ToolsSection /><DesignedForEveryStage /><CommunityStories /><ClosingCta /></div>;
}
