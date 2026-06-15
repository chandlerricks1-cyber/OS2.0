'use client'

import { Logo } from '@/components/shared/Logo'
import { UNIVERSAL } from '@/lib/pov-pro/universal'
import { useBooking } from './BookingContext'

export function Footer() {
  const { open } = useBooking()
  return (
    <footer className="bg-page-dark border-t border-white/10 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-3">
            <Logo height={48} variant="light" />
            <p className="text-sm text-gray-400">{UNIVERSAL.footerTagline}</p>
          </div>
          <button
            type="button"
            onClick={open}
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Book a call →
          </button>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">&copy; 2026 Crucible Coaching. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="text-sm text-gray-500 hover:text-white transition-colors">
              Privacy
            </a>
            <a href="/terms" className="text-sm text-gray-500 hover:text-white transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
