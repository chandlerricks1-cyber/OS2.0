import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { LeadStatusControl } from '@/components/admin/LeadStatusControl'
import { LeadEditForm } from '@/components/admin/LeadEditForm'
import { LeadDeleteButton } from '@/components/admin/LeadDeleteButton'
import { LeadTagManager } from '@/components/admin/LeadTagManager'
import { ConvertToClientButton } from '@/components/admin/ConvertToClientButton'

export default async function AdminPodcastDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  const adminSupabase = await createAdminClient()

  const { data: lead } = await adminSupabase
    .from('podcast_leads')
    .select('*')
    .eq('id', id)
    .single()

  if (!lead) notFound()

  const { data: intake } = await adminSupabase
    .from('podcast_intake')
    .select('*')
    .eq('lead_id', id)
    .single()

  const { data: guestPrep } = await adminSupabase
    .from('podcast_guest_prep')
    .select('*')
    .eq('lead_id', id)
    .single()

  const { data: tags } = await adminSupabase
    .from('podcast_lead_tags')
    .select('tag')
    .eq('lead_id', id)
    .order('created_at', { ascending: true })

  const tagList = tags?.map((t) => t.tag) ?? []

  // Check if lead has already been converted to a client
  const { data: existingClient } = await adminSupabase
    .from('profiles')
    .select('id')
    .eq('email', lead.email)
    .single()

  return (
    <div>
      {/* Back link */}
      <Link href="/dashboard/admin/podcast" className="text-sm text-gray-500 hover:text-gray-900 mb-6 inline-block">
        &larr; Back to all leads
      </Link>

      {/* Lead Info Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{lead.full_name}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>{lead.email}</span>
                  <span>{lead.phone}</span>
                  <span>
                    Preferred:{' '}
                    {new Date(lead.preferred_date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Submitted {new Date(lead.created_at).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
                  })}
                </div>
              </div>
            </div>

            {/* Edit + Delete controls */}
            <div className="flex items-center gap-4 mt-3">
              <LeadEditForm lead={{ id: lead.id, full_name: lead.full_name, email: lead.email, phone: lead.phone, preferred_date: lead.preferred_date }} />
              <LeadDeleteButton leadId={lead.id} leadName={lead.full_name} />
            </div>
          </div>

          {/* Status */}
          <LeadStatusControl leadId={lead.id} currentStatus={lead.status} />
        </div>

        {/* Tags */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-medium text-gray-500">Tags</span>
          </div>
          <LeadTagManager leadId={lead.id} tags={tagList} />
        </div>

        {/* Convert to Client */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-medium text-gray-500">Client Account</span>
          </div>
          {existingClient ? (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Converted
              </span>
              <Link
                href={`/dashboard/admin/clients/${existingClient.id}`}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View Client Profile &rarr;
              </Link>
            </div>
          ) : (
            <ConvertToClientButton leadId={lead.id} leadName={lead.full_name} leadEmail={lead.email} />
          )}
        </div>
      </div>

      {/* Intake Answers (Prep Sheet) */}
      {!intake ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">Intake questionnaire not yet completed</p>
        </div>
      ) : (
        <div className="space-y-6">
          <IntakeSection title="Business Overview">
            <Field label="Business Name" value={intake.business_name} />
            <Field label="Business Type" value={intake.business_type} />
            <Field label="Industry" value={intake.industry} />
            <Field label="Years in Business" value={intake.years_in_business} />
            <Field label="Business Description" value={intake.business_description} long />
          </IntakeSection>

          <IntakeSection title="Revenue & Money Model">
            <Field label="Monthly Revenue" value={intake.monthly_revenue} />
            <Field label="Revenue Model" value={intake.revenue_model} />
            <Field label="Average Transaction Value" value={intake.average_transaction_value} />
            <Field label="Customer Count" value={intake.customer_count} />
            <Field label="Pricing Structure" value={intake.pricing_structure} long />
          </IntakeSection>

          <IntakeSection title="Customer Acquisition">
            <Field label="Primary Acquisition Channels" value={intake.primary_acquisition_channels} long />
            <Field label="Monthly Ad Spend" value={intake.monthly_ad_spend} />
            <Field label="Estimated CAC" value={intake.estimated_cac} />
            <Field label="Close Rate" value={intake.close_rate} />
            <Field label="Sales Process" value={intake.sales_process} long />
          </IntakeSection>

          <IntakeSection title="Offers & Positioning">
            <Field label="Primary Offer" value={intake.primary_offer} long />
            <Field label="Secondary Offers" value={intake.secondary_offers} long />
            <Field label="Differentiator" value={intake.differentiator} long />
          </IntakeSection>

          <IntakeSection title="Constraints & Goals">
            <Field label="Biggest Constraint" value={intake.biggest_constraint} long />
            <Field label="Tried and Failed" value={intake.tried_and_failed} long />
            <Field label="90-Day Goal" value={intake.goal_next_90_days} long />
            <Field label="Anything Else" value={intake.anything_else} long />
          </IntakeSection>
        </div>
      )}

      {/* Guest Episode Prep (StoryBrand) */}
      {guestPrep ? (
        <div className="space-y-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900">Guest Episode Prep</h2>

          {guestPrep.brand_script && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200/50 p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Generated Brand Script</h3>
              <p className="text-gray-900 text-lg leading-relaxed italic">&ldquo;{guestPrep.brand_script}&rdquo;</p>
            </div>
          )}

          <IntakeSection title="The Hero">
            <Field label="Typical Customer" value={guestPrep.hero} long />
          </IntakeSection>

          <IntakeSection title="The Problem">
            <Field label="External Problem" value={guestPrep.external_problem} long />
            <Field label="Internal Problem" value={guestPrep.internal_problem} long />
            <Field label="What's At Stake" value={guestPrep.whats_at_stake} long />
          </IntakeSection>

          <IntakeSection title="The Guide">
            <Field label="Empathy" value={guestPrep.empathy} long />
            <Field label="Authority" value={guestPrep.authority} long />
          </IntakeSection>

          <IntakeSection title="The Plan">
            <Field label="Step 1" value={guestPrep.plan_step_1} />
            <Field label="Step 2" value={guestPrep.plan_step_2} />
            <Field label="Step 3" value={guestPrep.plan_step_3} />
          </IntakeSection>

          <IntakeSection title="The Win">
            <Field label="Happy Ending" value={guestPrep.the_win} long />
          </IntakeSection>
        </div>
      ) : intake && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center mt-6">
          <p className="text-gray-400">Guest episode prep not yet completed</p>
        </div>
      )}
    </div>
  )
}

function IntakeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, value, long }: { label: string; value: string | null; long?: boolean }) {
  return (
    <div className={long ? '' : 'flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3'}>
      <span className="text-sm font-medium text-gray-500 sm:min-w-[180px] shrink-0">{label}</span>
      {long ? (
        <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{value || <span className="text-gray-300 italic">Not provided</span>}</p>
      ) : (
        <span className="text-sm text-gray-900">{value || <span className="text-gray-300 italic">Not provided</span>}</span>
      )}
    </div>
  )
}
