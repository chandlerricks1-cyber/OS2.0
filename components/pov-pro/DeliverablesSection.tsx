import { Check } from 'lucide-react'
import { UNIVERSAL } from '@/lib/pov-pro/universal'

export function DeliverablesSection() {
  const { deliverables } = UNIVERSAL
  return (
    <section id="deliverables" className="bg-gray-50 py-20 md:py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="text-3xl md:text-4xl font-black text-page-dark tracking-tight mb-4">
            {deliverables.heading}
          </h2>
          <p className="text-lg text-page-muted max-w-2xl mx-auto">{deliverables.subhead}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {deliverables.items.map((item, i) => (
            <div
              key={item.title}
              className="scroll-reveal bg-white rounded-[20px] p-6 shadow-card-soft border border-gray-100"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-page-dark">{item.title}</h3>
                    {item.addOn ? (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-page-muted bg-gray-100 px-2 py-0.5 rounded-full">
                        Add-on
                      </span>
                    ) : null}
                  </div>
                  {item.detail ? (
                    <p className="text-page-muted text-[15px] leading-relaxed mt-1">{item.detail}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
