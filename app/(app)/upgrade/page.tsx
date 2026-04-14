import Link from 'next/link'
import { Check, Calendar } from 'lucide-react'
import { BookCallButton } from '@/components/dashboard/BookCallButton'

export default function BookACallPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center shadow-[0_8px_24px_rgba(255,136,0,0.25)]">
          <Calendar className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 mb-4">
          Ready to implement{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
            your plan?
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-lg mx-auto">
          Book a 1-on-1 strategy call to walk through your CAC report, prioritize
          your opportunities, and build your implementation roadmap together.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-[25px] p-8 shadow-card-soft">
        <ul className="space-y-4 mb-8">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center mt-0.5">
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </span>
            <p className="text-sm text-gray-700">Review your full CAC analysis together</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center mt-0.5">
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </span>
            <p className="text-sm text-gray-700">Prioritize your top 3 revenue opportunities</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center mt-0.5">
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </span>
            <p className="text-sm text-gray-700">Build a 90-day implementation roadmap</p>
          </li>
        </ul>

        <div className="flex justify-center">
          <BookCallButton variant="gradient" label="Book a Strategy Call" />
        </div>
      </div>

      <p className="text-sm text-gray-400 text-center mt-8">
        Already have your report?{' '}
        <Link href="/dashboard/report" className="text-brand-orange-dark hover:text-brand-orange underline font-medium">
          View it here
        </Link>
      </p>
    </div>
  )
}
