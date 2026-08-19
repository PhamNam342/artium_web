import { Menu, Plus, Search, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const navigation = [
  { href: '#discover', label: 'Discover' },
  { href: '#editorial', label: 'Editorial' },
  { href: '#pricing', label: 'Pricing' },
]

type SiteHeaderProps = {
  variant?: 'default' | 'landing'
}

export const SiteHeader = ({ variant = 'default' }: SiteHeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isLanding = variant === 'landing'

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16)

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const headerClassName = isLanding && !isScrolled
    ? 'border-transparent bg-transparent text-white'
    : 'border-slate-200 bg-white/95 text-slate-950 shadow-sm backdrop-blur'

  return (
    <header className={`sticky top-0 z-50 border-b transition-colors duration-300 ${headerClassName}`}>
      <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between gap-5 px-6 sm:px-8 lg:px-12">
        <a href="/" className="text-xl font-semibold tracking-[-0.08em]" aria-label="Artium home">
          ARTIUM
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {navigation.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-medium transition hover:opacity-60">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            aria-label="Search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100"
          >
            <Search className="h-5 w-5" />
          </button>
          <a
            href="#signin"
            className="inline-flex items-center gap-2 rounded-full border border-current px-4 py-2 text-sm font-medium transition hover:bg-slate-950 hover:text-white"
          >
            <UserRound className="h-4 w-4" />
            Sign in
          </a>
          <a
            href="#create"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" />
            Create
          </a>
        </div>

        <button
          type="button"
          aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100 md:hidden"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen ? (
        <nav className="border-t border-slate-200 bg-white px-6 py-5 md:hidden" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-4">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-base font-medium text-slate-950"
              >
                {item.label}
              </a>
            ))}
            <a href="#signin" className="pt-2 text-sm font-medium text-slate-600">
              Sign in
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  )
}
