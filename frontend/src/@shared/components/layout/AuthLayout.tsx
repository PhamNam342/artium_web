import type { ReactNode } from 'react'

import { SiteHeader } from '@shared/components/layout/SiteHeader'

interface AuthLayoutProps {
  children: ReactNode
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-transparent text-slate-900">
      <SiteHeader />
      <main className="w-full flex-1">{children}</main>
    </div>
  )
}
