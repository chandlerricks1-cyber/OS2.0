import { Star, ArrowUpRight } from 'lucide-react'
import { UNIVERSAL } from '@/lib/pov-pro/universal'
import { POV_TESTIMONIALS } from '@/lib/pov-pro/testimonials'

export function TestimonialsSection() {
  const { testimonials } = UNIVERSAL
  return (
    <section className="bg-white py-20 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="text-3xl md:text-4xl font-black text-page-dark tracking-tight mb-4">
            {testimonials.heading}
          </h2>
          <p className="text-lg text-page-muted max-w-2xl mx-auto">{testimonials.subhead}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {POV_TESTIMONIALS.map((t, i) => (
            <div
              key={t.company}
              className="scroll-reveal bg-white rounded-[25px] p-5 sm:p-6 shadow-card-soft border border-gray-100 hover:shadow-elevated transition-shadow duration-300 flex gap-5"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Real reel screenshot */}
              <a
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 w-[112px] sm:w-[128px] rounded-[18px] overflow-hidden border-[3px] border-page-dark shadow-md bg-black self-start"
                aria-label={`${t.company} on social`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.image}
                  alt={`${t.company} POV reel`}
                  className="w-full h-full object-cover aspect-[9/16]"
                  loading="lazy"
                />
              </a>

              {/* Content */}
              <div className="flex flex-col min-w-0">
                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-lg font-black text-page-dark hover:text-brand-gradient-end transition-colors leading-tight"
                >
                  {t.company}
                  <ArrowUpRight className="w-4 h-4 text-brand-gradient-end flex-shrink-0" />
                </a>

                <div className="flex gap-0.5 mt-1.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-brand-gradient-end fill-brand-gradient-end" />
                  ))}
                </div>

                <p className="text-page-dark text-[14px] leading-relaxed mb-4 flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <Stat value={t.views} label="organic views" highlight />
                  <Stat value={t.tenure} label="on POV" />
                  <Stat value={t.leads} label={t.leadsLabel} highlight />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Stat({ value, label, highlight = false }: { value: string; label: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl px-2.5 py-2.5 text-center ${
        highlight
          ? 'bg-gradient-to-br from-brand-gradient-start/5 to-brand-gradient-end/10 border border-brand-gradient-end/15'
          : 'bg-gray-50 border border-gray-100'
      }`}
    >
      <div
        className={`text-base font-black leading-none ${
          highlight
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end'
            : 'text-page-dark'
        }`}
      >
        {value}
      </div>
      <div className="text-[10px] text-page-muted mt-1.5 font-medium leading-tight">{label}</div>
    </div>
  )
}
