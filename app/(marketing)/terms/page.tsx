import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'

export const metadata = {
  title: 'Terms & Conditions | Crucible Coaching',
  description:
    'The terms and conditions governing your use of Crucible Coaching LLC services, coaching, programs, content, and communications.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
          Terms &amp; Conditions for Crucible Coaching LLC (DBA Crucible)
        </h1>
        <p className="mt-3 text-sm text-zinc-500">Effective Date: May 16, 2026</p>

        <div className="mt-10 space-y-5 text-zinc-700 leading-relaxed [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:font-medium [&_a]:text-zinc-900 [&_a]:underline [&_a]:underline-offset-2">
          <p>
            Welcome to Crucible Coaching (&ldquo;Company,&rdquo; &ldquo;we,&rdquo;
            &ldquo;our,&rdquo; or &ldquo;us&rdquo;). These Terms &amp; Conditions
            (&ldquo;Terms&rdquo;) govern your use of our website, services,
            programs, coaching, content, and communications.
          </p>
          <p>
            By accessing or using our website or services, you agree to be bound
            by these Terms.
          </p>

          <h2>1. Use of Website &amp; Services</h2>
          <p>
            You agree to use our website and services only for lawful purposes
            and in accordance with these Terms.
          </p>
          <p>You must not:</p>
          <ul>
            <li>Use the website in any way that violates applicable laws or regulations</li>
            <li>Attempt to gain unauthorized access to systems or data</li>
            <li>Copy, distribute, or exploit our content without written permission</li>
            <li>Interfere with the operation or security of the website</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate access to our services
            at our discretion.
          </p>

          <h2>2. Coaching &amp; Educational Disclaimer</h2>
          <p>
            Crucible Coaching LLC provides coaching, consulting, educational
            content, mentorship, and business guidance.
          </p>
          <p>We do not guarantee:</p>
          <ul>
            <li>Specific financial results</li>
            <li>Business success</li>
            <li>Revenue generation</li>
            <li>Client acquisition</li>
            <li>Personal outcomes</li>
          </ul>
          <p>
            Any testimonials, examples, or case studies shared by us are
            illustrative only and are not guarantees of future performance.
          </p>
          <p>
            Your results depend on many factors including effort, experience,
            market conditions, execution, and personal circumstances.
          </p>

          <h2>3. No Professional Advice</h2>
          <p>
            The information provided through our website, programs, coaching,
            or communications is for educational and informational purposes
            only.
          </p>
          <p>Nothing provided by Crucible Coaching LLC constitutes:</p>
          <ul>
            <li>Legal advice</li>
            <li>Financial advice</li>
            <li>Tax advice</li>
            <li>Investment advice</li>
            <li>Medical or mental health advice</li>
          </ul>
          <p>
            You should consult qualified professionals before making business,
            legal, financial, or tax decisions.
          </p>

          <h2>4. Payments &amp; Refunds</h2>
          <p>
            By purchasing any product or service from Crucible Coaching LLC,
            you agree to provide accurate payment information and authorize us
            to charge the applicable fees.
          </p>
          <p>Unless otherwise stated in writing:</p>
          <ul>
            <li>All sales are final</li>
            <li>No refunds are guaranteed</li>
            <li>Payment plans must be completed according to agreed terms</li>
          </ul>
          <p>
            Failure to complete payment obligations may result in suspension of
            services and collection actions where permitted by law.
          </p>

          <h2>5. Intellectual Property</h2>
          <p>
            All content provided by Crucible Coaching LLC, including but not
            limited to:
          </p>
          <ul>
            <li>Videos</li>
            <li>Training materials</li>
            <li>Frameworks</li>
            <li>Branding</li>
            <li>Logos</li>
            <li>Website content</li>
            <li>Documents</li>
            <li>Systems</li>
            <li>Marketing materials</li>
          </ul>
          <p>
            are the intellectual property of Crucible Coaching LLC unless
            otherwise stated.
          </p>
          <p>
            You may not reproduce, share, sell, modify, or distribute our
            materials without prior written consent.
          </p>

          <h2>6. User Content &amp; Communications</h2>
          <p>
            If you submit content, feedback, testimonials, comments, or
            materials to us, you grant us a non-exclusive, royalty-free license
            to use, reproduce, and display that content for business and
            marketing purposes unless otherwise agreed in writing.
          </p>
          <p>You agree not to submit unlawful, misleading, or harmful content.</p>

          <h2>7. SMS/Text Messaging Terms</h2>
          <p>
            By providing your phone number and opting into SMS communications,
            you consent to receive text messages from Crucible Coaching LLC
            (DBA Crucible), including:
          </p>
          <ul>
            <li>Appointment reminders</li>
            <li>Customer support messages</li>
            <li>Coaching communications</li>
            <li>Promotional and marketing messages</li>
          </ul>

          <h3>Message Frequency</h3>
          <p>Message frequency may vary.</p>

          <h3>Message &amp; Data Rates</h3>
          <p>Message and data rates may apply.</p>

          <h3>Opt-Out</h3>
          <p>You may opt out at any time by replying:</p>
          <ul>
            <li>STOP</li>
            <li>CANCEL</li>
            <li>UNSUBSCRIBE</li>
          </ul>

          <h3>Assistance</h3>
          <p>
            Reply HELP for assistance or contact us through:{' '}
            <Link href="/">Crucible Coaching</Link>.
          </p>
          <p>Consent to receive SMS messages is not a condition of purchase.</p>

          <h2>8. Third-Party Services</h2>
          <p>
            We may use third-party platforms, software, processors, and
            communication providers to deliver services.
          </p>
          <p>We are not responsible for:</p>
          <ul>
            <li>Third-party outages</li>
            <li>Platform errors</li>
            <li>External service interruptions</li>
            <li>Third-party policies or actions</li>
          </ul>
          <p>
            Your use of third-party services may also be subject to their own
            terms and policies.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Crucible Coaching LLC and
            its owners, officers, employees, contractors, affiliates, and
            partners shall not be liable for:
          </p>
          <ul>
            <li>Indirect damages</li>
            <li>Consequential damages</li>
            <li>Loss of profits</li>
            <li>Loss of business opportunities</li>
            <li>Data loss</li>
            <li>
              Personal or business decisions made based on our content or
              services
            </li>
          </ul>
          <p>Your use of our services is at your own risk.</p>

          <h2>10. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless Crucible Coaching
            LLC from any claims, liabilities, damages, losses, or expenses
            arising from:
          </p>
          <ul>
            <li>Your use of the website or services</li>
            <li>Violation of these Terms</li>
            <li>Violation of applicable laws</li>
            <li>Disputes with third parties</li>
          </ul>

          <h2>11. Governing Law</h2>
          <p>
            These Terms shall be governed and interpreted in accordance with
            the laws of the State of Arizona, without regard to conflict of law
            principles.
          </p>
          <p>
            Any disputes arising from these Terms or use of our services shall
            be resolved in the appropriate courts located in Arizona.
          </p>

          <h2>12. Modifications</h2>
          <p>
            We reserve the right to update or modify these Terms at any time
            without prior notice.
          </p>
          <p>
            Continued use of the website or services after changes are posted
            constitutes acceptance of the revised Terms.
          </p>

          <h2>13. Contact Information</h2>
          <p>
            Crucible Coaching LLC (DBA Crucible)
            <br />
            Arizona, United States
          </p>
          <p>
            Website:{' '}
            <a href="https://cruciblecoaching.org">cruciblecoaching.org</a>
          </p>
        </div>
      </main>

      <footer className="border-t border-zinc-200">
        <div className="mx-auto max-w-4xl px-6 py-8 text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} Crucible Coaching LLC. All rights
          reserved.
        </div>
      </footer>
    </div>
  )
}
