import { ArrowRight, Palette, Sparkles, UsersRound } from 'lucide-react'
import { MarketingLayout } from '@shared/components/layout/MarketingLayout'

const highlights = [
  {
    icon: Palette,
    title: 'Show your work',
    description: 'Build a striking home for your art, collections, and creative practice.',
  },
  {
    icon: UsersRound,
    title: 'Grow your audience',
    description: 'Connect with collectors, collaborators, and the wider art community.',
  },
  {
    icon: Sparkles,
    title: 'Work your way',
    description: 'Organise inventory and opportunities in one thoughtfully designed workspace.',
  },
]

function App() {
  return (
    <MarketingLayout>
      <section className="grid min-h-[calc(100vh-5rem)] items-center gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
        <div>
          <p className="mb-5 text-sm font-semibold tracking-[0.18em] text-indigo-600 uppercase">Built for artists</p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-7xl">
            Make more room for your art.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
            Artium brings your portfolio, community, and business tools into one beautiful space.
          </p>
          <a
            href="#discover"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Explore Artium
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="aspect-square rounded-[2rem] bg-linear-to-br from-indigo-200 via-violet-100 to-orange-100 p-5 shadow-2xl shadow-indigo-200/40 sm:p-8">
          <div className="flex h-full flex-col justify-between rounded-[1.5rem] border border-white/70 bg-white/65 p-7 backdrop-blur sm:p-10">
            <p className="text-sm font-medium text-slate-600">Creative workspace</p>
            <p className="max-w-sm text-4xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-5xl">Your practice, beautifully organised.</p>
            <div className="h-1.5 w-24 rounded-full bg-slate-950" />
          </div>
        </div>
      </section>

      <section id="discover" className="border-y border-slate-200 py-20">
        <div className="grid gap-7 md:grid-cols-3">
          {highlights.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-2xl bg-slate-50 p-7">
              <Icon className="h-6 w-6 text-indigo-600" />
              <h2 className="mt-8 text-xl font-semibold tracking-[-0.03em] text-slate-950">{title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </MarketingLayout>
  )
}

export default App
