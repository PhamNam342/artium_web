import type { ReactNode } from 'react'
import { SiteFooter } from '@shared/components/layout/SiteFooter'
import { SiteHeader } from '@shared/components/layout/SiteHeader'

interface MarketingLayoutProps {
  children: ReactNode
  preFooter?: ReactNode
}

export const MarketingLayout = ({ children, preFooter }: MarketingLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <SiteHeader />
      <main className="w-full flex-1">
        <div className="mx-auto w-full max-w-480 px-6 sm:px-8 lg:px-12">{children}</div>
      </main>
      {preFooter}
      <SiteFooter />
    </div>
  )
}
