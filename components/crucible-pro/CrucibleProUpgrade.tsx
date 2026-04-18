'use client'

import { useEffect, useState, useTransition } from 'react'
import { Flame, Check, X } from 'lucide-react'
import { requestCrucibleProUpgrade } from '@/lib/actions'

interface CrucibleProUpgradeProps {
  isPending: boolean
}

export function CrucibleProUpgrade({ isPending }: CrucibleProUpgradeProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [transitioning, startTransition] = useTransition()

  useEffect(() => {
    if (!calendarOpen) return
    const existing = document.querySelector('script[src="https://start.cruciblecoaching.org/js/form_embed.js"]')
    if (!existing) {
      const s = document.createElement('script')
      s.src = 'https://start.cruciblecoaching.org/js/form_embed.js'
      s.type = 'text/javascript'
      document.body.appendChild(s)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCalendarOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [calendarOpen])

  // Load embed script for inline calendar on pending state
  useEffect(() => {
    if (!isPending) return
    const existing = document.querySelector('script[src="https://start.cruciblecoaching.org/js/form_embed.js"]')
    if (!existing) {
      const s = document.createElement('script')
      s.src = 'https://start.cruciblecoaching.org/js/form_embed.js'
      s.type = 'text/javascript'
      document.body.appendChild(s)
    }
  }, [isPending])

  function handleScheduleClick() {
    startTransition(async () => {
      await requestCrucibleProUpgrade()
      setCalendarOpen(true)
    })
  }

  const valueProps = [
    {
      title: 'Increase Customer LTV',
      description: 'Maximize the lifetime value of every customer with proven retention strategies',
    },
    {
      title: 'Lower Your CAC',
      description: 'Reduce your cost to acquire each customer and improve unit economics',
    },
    {
      title: 'Scalable Acquisition Channel',
      description: 'Build a repeatable, predictable growth engine for your business',
    },
    {
      title: 'Increase Profitability',
      description: 'Improve margins across your business with data-driven optimization',
    },
  ]

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4">
      <div className="text-center mb-10">
        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center shadow-[0_8px_24px_rgba(255,136,0,0.25)]">
          <Flame className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 mb-4">
          Unlock{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
            Crucible Pro
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-lg mx-auto">
          Get hands-on coaching, accountability, and the tools to scale your business faster.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-[25px] p-8 shadow-card-soft">
        <ul className="space-y-5 mb-8">
          {valueProps.map((prop) => (
            <li key={prop.title} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center mt-0.5">
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{prop.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{prop.description}</p>
              </div>
            </li>
          ))}
        </ul>

        {isPending ? (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Upgrade Request Pending
            </div>
            <p className="text-sm text-gray-500 mb-8">
              Our team has been notified. Schedule your upgrade call below to get started.
            </p>

            {/* Inline GHL calendar for pending users */}
            <div className="rounded-2xl overflow-hidden border border-gray-100">
              <iframe
                src="https://start.cruciblecoaching.org/widget/booking/vTXDG7Nm0pHN3QFDMTJe"
                className="w-full border-0"
                style={{ minHeight: '600px' }}
                scrolling="no"
                id="vTXDG7Nm0pHN3QFDMTJe_1776539934225"
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={handleScheduleClick}
              disabled={transitioning}
              className="btn-gradient px-8 py-3 inline-block text-base disabled:opacity-50"
            >
              {transitioning ? 'Loading...' : 'Schedule Your Upgrade Call'}
            </button>
          </div>
        )}
      </div>

      {/* Calendar modal (shown after clicking CTA for non-pending users) */}
      {calendarOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setCalendarOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl h-[85vh] bg-white rounded-[25px] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setCalendarOpen(false)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 flex items-center justify-center shadow-md transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <iframe
              src="https://start.cruciblecoaching.org/widget/booking/vTXDG7Nm0pHN3QFDMTJe"
              className="w-full h-full border-0"
              scrolling="no"
              id="vTXDG7Nm0pHN3QFDMTJe_modal"
            />
          </div>
        </div>
      )}
    </div>
  )
}
