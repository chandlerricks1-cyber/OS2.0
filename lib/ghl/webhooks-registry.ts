// All GHL webhook event types we handle (or plan to handle).
// Used by the admin /webhooks/register route to set up subscriptions.
export const GHL_WEBHOOK_EVENTS = [
  'ContactCreate',
  'ContactUpdate',
  'ContactDelete',
  'ContactTagUpdate',
  'ContactDndUpdate',
  'InboundMessage',
  'OutboundMessage',
  'ConversationUnreadUpdate',
  'AppointmentCreate',
  'AppointmentUpdate',
  'AppointmentDelete',
  'OpportunityCreate',
  'OpportunityUpdate',
  'OpportunityDelete',
  'OpportunityStageUpdate',
  'OpportunityStatusUpdate',
] as const

export type GhlWebhookEvent = (typeof GHL_WEBHOOK_EVENTS)[number]
