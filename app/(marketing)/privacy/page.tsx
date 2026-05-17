import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'

export const metadata = {
  title: 'Privacy Policy | Crucible Coaching',
  description:
    'How Crucible Coaching LLC collects, uses, and protects your information, including our SMS/text messaging policy.',
}

export default function PrivacyPolicyPage() {
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
          Privacy Policy for Crucible users
        </h1>
        <p className="mt-3 text-sm text-zinc-500">Effective Date: May 16, 2026</p>

        <div className="mt-10 space-y-5 text-zinc-700 leading-relaxed [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:font-medium [&_a]:text-zinc-900 [&_a]:underline [&_a]:underline-offset-2">
          <p>
            Welcome to Crucible Coaching (&ldquo;Company,&rdquo; &ldquo;we,&rdquo;
            &ldquo;our,&rdquo; or &ldquo;us&rdquo;).
          </p>
          <p>
            Crucible Coaching LLC, doing business as Crucible, is committed to
            protecting your privacy and maintaining transparency regarding how
            we collect, use, and protect your information.
          </p>
          <p>
            This Privacy Policy explains how information is collected through
            our website, communication systems, and services, including SMS/text
            messaging communications powered by Twilio.
          </p>
          <p>
            By using our website or services, you agree to the practices
            described in this Privacy Policy.
          </p>

          <h2>1. Information We Collect</h2>
          <p>We may collect the following categories of information:</p>

          <h3>Personal Information</h3>
          <p>
            When you interact with us, submit a form, schedule a call, apply for
            coaching, or communicate with us, we may collect:
          </p>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Business information</li>
            <li>Billing information</li>
            <li>Social media handles</li>
            <li>Any information you voluntarily provide</li>
          </ul>

          <h3>Automatically Collected Information</h3>
          <p>When you visit our website, we may automatically collect:</p>
          <ul>
            <li>IP address</li>
            <li>Browser type</li>
            <li>Device information</li>
            <li>Pages visited</li>
            <li>Referral source</li>
            <li>Cookies and analytics data</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We may use your information to:</p>
          <ul>
            <li>Provide coaching, consulting, and educational services</li>
            <li>Respond to inquiries and support requests</li>
            <li>Send appointment reminders and service updates</li>
            <li>Deliver marketing and promotional communications</li>
            <li>Improve our website, systems, and user experience</li>
            <li>Process transactions and payments</li>
            <li>Maintain legal and operational compliance</li>
          </ul>

          <h2>3. SMS/Text Messaging Policy</h2>
          <p>
            By submitting your phone number through our website, forms,
            scheduling systems, or other communication channels, you consent to
            receive SMS/text messages from Crucible Coaching LLC (DBA Crucible).
          </p>
          <p>These messages may include:</p>
          <ul>
            <li>Appointment reminders</li>
            <li>Application updates</li>
            <li>Coaching communications</li>
            <li>Customer support</li>
            <li>Marketing and promotional messages</li>
          </ul>

          <h3>Message Frequency</h3>
          <p>
            Message frequency may vary depending on your interaction with our
            services.
          </p>

          <h3>Message &amp; Data Rates</h3>
          <p>
            Standard message and data rates may apply based on your mobile
            carrier plan.
          </p>

          <h3>Opt-Out Instructions</h3>
          <p>You may opt out of SMS communications at any time by replying:</p>
          <ul>
            <li>STOP</li>
            <li>UNSUBSCRIBE</li>
            <li>CANCEL</li>
          </ul>
          <p>
            After opting out, you will no longer receive SMS messages unless you
            opt back in.
          </p>

          <h3>Help Instructions</h3>
          <p>
            For assistance, reply HELP or contact us through our website:{' '}
            <Link href="/">Crucible Coaching Contact Page</Link>.
          </p>

          <h3>SMS Consent Protection</h3>
          <p>
            SMS consent and phone numbers collected for SMS purposes will not be
            sold, rented, or shared with third parties or affiliates for
            marketing purposes.
          </p>

          <h2>4. Sharing of Information</h2>
          <p>We do not sell your personal information.</p>
          <p>
            We may share information with trusted third-party service providers
            that help us operate our business, including:
          </p>
          <ul>
            <li>CRM and marketing platforms</li>
            <li>Payment processors</li>
            <li>Scheduling software</li>
            <li>Email and SMS communication providers</li>
            <li>Analytics providers</li>
          </ul>
          <p>
            These providers are only given access to information necessary to
            perform their services.
          </p>
          <p>
            We may also disclose information if required by law or to protect
            our legal rights.
          </p>

          <h2>5. Cookies &amp; Tracking Technologies</h2>
          <p>
            Our website may use cookies, pixels, analytics tools, and similar
            technologies to:
          </p>
          <ul>
            <li>Understand website traffic</li>
            <li>Improve performance</li>
            <li>Personalize user experience</li>
            <li>Measure marketing effectiveness</li>
          </ul>
          <p>You may disable cookies through your browser settings.</p>

          <h2>6. Data Security</h2>
          <p>
            We implement reasonable administrative, technical, and physical
            safeguards designed to protect your information from unauthorized
            access, disclosure, or misuse.
          </p>
          <p>
            However, no method of internet transmission or electronic storage is
            completely secure, and we cannot guarantee absolute security.
          </p>

          <h2>7. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites or services.
            We are not responsible for the privacy practices or content of those
            third parties.
          </p>

          <h2>8. Children&apos;s Privacy</h2>
          <p>
            Our services are not intended for individuals under the age of 18.
            We do not knowingly collect personal information from minors.
          </p>

          <h2>9. Your Rights</h2>
          <p>
            Depending on your location and applicable laws, you may have rights
            regarding your personal information, including:
          </p>
          <ul>
            <li>Accessing your information</li>
            <li>Correcting inaccurate information</li>
            <li>Requesting deletion</li>
            <li>Opting out of marketing communications</li>
          </ul>
          <p>
            To make a request, contact us through:{' '}
            <Link href="/">Crucible Coaching</Link>.
          </p>

          <h2>10. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy periodically. Any changes will be
            posted on this page with an updated effective date.
          </p>

          <h2>11. Contact Information</h2>
          <p>
            Crucible Coaching LLC (DBA Crucible)
            <br />
            Arizona, United States
            <br />
            Website:{' '}
            <a href="https://cruciblecoaching.org">cruciblecoaching.org</a>
          </p>
          <p>
            For questions regarding this Privacy Policy or your data, please
            contact us through our website.
          </p>
        </div>
      </main>

      <footer className="border-t border-zinc-200">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-zinc-500 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} Crucible Coaching LLC. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-zinc-900 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-zinc-900 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
