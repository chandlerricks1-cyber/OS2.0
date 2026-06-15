import type { AvatarConfig } from '@/types/pov-pro'
import { getIcon } from './iconRegistry'

export function AgitationSection({ avatar }: { avatar: AvatarConfig }) {
  return (
    <section className="bg-gray-50 py-20 md:py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-page-dark text-center mb-14 tracking-tight scroll-reveal">
          {avatar.agitation.heading}
        </h2>

        <div className="space-y-5">
          {avatar.agitation.blocks.map((block, i) => {
            const Icon = getIcon(block.icon)
            return (
              <div
                key={i}
                className="scroll-reveal bg-white rounded-[20px] p-7 sm:p-8 shadow-card-soft border border-gray-100"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex gap-5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-gradient-start/15 to-brand-gradient-end/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-brand-gradient-end" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-page-dark leading-snug mb-3">
                      {block.pain}
                    </p>
                    <p className="text-page-muted text-base leading-relaxed">{block.reframe}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
