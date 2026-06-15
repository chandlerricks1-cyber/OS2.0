import { ShieldCheck } from 'lucide-react'
import { UNIVERSAL } from '@/lib/pov-pro/universal'

export function GuaranteeSection() {
  const { guarantee } = UNIVERSAL
  return (
    <section className="bg-white py-20 md:py-24 px-6">
      <div className="max-w-3xl mx-auto scroll-reveal">
        <div className="bg-gradient-to-br from-brand-gradient-start/10 to-brand-gradient-end/10 border-2 border-brand-gradient-end/25 rounded-[28px] p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-page-dark tracking-tight mb-5">
            {guarantee.heading}
          </h2>
          <p className="text-lg md:text-xl text-page-dark leading-relaxed">{guarantee.body}</p>
        </div>
      </div>
    </section>
  )
}
