import type { ReactNode } from 'react'
import { SiteFooter } from '@shared/components/layout/SiteFooter'
import { SiteHeader } from '@shared/components/layout/SiteHeader'

interface AppLayoutProps {
  children: ReactNode
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="w-full flex-1">
        <div className="w-full px-6 py-4 sm:px-8 lg:px-12">{children}</div>
      </main>
      <SiteFooter />
    </div>
  )
}
