import type { AvatarConfig } from '@/types/pov-pro'
import { UNIVERSAL } from '@/lib/pov-pro/universal'
import { BookCallButton } from './BookCallButton'

export function FinalCtaSection({ avatar }: { avatar: AvatarConfig }) {
  return (
    <section className="bg-page-dark py-20 md:py-24 px-6">
      <div className="max-w-3xl mx-auto text-center scroll-reveal">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6">
          {avatar.finalCta.promiseHeadline}
          {avatar.finalCta.promiseAccent ? (
            <>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
                {avatar.finalCta.promiseAccent}
              </span>
            </>
          ) : null}
        </h2>
        <p className="text-gray-400 mb-10 text-lg max-w-xl mx-auto leading-relaxed">
          {avatar.finalCta.subtext}
        </p>
        <BookCallButton
          label={avatar.finalCta.ctaLabel}
          slug={avatar.slug}
          className="px-12 py-4 text-lg"
        />
        <p className="text-sm text-gray-500 mt-6">{UNIVERSAL.guarantee.reminder}</p>
      </div>
    </section>
  )
}
