'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX, X, Check, ArrowRight } from 'lucide-react'
import { BEFORE_AFTER, type BeforeAfterClip } from '@/lib/pov-pro/povExamples'

const CLIPS: BeforeAfterClip[] = [BEFORE_AFTER.before, BEFORE_AFTER.after]

export function BeforeAfterSection() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  // Only one clip is unmuted at a time. null = all muted.
  const [unmuted, setUnmuted] = useState<number | null>(null)

  // Force muted on mount + play/pause on visibility (keeps bandwidth down).
  useEffect(() => {
    const videos = videoRefs.current.filter(Boolean) as HTMLVideoElement[]
    videos.forEach((v) => {
      v.muted = true
    })
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const v = entry.target as HTMLVideoElement
          if (entry.isIntersecting) v.play().catch(() => {})
          else v.pause()
        })
      },
      { threshold: 0.25 }
    )
    videos.forEach((v) => observer.observe(v))
    return () => observer.disconnect()
  }, [])

  const toggleSound = (i: number) => {
    const next = unmuted === i ? null : i
    setUnmuted(next)
    videoRefs.current.forEach((v, idx) => {
      if (!v) return
      v.muted = idx !== next
      if (idx === next) v.play().catch(() => {})
    })
  }

  return (
    <div className="my-16">
      <div className="text-center mb-10 scroll-reveal">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-gradient-end mb-3">
          Same company · same week
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-page-dark tracking-tight">
          Scripted brand video vs. POV content
        </h3>
        <p className="text-base md:text-lg text-page-muted max-w-xl mx-auto mt-3">
          Same business, two formats. The polished ad got ignored. The raw POV footage took off.
          Tap either one for sound.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-4 items-center">
        {CLIPS.map((clip, i) => (
          <div key={clip.kind} className="contents">
            <ClipCard
              clip={clip}
              index={i}
              isUnmuted={unmuted === i}
              onToggleSound={() => toggleSound(i)}
              registerRef={(el) => {
                videoRefs.current[i] = el
              }}
            />
            {/* Arrow between the two clips (before -> after) */}
            {i === 0 && (
              <div className="flex md:flex-col items-center justify-center text-brand-gradient-end">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center shadow-lg">
                  <ArrowRight className="w-5 h-5 text-white md:hidden" />
                  <ArrowRight className="w-5 h-5 text-white hidden md:block" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ClipCard({
  clip,
  index,
  isUnmuted,
  onToggleSound,
  registerRef,
}: {
  clip: BeforeAfterClip
  index: number
  isUnmuted: boolean
  onToggleSound: () => void
  registerRef: (el: HTMLVideoElement | null) => void
}) {
  const before = clip.kind === 'before'
  const accent = before
    ? 'bg-red-500/90'
    : 'bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end'
  const frameRing = before ? 'border-red-300' : 'border-brand-gradient-end/40'

  return (
    <div
      className="scroll-reveal mx-auto w-full max-w-[300px]"
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      {/* Setup → punchline hook */}
      <div className="text-center mb-3 min-h-[3.5rem] flex flex-col justify-end">
        <p className="text-sm text-page-muted italic">{clip.hook.setup}</p>
        <p
          className={`text-base font-black leading-snug ${
            before ? 'text-red-600' : 'text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end'
          }`}
        >
          {clip.hook.punch}
        </p>
      </div>

      <div
        className={`relative rounded-[24px] overflow-hidden border-[5px] ${frameRing} bg-black shadow-elevated aspect-[9/16] cursor-pointer`}
        onClick={onToggleSound}
      >
        <video
          ref={registerRef}
          src={clip.src}
          className="w-full h-full object-cover"
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          aria-label={clip.badge}
        />

        {/* Top badge */}
        <span
          className={`absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wide text-white ${accent} px-2.5 py-1 rounded-full shadow`}
        >
          {clip.badge}
        </span>

        {/* Sound toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleSound()
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/55 backdrop-blur flex items-center justify-center text-white"
          aria-label={isUnmuted ? 'Mute' : 'Unmute'}
        >
          {isUnmuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Difference overlays */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent pt-10 pb-3 px-3 pointer-events-none">
          <ul className="space-y-1.5">
            {clip.points.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                    before ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                >
                  {before ? (
                    <X className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  ) : (
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  )}
                </span>
                <span className="text-[12px] font-semibold text-white leading-tight drop-shadow">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
