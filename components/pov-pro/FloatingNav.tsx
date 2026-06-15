import { Logo } from '@/components/shared/Logo'
import { UNIVERSAL } from '@/lib/pov-pro/universal'
import { BookCallButton } from './BookCallButton'
import type { AvatarSlug } from '@/types/pov-pro'

export function FloatingNav({ slug }: { slug: AvatarSlug }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <div className="max-w-6xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-nav px-5 sm:px-6 py-3 flex items-center justify-between">
        <Logo height={56} />
        <div className="hidden md:flex items-center gap-8">
          {UNIVERSAL.nav.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-page-muted hover:text-page-dark transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
        <BookCallButton label="Book a call" slug={slug} className="text-sm px-5 py-2.5" />
      </div>
    </nav>
  )
}
