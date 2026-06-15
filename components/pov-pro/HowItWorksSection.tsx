import { UNIVERSAL } from '@/lib/pov-pro/universal'
import { getIcon } from './iconRegistry'

const PILLAR_NUM: Record<string, string> = {
  problem: '1',
  fix: '2',
  'above-and-beyond': '3',
}

export function HowItWorksSection() {
  const { howItWorks } = UNIVERSAL
  return (
    <section id="how-it-works" className="bg-gray-50 py-20 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="text-3xl md:text-4xl font-black text-page-dark tracking-tight mb-4">
            {howItWorks.heading}
          </h2>
          <p className="text-lg text-page-muted max-w-2xl mx-auto leading-relaxed">
            {howItWorks.subhead}
          </p>
        </div>

        {/* The daily loop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
          {howItWorks.mechanism.map((step, i) => {
            const Icon = getIcon(step.icon)
            const isOurs = step.title === 'We edit' || step.title === 'We post'
            return (
              <div
                key={step.step}
                className="scroll-reveal bg-white rounded-[20px] p-6 shadow-card-soft border border-gray-100 relative"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {isOurs && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wide text-brand-gradient-end bg-brand-gradient-end/10 px-2 py-0.5 rounded-full">
                    On us
                  </span>
                )}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs font-bold text-page-muted mb-1">{step.step}</div>
                <h3 className="text-base font-bold text-page-dark mb-2">{step.title}</h3>
                <p className="text-sm text-page-muted leading-relaxed">{step.description}</p>
              </div>
            )
          })}
        </div>

        {/* The 3 pillars */}
        <div className="text-center mb-10 scroll-reveal">
          <h3 className="text-2xl md:text-3xl font-black text-page-dark tracking-tight">
            Every video, 3 pillars
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {howItWorks.pillars.map((pillar, i) => (
            <div
              key={pillar.kind}
              className="scroll-reveal bg-white rounded-[25px] p-8 shadow-card-soft border border-gray-100"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-brand-gradient-start to-brand-gradient-end leading-none mb-4">
                {PILLAR_NUM[pillar.kind]}
              </div>
              <h4 className="text-lg font-bold text-page-dark mb-3">{pillar.title}</h4>
              <p className="text-page-muted text-base leading-relaxed">{pillar.body}</p>
            </div>
          ))}
        </div>

        {/* 7-shot + effort */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="scroll-reveal bg-page-dark rounded-[25px] p-8 text-white">
            <h4 className="text-lg font-bold mb-3">{howItWorks.sevenShot.title}</h4>
            <p className="text-gray-300 text-base leading-relaxed">{howItWorks.sevenShot.body}</p>
          </div>
          <div className="scroll-reveal bg-gradient-to-br from-brand-gradient-start/10 to-brand-gradient-end/10 border border-brand-gradient-end/20 rounded-[25px] p-8 flex items-center">
            <p className="text-lg font-semibold text-page-dark leading-relaxed">
              {howItWorks.effortNote}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
