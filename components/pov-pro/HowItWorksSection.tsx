import { UNIVERSAL } from '@/lib/pov-pro/universal'
import { getIcon } from './iconRegistry'

export function HowItWorksSection() {
  const { howItWorks } = UNIVERSAL
  return (
    <section id="how-it-works" className="bg-gray-50 py-20 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 scroll-reveal">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-gradient-end mb-3">
            You capture · we run the machine
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-page-dark tracking-tight mb-4">
            {howItWorks.heading}
          </h2>
          <p className="text-lg text-page-muted max-w-2xl mx-auto leading-relaxed">
            {howItWorks.subhead}
          </p>
        </div>

        {/* Connected step flow */}
        <div className="relative">
          {/* connector line behind the icon row (desktop) */}
          <div
            className="hidden lg:block absolute top-9 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end opacity-30"
            aria-hidden
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-y-10 gap-x-6 relative">
            {howItWorks.mechanism.map((step, i) => {
              const Icon = getIcon(step.icon)
              const isOurs = step.title === 'We edit' || step.title === 'We post'
              return (
                <div
                  key={step.step}
                  className="scroll-reveal flex flex-col items-center text-center px-1"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="relative mb-5">
                    <div className="w-[72px] h-[72px] rounded-2xl bg-white ring-4 ring-gray-50 shadow-card-soft flex items-center justify-center">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-page-dark text-white text-[11px] font-bold flex items-center justify-center shadow">
                      {step.step.replace(/^0/, '')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-2">
                    <h3 className="text-base font-bold text-page-dark">{step.title}</h3>
                    {isOurs && (
                      <span className="text-[9px] font-bold uppercase tracking-wide text-brand-gradient-end bg-brand-gradient-end/10 px-1.5 py-0.5 rounded-full">
                        On us
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-page-muted leading-relaxed">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Effort note */}
        <div className="scroll-reveal mt-14 max-w-3xl mx-auto bg-gradient-to-br from-brand-gradient-start/10 to-brand-gradient-end/10 border border-brand-gradient-end/20 rounded-[25px] px-7 py-6 text-center">
          <p className="text-base md:text-lg font-semibold text-page-dark leading-relaxed">
            {howItWorks.effortNote}
          </p>
        </div>
      </div>
    </section>
  )
}
