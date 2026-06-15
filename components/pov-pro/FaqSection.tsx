import { Plus, Minus } from 'lucide-react'
import type { AvatarConfig, FaqItem } from '@/types/pov-pro'
import { UNIVERSAL } from '@/lib/pov-pro/universal'

interface FaqSectionProps {
  avatar: AvatarConfig
  openIndex: number | null
  onToggle: (i: number) => void
}

export function FaqSection({ avatar, openIndex, onToggle }: FaqSectionProps) {
  // Avatar master objection first, then the universal questions.
  const faqs: FaqItem[] = [avatar.faq.masterQuestion, ...UNIVERSAL.faqUniversal]

  return (
    <section id="faq" className="bg-gray-50 py-20 md:py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-page-dark text-center mb-16 tracking-tight scroll-reveal">
          Frequently asked questions
        </h2>

        <div className="space-y-3 scroll-reveal">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => onToggle(i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                aria-expanded={openIndex === i}
              >
                <span className="text-base font-semibold text-page-dark pr-4">{faq.q}</span>
                {openIndex === i ? (
                  <Minus className="w-5 h-5 text-page-muted flex-shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-page-muted flex-shrink-0" />
                )}
              </button>
              <div
                className="grid transition-all duration-300 ease-in-out"
                style={{ gridTemplateRows: openIndex === i ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-5 text-page-muted text-base leading-relaxed">{faq.a}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
