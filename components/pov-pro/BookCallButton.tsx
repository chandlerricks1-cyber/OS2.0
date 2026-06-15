'use client'

import { cn } from '@/lib/utils/cn'
import { useBooking } from './BookingContext'

interface BookCallButtonProps {
  label: string
  className?: string
  /** Avatar slug — passed to Meta tracking as content category. */
  slug?: string
}

/**
 * The single CTA used across every page (4× per page). Opens the booking
 * widget in an in-page popup. Fires a Meta Lead event if fbq is present.
 */
export function BookCallButton({ label, className, slug }: BookCallButtonProps) {
  const { open } = useBooking()

  const handleClick = () => {
    if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
      ;(window as any).fbq('track', 'Lead', { content_category: slug ?? 'pov-pro' })
    }
    open()
  }

  return (
    <button type="button" onClick={handleClick} className={cn('btn-gradient', className)}>
      {label}
    </button>
  )
}
