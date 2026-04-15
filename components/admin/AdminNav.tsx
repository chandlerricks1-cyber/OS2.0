'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

const navLinks = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/podcast', label: 'Podcast Leads' },
  { href: '/admin/clients', label: 'Clients' },
  { href: '/admin/integrations', label: 'Integrations' },
]

export function AdminNav({ name }: { name: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="border-b bg-white px-4 sm:px-6 py-3 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
          <span className="font-bold text-base sm:text-lg text-gray-900 shrink-0">Crucible Admin</span>
          <nav className="flex items-center gap-1 overflow-x-auto -mx-1 px-1 scrollbar-none">
            {navLinks.map((link) => {
              const isActive = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href)
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-brand-gradient-end/10 text-brand-gradient-end font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </a>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden sm:block">{name}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}
