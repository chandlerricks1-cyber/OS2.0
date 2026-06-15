import { Star } from 'lucide-react'
import { UNIVERSAL } from '@/lib/pov-pro/universal'

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

        {/* Labeled placeholders — real testimonials dropped in before launch */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.placeholders.map((placeholder, i) => (
            <div
              key={placeholder}
              className="scroll-reveal bg-gray-50 rounded-[25px] p-8 border border-dashed border-gray-300"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 text-gray-300 fill-gray-300" />
                ))}
              </div>
              <p className="text-page-muted text-base leading-relaxed mb-6 font-mono">
                {placeholder}
              </p>
              <div className="border-t border-gray-200 pt-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div>
                  <div className="font-semibold text-page-muted text-sm">Client name</div>
                  <div className="text-page-muted/70 text-xs">Company · Location</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
