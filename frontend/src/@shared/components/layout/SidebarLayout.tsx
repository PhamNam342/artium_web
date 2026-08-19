import type { ReactNode } from 'react'
import { SideBar } from '@shared/components/display/SideBar'
import { AppLayout } from '@shared/components/layout/AppLayout'

interface SidebarLayoutProps {
  children: ReactNode
}

export const SidebarLayout = ({ children }: SidebarLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <SideBar />
      <div className="lg:pl-75">
        <AppLayout>{children}</AppLayout>
      </div>
    </div>
  )
}
