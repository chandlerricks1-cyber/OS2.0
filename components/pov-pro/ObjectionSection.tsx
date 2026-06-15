import { CheckCircle2 } from 'lucide-react'
import type { AvatarConfig } from '@/types/pov-pro'
import { UNIVERSAL } from '@/lib/pov-pro/universal'

export function ObjectionSection({ avatar }: { avatar: AvatarConfig }) {
  const { objectionDefusers } = UNIVERSAL
  return (
    <section className="bg-gray-50 py-20 md:py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Avatar master objection — addressed head-on */}
        <div className="scroll-reveal bg-page-dark rounded-[28px] p-8 sm:p-12 text-center mb-14">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-gradient-end mb-4">
            Let&apos;s address it head-on
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white leading-snug mb-6">
            {avatar.objection.masterObjection}
          </p>
          <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
            {avatar.objection.response}
          </p>
        </div>

        {/* Universal agency-skepticism defusers */}
        <div className="text-center mb-10 scroll-reveal">
          <h2 className="text-3xl md:text-4xl font-black text-page-dark tracking-tight mb-3">
            {objectionDefusers.heading}
          </h2>
          <p className="text-lg text-page-muted max-w-2xl mx-auto">{objectionDefusers.subhead}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {objectionDefusers.defusers.map((d, i) => (
            <div
              key={d.objection}
              className="scroll-reveal bg-white rounded-[20px] p-6 shadow-card-soft border border-gray-100"
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-brand-gradient-end flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-bold text-page-dark mb-1.5">{d.objection}</h3>
                  <p className="text-page-muted text-[15px] leading-relaxed">{d.response}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
