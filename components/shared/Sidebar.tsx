'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, LayoutGrid, Flame, Settings, X, Shield, Mic, Users, Plug } from 'lucide-react'
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
  if (pathname === href) return true
  if (href === '/dashboard') return false
  return pathname.startsWith(href + '/')
}

const adminNavItems = [
  {
    href: '/dashboard/admin',
    label: 'Admin Dashboard',
    icon: <Shield className="w-[18px] h-[18px]" strokeWidth={1.5} />,
    exact: true,
  },
  {
    href: '/dashboard/admin/podcast',
    label: 'Podcast Leads',
    icon: <Mic className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  },
  {
    href: '/dashboard/admin/clients',
    label: 'Clients',
    icon: <Users className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  },
  {
    href: '/dashboard/admin/integrations',
    label: 'Integrations',
    icon: <Plug className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
  role?: string
  crucibleProStatus?: string | null
}

export function Sidebar({ mobileOpen = false, onMobileClose, role, crucibleProStatus }: SidebarProps) {
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebarCollapsed()

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [mobileOpen])

  const widthCls = collapsed ? 'md:w-20' : 'md:w-56'

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onMobileClose}
        className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      <aside
        className={`bg-brand-dark flex flex-col transition-transform md:transition-[width] duration-200
          fixed md:sticky md:top-0 inset-y-0 left-0 z-50
          w-64 ${widthCls} md:h-screen
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div
          className={`relative border-b border-white/10 flex items-center justify-center ${
            collapsed ? 'md:py-4 md:px-2 py-5 px-4' : 'py-5 px-4'
          }`}
        >
          {/* Mobile close */}
          <button
            onClick={onMobileClose}
            aria-label="Close menu"
            className="md:hidden absolute top-2 right-2 w-8 h-8 rounded-md bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          {/* Desktop collapse toggle */}
          <button
            onClick={toggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden md:flex absolute top-2 right-2 w-6 h-6 rounded-md bg-white/5 hover:bg-white/15 text-white/60 hover:text-white items-center justify-center transition-colors"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
          {collapsed ? (
            <>
              <span className="md:hidden"><Logo height={90} variant="light" /></span>
              <span className="hidden md:inline"><Logo height={40} variant="icon" /></span>
            </>
          ) : (
            <Logo height={90} variant="light" />
          )}
        </div>

        <nav className={`flex-1 py-4 space-y-0.5 ${collapsed ? 'md:px-2 px-3' : 'px-3'}`}>
          {navItems.map((item) => {
            const isActive = isActivePath(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                title={collapsed ? item.label : undefined}
                className={`relative flex items-center rounded-lg text-sm font-medium transition-all gap-3 px-3 py-2.5
                  ${collapsed ? 'md:justify-center md:px-0 md:py-3 md:gap-0' : ''}
                  ${isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/50 hover:bg-white/8 hover:text-white/80'
                  }`}
              >
                {isActive && !collapsed && (
                  <span className="absolute left-0 w-0.5 h-5 bg-brand-orange rounded-full" />
                )}
                <span className={isActive ? 'text-brand-orange' : ''}>{item.icon}</span>
                <span className={collapsed ? 'md:hidden' : ''}>
                  {item.label}
                  {item.href === '/dashboard/crucible-pro' && crucibleProStatus === 'active' && (
                    <span className="ml-1.5 inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-orange/20 text-brand-orange leading-none">
                      PRO
                    </span>
                  )}
                </span>
              </Link>
            )
          })}
        </nav>

        {role === 'admin' && (
          <div className={`border-t border-white/10 py-3 space-y-0.5 ${collapsed ? 'md:px-2 px-3' : 'px-3'}`}>
            {!collapsed && (
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider px-3 mb-2">Admin</p>
            )}
            {adminNavItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : isActivePath(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  title={collapsed ? item.label : undefined}
                  className={`relative flex items-center rounded-lg text-sm font-medium transition-all gap-3 px-3 py-2.5
                    ${collapsed ? 'md:justify-center md:px-0 md:py-3 md:gap-0' : ''}
                    ${isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/50 hover:bg-white/8 hover:text-white/80'
                    }`}
                >
                  {isActive && !collapsed && (
                    <span className="absolute left-0 w-0.5 h-5 bg-brand-orange rounded-full" />
                  )}
                  <span className={isActive ? 'text-brand-orange' : ''}>{item.icon}</span>
                  <span className={collapsed ? 'md:hidden' : ''}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        )}

        <div className={`px-3 pb-2 ${collapsed ? 'md:px-2' : ''}`}>
          <Link
            href="/settings"
            onClick={onMobileClose}
            title={collapsed ? 'Settings' : undefined}
            className={`relative flex items-center rounded-lg text-sm font-medium transition-all gap-3 px-3 py-2.5
              ${collapsed ? 'md:justify-center md:px-0 md:py-3 md:gap-0' : ''}
              ${isActivePath(pathname, '/settings')
                ? 'bg-white/15 text-white'
                : 'text-white/50 hover:bg-white/8 hover:text-white/80'
              }`}
          >
            {isActivePath(pathname, '/settings') && !collapsed && (
              <span className="absolute left-0 w-0.5 h-5 bg-brand-orange rounded-full" />
            )}
            <span className={isActivePath(pathname, '/settings') ? 'text-brand-orange' : ''}>
              <Settings className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </span>
            <span className={collapsed ? 'md:hidden' : ''}>Settings</span>
          </Link>
        </div>

        <div className={`px-4 py-4 border-t border-white/10 ${collapsed ? 'md:hidden' : ''}`}>
          <p className="text-xs text-white/25 font-medium tracking-wide uppercase">Crucible OS</p>
        </div>
      </aside>
    </>
  )
}
