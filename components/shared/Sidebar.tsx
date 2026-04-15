'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, LayoutGrid, Flame } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed'

const navItems = [
  {
    href: '/intake',
    label: 'Intake',
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
        <path d="M14 2H2C1.45 2 1 2.45 1 3v8c0 .55.45 1 1 1h4l2 2 2-2h4c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        <path d="M4 6h8M4 9h5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="8" width="4" height="7" rx="1" stroke="currentColor" strokeWidth="1.25" />
        <rect x="6" y="4" width="4" height="11" rx="1" stroke="currentColor" strokeWidth="1.25" />
        <rect x="11" y="1" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    ),
  },
  {
    href: '/dashboard/money-model',
    label: 'Money Model',
    icon: <LayoutGrid className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  },
  {
    href: '/dashboard/crucible-pro',
    label: 'Crucible Pro',
    icon: <Flame className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  },
  {
    href: '/upgrade',
    label: 'Book a Call',
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="3" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
        <path d="M1 6.5h14" stroke="currentColor" strokeWidth="1.25" />
        <path d="M4.5 1v4M11.5 1v4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    ),
  },
]

function isActivePath(pathname: string, href: string) {
  // Exact match for any route, OR subroute with trailing slash.
  // Special case: /dashboard should NOT light up when on /dashboard/money-model.
  if (pathname === href) return true
  if (href === '/dashboard') return false
  return pathname.startsWith(href + '/')
}

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebarCollapsed()

  return (
    <aside
      className={`bg-brand-dark flex flex-col transition-[width] duration-200 ${
        collapsed ? 'w-20' : 'w-56'
      }`}
    >
      <div
        className={`relative border-b border-white/10 flex items-center justify-center ${
          collapsed ? 'py-4 px-2' : 'py-5 px-4'
        }`}
      >
        <button
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute top-2 right-2 w-6 h-6 rounded-md bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
        {collapsed ? (
          <Logo height={40} variant="icon" />
        ) : (
          <Logo height={90} variant="light" />
        )}
      </div>

      <nav className={`flex-1 py-4 space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
        {navItems.map((item) => {
          const isActive = isActivePath(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`relative flex items-center rounded-lg text-sm font-medium transition-all ${
                collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/50 hover:bg-white/8 hover:text-white/80'
              }`}
            >
              {isActive && !collapsed && (
                <span className="absolute left-0 w-0.5 h-5 bg-brand-orange rounded-full" />
              )}
              <span className={isActive ? 'text-brand-orange' : ''}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {!collapsed && (
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-xs text-white/25 font-medium tracking-wide uppercase">Crucible OS</p>
        </div>
      )}
    </aside>
  )
}
