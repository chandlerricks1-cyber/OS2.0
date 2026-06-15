import { Sparkles } from 'lucide-react'
import type { AvatarConfig } from '@/types/pov-pro'
import { BookCallButton } from './BookCallButton'

export function HeroSection({ avatar }: { avatar: AvatarConfig }) {
  return (
    <section className="pt-32 pb-16 md:pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-gradient-start/10 to-brand-gradient-end/10 border border-brand-gradient-end/20 text-brand-gradient-end text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          {avatar.hero.eyebrow}
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-[56px] font-black text-page-dark tracking-tight leading-[1.05] mb-6">
          {avatar.hero.headline}
          {avatar.hero.headlineAccent ? (
            <>
              {' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
                {avatar.hero.headlineAccent}
              </span>
            </>
          ) : null}
        </h1>

        <p className="text-lg md:text-xl text-page-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          {avatar.hero.subhead}
        </p>

        <BookCallButton
          label={avatar.hero.ctaLabel}
          slug={avatar.slug}
          className="px-9 py-4 text-base"
        />

        {/* Credibility strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-14">
          {avatar.hero.credibility.map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-2xl px-5 py-5 shadow-card-soft border border-gray-100 text-center"
            >
              <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
                {item.value}
              </div>
              <div className="text-sm text-page-muted mt-1.5">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
