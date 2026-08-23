import {
  Store,
  Image as ImageIcon,
  Search,
  Sparkles,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const painPoints = [
  {
    icon: Store,
    bg: 'bg-[#F2F04C]',
    label: '84% of artists lack gallery representation',
  },
  {
    icon: ImageIcon,
    bg: 'bg-[#E3B8F0]',
    label: 'Traditional platforms take 40-70% of sales',
  },
  {
    icon: Search,
    bg: 'bg-[#F0A968]',
    label: 'Online art discovery is broken',
  },
  {
    icon: Sparkles,
    bg: 'bg-[#8FC6F0]',
    label: 'There is no online hub for collectors',
  },
];

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

function Hero() {
  return (
    <section className="relative overflow-hidden bg-neutral-900">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/hero-art.jpg"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/90" />

      <div className="relative flex min-h-[560px] flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          Artium connects
          <br />
          the art world
        </h1>

        <p className="mt-6 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
          Discover artists, explore artworks, and build meaningful
          connections within a modern art community.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <a
            href="/artworks"
            className="rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Discover artworks
          </a>

          <a
            href="/register"
            className="rounded-full border border-white/30 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            Get started
          </a>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Why We Exist
// ---------------------------------------------------------------------------

function WhyWeExist() {
  return (
    <section className="bg-neutral-950 px-6 py-20 md:px-10">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Why we exist
          </h2>

          <p className="mt-3 text-lg font-medium text-white/90">
            Our mission is simple but profound
          </p>

          <p className="mt-4 max-w-md text-sm leading-7 text-white/60">
            Artists deserve a better place to showcase their work,
            connect with collectors, and build their own presence online.
            Artium is designed to make that possible.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {painPoints.map(({ icon: Icon, bg, label }) => (
            <div
              key={label}
              className={`${bg} flex aspect-square flex-col justify-between rounded-2xl p-4 text-neutral-900 sm:p-5`}
            >
              <Icon
                className="h-5 w-5"
                strokeWidth={2}
              />

              <p className="text-sm font-semibold leading-snug sm:text-base">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Community
// ---------------------------------------------------------------------------

function CommunitySection() {
  return (
    <section className="bg-white px-6 py-24 md:px-10">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          A community built around art
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
          Artium brings artists, collectors, and art lovers together
          in one place. Discover new work, follow artists you love,
          and explore the stories behind every creation.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
            <h3 className="text-lg font-semibold text-neutral-900">
              Discover
            </h3>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Explore artworks and discover emerging artists.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
            <h3 className="text-lg font-semibold text-neutral-900">
              Connect
            </h3>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Follow artists and become part of the community.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
            <h3 className="text-lg font-semibold text-neutral-900">
              Collect
            </h3>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Find artworks that are meaningful to you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// CTA
// ---------------------------------------------------------------------------

function ClosingCTA() {
  return (
    <section className="bg-white px-6 pb-28 pt-8 text-center md:px-10">
      <p className="text-2xl font-semibold text-neutral-300 sm:text-3xl">
        The future of art is creator-first
      </p>

      <p className="mt-1 text-2xl font-bold text-neutral-900 sm:text-3xl">
        The future is Artium
      </p>

      <a
        href="/register"
        className="mt-8 inline-flex rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Get started
      </a>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />

      <WhyWeExist />

      <CommunitySection />

      <ClosingCTA />
    </div>
  );
}
