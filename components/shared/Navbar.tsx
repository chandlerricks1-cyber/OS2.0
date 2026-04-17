'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NavbarProps {
  user: {
    email: string
    full_name: string | null
    avatar_url?: string | null
  } | null
  onMenuClick?: () => void
}

export function Navbar({ user, onMenuClick }: NavbarProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="border-b border-brand-cream-100 bg-brand-cream px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-brand-dark/70 hover:bg-brand-cream-100 transition-colors -ml-1"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link
          href="/settings"
          className="flex items-center gap-2 text-sm font-medium text-brand-dark/60 hover:text-brand-dark transition-colors truncate"
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
          ) : null}
          {user?.full_name ?? user?.email ?? 'Account'}
        </Link>
      </div>
      <button
        onClick={handleSignOut}
        className="text-sm text-brand-dark/40 hover:text-brand-dark transition-colors font-medium shrink-0"
      >
        Sign out
      </button>
    </header>
  )
}
