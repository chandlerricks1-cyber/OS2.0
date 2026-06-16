import type { AvatarConfig } from '@/types/pov-pro'
import { UNIVERSAL } from '@/lib/pov-pro/universal'
import { getIcon } from './iconRegistry'
import { BeforeAfterSection } from './BeforeAfterSection'

export function ProofSection({ avatar }: { avatar: AvatarConfig }) {
  const { proof } = UNIVERSAL
  return (
    <section id="proof" className="bg-white py-20 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="text-3xl md:text-4xl font-black text-page-dark tracking-tight mb-4">
            {avatar.proof.heading ?? proof.heading}
          </h2>
          <p className="text-lg text-page-muted max-w-2xl mx-auto">{proof.subhead}</p>
        </div>

        {/* Avatar-specific SEE items — the reframe made concrete for this buyer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {avatar.proof.seeItems.map((item, i) => {
            const Icon = getIcon(item.icon)
            return (
              <div
                key={item.label}
                className="scroll-reveal bg-gray-50 rounded-[25px] p-8 border border-gray-100"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-page-dark mb-2">{item.label}</h3>
                {item.detail ? (
                  <p className="text-page-muted text-base leading-relaxed">{item.detail}</p>
                ) : null}
              </div>
            )
          })}
        </div>

        {/* Before/after — same company, scripted brand video vs POV content */}
        <BeforeAfterSection />

        {/* Universal proof points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {proof.points.map((point, i) => (
            <div
              key={point.heading}
              className="scroll-reveal bg-white rounded-[20px] p-7 shadow-card-soft border border-gray-100 hover:shadow-elevated transition-shadow duration-300"
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              <div className="flex gap-4">
                <div className="w-1 h-9 rounded-full bg-gradient-to-b from-brand-gradient-start to-brand-gradient-end flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-page-dark mb-2">{point.heading}</h3>
                  <p className="text-page-muted text-base leading-relaxed">{point.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
