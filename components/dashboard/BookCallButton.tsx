'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface BookCallButtonProps {
  variant?: 'white' | 'gradient'
  label?: string
}

export function BookCallButton({ variant = 'white', label = 'Book a Strategy Call' }: BookCallButtonProps = {}) {
  const [open, setOpen] = useState(false)

  const buttonClass =
    variant === 'gradient'
      ? 'btn-gradient px-8 py-3 inline-block text-base'
      : 'bg-white text-brand-orange-dark px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-cream transition-colors flex-shrink-0'

  useEffect(() => {
    if (!open) return
    const existing = document.querySelector('script[src="https://start.cruciblecoaching.org/js/form_embed.js"]')
    if (!existing) {
      const s = document.createElement('script')
      s.src = 'https://start.cruciblecoaching.org/js/form_embed.js'
      s.type = 'text/javascript'
      document.body.appendChild(s)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  return (
    <>
      <button onClick={() => setOpen(true)} className={buttonClass}>
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl h-[85vh] bg-white rounded-[25px] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 flex items-center justify-center shadow-md transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <iframe
              src="https://start.cruciblecoaching.org/widget/booking/NNZyidpmU95v2HJmSSUd"
              className="w-full h-full border-0"
              scrolling="no"
              id="NNZyidpmU95v2HJmSSUd_1776143776091"
            />
          </div>
        </div>
      )}
    </>
  )
}
