'use client'

import { useEffect, useState } from 'react'
import type { AvatarConfig } from '@/types/pov-pro'
import { BookingProvider } from './BookingContext'
import { FloatingNav } from './FloatingNav'
import { HeroSection } from './HeroSection'
import { PovExamplesSection } from './PovExamplesSection'
import { AgitationSection } from './AgitationSection'
import { ReframeSection } from './ReframeSection'
import { HowItWorksSection } from './HowItWorksSection'
import { ProofSection } from './ProofSection'
import { ObjectionSection } from './ObjectionSection'
import { GuaranteeSection } from './GuaranteeSection'
import { DeliverablesSection } from './DeliverablesSection'
import { TestimonialsSection } from './TestimonialsSection'
import { FaqSection } from './FaqSection'
import { FinalCtaSection } from './FinalCtaSection'
import { Footer } from './Footer'

export function PovProLanding({ avatar }: { avatar: AvatarConfig }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Scroll-reveal — reuses the .scroll-reveal / .revealed pattern from globals.css.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <BookingProvider>
      <div className="min-h-screen bg-white">
        <FloatingNav slug={avatar.slug} />
        <main>
          <HeroSection avatar={avatar} />
          <PovExamplesSection avatar={avatar} />
          <AgitationSection avatar={avatar} />
          <ReframeSection avatar={avatar} />
          <HowItWorksSection />
          <ProofSection avatar={avatar} />
          <ObjectionSection avatar={avatar} />
          <GuaranteeSection />
          <DeliverablesSection />
          <TestimonialsSection />
          <FaqSection
            avatar={avatar}
            openIndex={openFaq}
            onToggle={(i) => setOpenFaq(openFaq === i ? null : i)}
          />
          <FinalCtaSection avatar={avatar} />
        </main>
        <Footer />
      </div>
    </BookingProvider>
  )
}
