'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { OFFER_TYPE_LABELS } from '@/types/offer'
import type { Offer } from '@/types/offer'

export function ClassroomGrid({ offers }: { offers: Offer[] }) {
  if (offers.length === 0) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-[25px] p-12 text-center">
        <div className="text-sm font-semibold text-gray-600">No offers yet</div>
        <div className="text-xs text-gray-500 mt-1">
          Create offers in the Overview tab first, then come back here to build a classroom entry for each one.
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {offers.map((o) => (
        <Link
          key={o.id}
          href={`/dashboard/money-model/classroom/${o.id}`}
          className="group bg-white border border-gray-200 rounded-[20px] overflow-hidden hover:shadow-elevated hover:border-brand-gradient-end/30 transition-all"
        >
          <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden">
            {o.thumbnail_url ? (
              <Image
                src={o.thumbnail_url}
                alt={o.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-gradient-start/10 to-brand-gradient-end/10">
                <Play className="w-10 h-10 text-brand-gradient-end/40" />
              </div>
            )}
            <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide">
              {OFFER_TYPE_LABELS[o.offer_type]}
            </div>
          </div>
          <div className="p-4">
            <div className="font-bold text-gray-900 group-hover:text-brand-gradient-end transition-colors">
              {o.name}
            </div>
            {o.short_description && (
              <div className="text-sm text-gray-500 mt-1 line-clamp-2">{o.short_description}</div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
