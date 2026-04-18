'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/shared/Sidebar'
import { Navbar } from '@/components/shared/Navbar'

interface AppShellProps {
  user: { email: string; full_name: string | null; avatar_url?: string | null; role?: string } | null
  children: React.ReactNode
}

export function AppShell({ user, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-brand-cream md:flex">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} role={user?.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
