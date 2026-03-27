'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface NavbarProps {
  user: {
    email: string
    full_name: string | null
  } | null
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="border-b border-brand-cream-100 bg-brand-cream px-6 py-3 flex items-center justify-between">
      <div className="text-sm font-medium text-brand-dark/60">
        {user?.full_name ?? user?.email ?? 'Account'}
      </div>
      <button
        onClick={handleSignOut}
        className="text-sm text-brand-dark/40 hover:text-brand-dark transition-colors font-medium"
      >
        Sign out
      </button>
    </header>
  )
}
