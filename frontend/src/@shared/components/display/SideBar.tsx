import {
  CalendarDays,
  FolderKanban,
  House,
  Image,
  Mail,
  Menu,
  MessageCircle,
  Settings,
  UserRound,
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { href: '#home', label: 'Home', icon: House },
  { href: '#profile', label: 'Profile', icon: UserRound },
  { href: '#messages', label: 'Messages', icon: MessageCircle },
  { href: '#portfolio', label: 'Portfolio', icon: FolderKanban },
  { href: '#inventory', label: 'Inventory', icon: Image },
  { href: '#events', label: 'Events', icon: CalendarDays },
  { href: '#marketing', label: 'Marketing Email', icon: Mail },
]

export const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        aria-label="Toggle sidebar"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="fixed top-5 left-5 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[300px] flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <a href="/" className="border-b border-slate-200 px-7 py-7 text-xl font-semibold tracking-[-0.08em] text-slate-950">
          ARTIUM
        </a>
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6" aria-label="Dashboard navigation">
          {navigation.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <Icon className="h-5 w-5" />
              {label}
            </a>
          ))}
        </nav>
        <a href="#settings" className="m-4 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
          <Settings className="h-5 w-5" />
          Settings
        </a>
      </aside>
    </>
  )
}
