import Link from 'next/link'

export default function BookACallPage() {
  return (
    <div className="max-w-xl mx-auto text-center py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        Ready to implement your plan?
      </h1>
      <p className="text-gray-500 max-w-md mx-auto mb-8">
        Book a 1-on-1 strategy call to walk through your CAC report, prioritize
        your opportunities, and build your implementation roadmap together.
      </p>

      <a
        href="https://calendly.com/YOUR_LINK_HERE"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-gray-900 text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        Book a Strategy Call
      </a>

      <div className="mt-10 text-left max-w-sm mx-auto space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-green-500 flex-shrink-0 mt-0.5">&#10003;</span>
          <p className="text-sm text-gray-600">Review your full CAC analysis together</p>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-green-500 flex-shrink-0 mt-0.5">&#10003;</span>
          <p className="text-sm text-gray-600">Prioritize your top 3 revenue opportunities</p>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-green-500 flex-shrink-0 mt-0.5">&#10003;</span>
          <p className="text-sm text-gray-600">Build a 90-day implementation roadmap</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-10">
        Already have your report?{' '}
        <Link href="/dashboard/report" className="text-gray-600 hover:text-gray-900 underline">
          View it here
        </Link>
      </p>
    </div>
  )
}
