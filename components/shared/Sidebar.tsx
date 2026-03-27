'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/shared/Logo'

const navItems = [
  {
    href: '/intake',
    label: 'Intake',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M14 2H2C1.45 2 1 2.45 1 3v8c0 .55.45 1 1 1h4l2 2 2-2h4c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/>
        <path d="M4 6h8M4 9h5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="8" width="4" height="7" rx="1" stroke="currentColor" strokeWidth="1.25"/>
        <rect x="6" y="4" width="4" height="11" rx="1" stroke="currentColor" strokeWidth="1.25"/>
        <rect x="11" y="1" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.25"/>
      </svg>
    ),
  },
  {
    href: '/upgrade',
    label: 'Upgrade',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1L10.5 6H15L11 9.5L12.5 15L8 12L3.5 15L5 9.5L1 6H5.5L8 1Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-brand-dark flex flex-col">
      <div className="px-4 py-5 border-b border-white/10">
        <Logo iconSize={24} textColor="text-white" textSize="base" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/50 hover:bg-white/8 hover:text-white/80'
              }`}
            >
              {isActive && (
                <span className="absolute left-3 w-0.5 h-5 bg-brand-orange rounded-full" />
              )}
              <span className={isActive ? 'text-brand-orange' : ''}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-xs text-white/25 font-medium tracking-wide uppercase">Crucible OS</p>
      </div>
    </aside>
  )
}
