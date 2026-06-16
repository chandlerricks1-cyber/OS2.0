// Customer testimonials for the POV Pro landing pages. Same companies as the
// existing proof set, rewritten around the POV content system. No owner names,
// no locations, no websites — just the company, their reel, and the numbers.

export interface PovTestimonial {
  company: string
  /** Links the company name + reel screenshot to their profile. */
  url: string
  /** Social-proof reel screenshot under /pov-testimonials. */
  image: string
  quote: string
  /** Headline stat — organic views since starting. */
  views: string
  /** How long they've run POV. */
  tenure: string
  /** Lead volume. */
  leads: string
  /** Sublabel for the leads stat (phrasing varies by company). */
  leadsLabel: string
}

export const POV_TESTIMONIALS: PovTestimonial[] = [
  {
    company: 'Squeegee Comedy',
    url: 'https://www.instagram.com/squeegeecomedy/reels/',
    image: '/pov-testimonials/squeegee-comedy.png',
    quote:
      "We went all-in on POV and it exploded — 30 million organic views in seven months. The calendar fills itself now. We're booking 125+ leads a month without spending a dollar on ads.",
    views: '30M+',
    tenure: '7 months',
    leads: '125+',
    leadsLabel: 'organic leads / mo',
  },
  {
    company: 'Shine Bros Auto Detailing',
    url: 'https://www.shinebrosautodetailing.com',
    image: '/pov-testimonials/shine-bros.png',
    quote:
      "In four months our detailing POV content crossed 22 million views. People show up already trusting us because they've watched us work. We're pulling 100+ organic leads a month off content that costs nothing to make.",
    views: '22M',
    tenure: '4 months',
    leads: '100+',
    leadsLabel: 'organic leads / mo',
  },
  {
    company: 'How To Home Service',
    url: 'https://www.instagram.com/howtohomeservice/',
    image: '/pov-testimonials/how-to-home-service.png',
    quote:
      "Seventy-five days in and we've already done 4.8 million organic views. The phone rings with 56 new leads a month from people who found us on a reel. POV is the cheapest marketing we've ever run.",
    views: '4.8M',
    tenure: '75 days',
    leads: '56',
    leadsLabel: 'new leads / mo',
  },
  {
    company: 'General Enjay',
    url: 'https://www.instagram.com/general_enjay/reels/',
    image: '/pov-testimonials/general-enjay.png',
    quote:
      "6.3 million organic views and the work just follows. Last month alone POV content brought in 141 new leads. I'll never go back to chasing ads — the footage does the selling for me.",
    views: '6.3M',
    tenure: '5.6 months',
    leads: '141',
    leadsLabel: 'new leads last month',
  },
]
