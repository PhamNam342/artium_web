import { ArrowUp, Globe, MessageCircle, Music2 } from 'lucide-react'
import { useEffect, useState } from 'react'

const footerGroups = [
  { title: 'Company', links: ['Pricing', 'About us', 'Contact us', 'Editorial'] },
  {
    title: 'Join the Community',
    links: ['Onboarding Guide', 'For Artists', 'For Galleries', 'Why Artium for Artists'],
  },
  { title: 'Policy & Guidelines', links: ['FAQs', 'Community Guidelines', 'Terms of Service', 'Privacy Policy'] },
]

const socialIcons = [Globe, Music2, MessageCircle]

export const SiteFooter = () => {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 240)

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <footer className="relative mt-20 overflow-hidden bg-slate-950 text-white">
      <div className="mx-auto grid w-full max-w-360 gap-14 px-6 py-16 sm:px-8 lg:grid-cols-[1fr_20rem] lg:px-12">
        <div className="grid gap-10 sm:grid-cols-3">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="mb-5 text-sm font-semibold">{group.title}</h2>
              <ul className="space-y-3 text-sm text-white/65">
                {group.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="transition hover:text-white">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-white/50 uppercase">Stay in touch</p>
          <div className="mt-4 flex gap-3">
            {socialIcons.map((Icon, index) => (
              <a
                key={index}
                href="#"
                aria-label="Social media"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-950 transition hover:scale-105"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          <p className="mt-9 text-xs font-semibold tracking-[0.16em] text-white/50 uppercase">Subscribe to our newsletter</p>
          <form className="mt-4 flex gap-2" onSubmit={(event) => event.preventDefault()}>
            <label className="sr-only" htmlFor="newsletter-email">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="Email address"
              className="min-w-0 flex-1 border-b border-white/30 bg-transparent px-0 py-2 text-sm outline-none placeholder:text-white/40 focus:border-white"
            />
            <button type="submit" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-6 text-center text-xs text-white/50 sm:px-8 lg:px-12">
        © 2026 Artium. All rights reserved.
      </div>

      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed right-6 bottom-6 inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition ${
          showBackToTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
        }`}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </footer>
  )
}
