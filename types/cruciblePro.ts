export const TASK_STATUSES = ['new', 'done', 'not_done'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  new: 'New',
  done: 'Done',
  not_done: 'Not Done',
}

export const ROCK_STATUSES = ['active', 'completed', 'abandoned'] as const
export type RockStatus = (typeof ROCK_STATUSES)[number]

export interface TeamMember {
  id: string
  user_id: string
  name: string
  position: string | null
  phone: string | null
  email: string | null
  accountabilities: string[]
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  user_id: string
  ghl_event_id: string | null
  title: string
  starts_at: string
  ends_at: string | null
  guests: string[]
  meeting_link: string | null
  notes: string | null
  last_synced_at: string | null
  created_at: string
  updated_at: string
}

export interface TranscriptSegment {
  start_seconds: number
  speaker?: string | null
  text: string
}

export interface CallRecording {
  id: string
  user_id: string
  appointment_id: string | null
  title: string
  call_date: string
  zoom_recording_url: string | null
  transcript_raw: string | null
  transcript_segments: TranscriptSegment[] | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  accountable_team_member_id: string | null
  accountable_name: string | null
  call_recording_id: string | null
  status: TaskStatus
  sort_order: number
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Rock {
  id: string
  user_id: string
  title: string
  description: string | null
  target_date: string | null
  status: RockStatus
  created_at: string
  updated_at: string
}

export interface BillingSnapshot {
  monthly_consulting_fee: number | null
  client_agreement_url: string | null
  next_billing_date: string | null
  current_period_end: string | null
  status: string
  plan_type: string | null
  stripe_customer_id: string | null
  has_stripe_subscription: boolean
}

export interface ClientOption {
  id: string
  email: string
  full_name: string | null
  crucible_pro_status: string | null
}
