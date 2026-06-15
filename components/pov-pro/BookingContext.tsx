'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import Script from 'next/script'
import { X } from 'lucide-react'
import {
  BOOKING_IFRAME_SRC,
  BOOKING_IFRAME_ID,
  BOOKING_EMBED_SCRIPT,
} from '@/lib/pov-pro/constants'

const BookingContext = createContext<{ open: () => void } | null>(null)

/** Opens the in-page booking popup. Used by every CTA on the page. */
export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used within a BookingProvider')
  return ctx
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookingOpen, setBookingOpen] = useState(false)
  const open = useCallback(() => setBookingOpen(true), [])

  // Close on Escape + lock body scroll while open (mirrors mortgage-holds).
  useEffect(() => {
    if (!bookingOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBookingOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [bookingOpen])

  return (
    <BookingContext.Provider value={{ open }}>
      {children}

      {bookingOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-0 py-0 sm:px-6 sm:py-6"
          role="dialog"
          aria-modal="true"
          aria-label="Book a call with Crucible"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setBookingOpen(false)}
          />
          <div className="relative w-full max-w-3xl h-[100dvh] sm:h-[90vh] bg-white rounded-none sm:rounded-[20px] shadow-elevated overflow-hidden flex flex-col">
            <button
              type="button"
              onClick={() => setBookingOpen(false)}
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-card-soft flex items-center justify-center text-page-dark transition-colors"
              aria-label="Close booking"
            >
              <X className="w-5 h-5" />
            </button>
            <div
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <iframe
                src={BOOKING_IFRAME_SRC}
                id={BOOKING_IFRAME_ID}
                title="Book a call with Crucible"
                scrolling="no"
                className="w-full border-0 block"
                style={{ minHeight: '720px', height: '100%' }}
              />
            </div>
          </div>
        </div>
      )}

      <Script src={BOOKING_EMBED_SCRIPT} strategy="lazyOnload" />
    </BookingContext.Provider>
  )
}
