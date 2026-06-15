import type { AvatarConfig } from '@/types/pov-pro'

export function ReframeSection({ avatar }: { avatar: AvatarConfig }) {
  return (
    <section className="bg-white py-20 md:py-24 px-6">
      <div className="max-w-3xl mx-auto text-center scroll-reveal">
        <div className="text-xs font-bold uppercase tracking-wider text-brand-gradient-end mb-5">
          Here&apos;s what&apos;s actually going on
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-page-dark tracking-tight leading-tight mb-6">
          {avatar.reframe.heading}
        </h2>
        <p className="text-lg md:text-xl text-page-muted leading-relaxed">{avatar.reframe.body}</p>
      </div>
    </section>
  )
}
