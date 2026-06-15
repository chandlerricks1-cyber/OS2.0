'use client'

import { useEffect, useRef } from 'react'
import { VolumeX, Eye, MessageCircle, UserPlus } from 'lucide-react'
import type { AvatarConfig } from '@/types/pov-pro'
import type { PovExampleStats } from '@/lib/pov-pro/povExamples'
import { AVATAR_SLUGS } from '@/lib/pov-pro/avatars'
import { rotatedExamples } from '@/lib/pov-pro/povExamples'

export function PovExamplesSection({ avatar }: { avatar: AvatarConfig }) {
  const offset = Math.max(0, AVATAR_SLUGS.indexOf(avatar.slug))
  const examples = rotatedExamples(offset, 3)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  // Force muted (React can miss the muted property) and play/pause based on
  // visibility so off-screen reels don't burn bandwidth.
  useEffect(() => {
    const videos = videoRefs.current.filter(Boolean) as HTMLVideoElement[]
    videos.forEach((v) => {
      v.muted = true
    })
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const v = entry.target as HTMLVideoElement
          if (entry.isIntersecting) {
            v.play().catch(() => {})
          } else {
            v.pause()
          }
        })
      },
      { threshold: 0.25 }
    )
    videos.forEach((v) => observer.observe(v))
    return () => observer.disconnect()
  }, [])

  if (examples.length === 0) return null

  return (
    <section className="bg-white pb-16 md:pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 scroll-reveal">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-gradient-end mb-3">
            <VolumeX className="w-3.5 h-3.5" />
            Real examples · no sound needed
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-page-dark tracking-tight">
            This is what we mean by POV content
          </h2>
          <p className="text-base md:text-lg text-page-muted max-w-xl mx-auto mt-3">
            Real jobs, filmed through your tech&apos;s eyes — no studio, no script. This is the raw
            footage homeowners actually stop and watch.
          </p>
        </div>

        <div className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible pb-2 -mx-6 px-6 md:mx-0 md:px-0">
          {examples.map((ex, i) => (
            <div
              key={ex.src}
              className="scroll-reveal snap-center shrink-0 w-[68vw] max-w-[260px] sm:w-[240px] md:w-auto"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <div className="relative rounded-[24px] overflow-hidden border-[5px] border-page-dark bg-black shadow-elevated aspect-[9/16]">
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el
                  }}
                  src={ex.src}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                  preload="metadata"
                  aria-label={`${ex.label} — POV example reel`}
                />
                <span className="absolute top-3 left-3 w-7 h-7 rounded-full bg-black/55 backdrop-blur flex items-center justify-center">
                  <VolumeX className="w-3.5 h-3.5 text-white" />
                </span>
                {ex.stats ? <EngagementRail stats={ex.stats} /> : null}
                <span className="absolute bottom-3 left-3 text-xs font-semibold text-white bg-black/55 backdrop-blur px-2.5 py-1 rounded-full">
                  {ex.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Native reel-style engagement chips. Leads is accented — it's the money metric. */
function EngagementRail({ stats }: { stats: PovExampleStats }) {
  return (
    <div className="absolute right-2.5 bottom-12 flex flex-col items-center gap-3.5">
      <Stat icon={<Eye className="w-4 h-4 text-white" />} value={stats.views} srLabel="views" />
      <Stat
        icon={<MessageCircle className="w-4 h-4 text-white" />}
        value={stats.comments}
        srLabel="comments"
      />
      <Stat
        icon={<UserPlus className="w-4 h-4 text-white" />}
        value={stats.leads}
        srLabel="local leads"
        accent
      />
    </div>
  )
}

function Stat({
  icon,
  value,
  srLabel,
  accent = false,
}: {
  icon: React.ReactNode
  value: string
  srLabel: string
  accent?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1" aria-label={`${value} ${srLabel}`}>
      <span
        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg ${
          accent
            ? 'bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end'
            : 'bg-black/55 backdrop-blur'
        }`}
      >
        {icon}
      </span>
      <span
        className="text-[11px] font-bold text-white leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
        aria-hidden
      >
        {value}
      </span>
    </div>
  )
}
