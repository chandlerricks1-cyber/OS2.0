# Crucible OS

Crucible OS is a Next.js SaaS app for Crucible Coaching — a fractional CRO service for pest control companies ($1M–$15M ARR). The app handles marketing, AI-powered intake, CRO reports, client dashboards, and admin tooling.

For business context (pricing, voice, audience, frameworks), read `docs/CRUCIBLE_CONTEXT.md`.

## Tech Stack

- **Framework:** Next.js 14.2.18 (App Router), React 18, TypeScript (strict)
- **Database & Auth:** Supabase (PostgreSQL + Auth + RLS)
- **AI — Intake chat:** Google Gemini 2.5 Flash (`@google/generative-ai`) — NOT Anthropic
- **AI — Reports & offers:** Anthropic Claude (`@anthropic-ai/sdk`)
- **Payments:** Stripe (subscriptions + one-time payments, live mode)
- **CRM:** GoHighLevel (appointments, contacts, pipelines)
- **Styling:** Tailwind CSS 3 + Radix UI + shadcn components
- **Rich text:** TipTap (classroom content editor)
- **Charts:** Recharts
- **Drag & drop:** dnd-kit (kanban boards)
- **Deployment:** Vercel (auto-deploy from GitHub)

## Path Alias

`@/*` maps to the project root. Use `@/lib/...`, `@/components/...`, `@/types/...` etc.

## Project Structure

```
app/
  (marketing)/    — Public pages: landing, podcast, podcast intake
  (auth)/         — Login, signup
  (app)/          — Protected routes (requires auth)
    dashboard/    — Main client dashboard, report, settings
    dashboard/admin/        — Admin CRM, podcast mgmt, integrations
    dashboard/money-model/  — Offers, milestones, classroom
    dashboard/crucible-pro/ — Appointments, tasks, rocks, team, recordings
    intake/       — AI chat session (free tier)
  api/            — 39 API route handlers
components/       — Organized by feature (admin/, crucible-pro/, dashboard/, intake/, money-model/, settings/, shared/, ui/)
lib/              — Shared libraries
  supabase/       — client.ts (browser), server.ts (SSR), admin.ts (service role)
  claude/         — intake.ts, report.ts, offers.ts
  stripe/         — client.ts, webhooks.ts
  ghl/            — client.ts (GoHighLevel API wrapper)
  utils/          — cn.ts (classnames), metrics.ts (financial calculations)
  actions.ts      — Server actions (tags, profile, Crucible Pro grants)
hooks/            — useChat, useMetrics, useSubscription, useSidebarCollapsed, useSystemTheme
types/            — database.ts (auto-generated Supabase types), cruciblePro.ts, offer.ts, intake.ts
supabase/         — schema.sql + migrations/
docs/             — CRUCIBLE_CONTEXT.md, SETUP.md, MONEY_MODEL_PLAN.md
```

## Supabase Client Patterns

There are THREE Supabase client patterns — use the right one:

1. **`createClient()` from `@/lib/supabase/server`** — Server components & API routes. Uses cookies for auth. User-scoped (respects RLS).
2. **`createClient()` from `@/lib/supabase/client`** — Browser/client components. User-scoped.
3. **`supabaseAdmin` from `@/lib/supabase/admin`** — Singleton, NO cookies. Bypasses RLS. Use for admin operations and fire-and-forget contexts (after response is sent).

**Never** use the admin client where the server client would suffice. The admin client bypasses RLS.

## Auth & Middleware

- Middleware (`middleware.ts`) protects all routes except: `/`, `/login`, `/signup`, `/podcast/*`, `/api/podcast/*`
- Admin routes (`/dashboard/admin/*`) require `profiles.role = 'admin'`
- API routes check auth with: `const { data: { user } } = await supabase.auth.getUser()`
- Unauthorized = `NextResponse.json({ error: 'Unauthorized' }, { status: 401 })`

## API Route Pattern

All API routes follow this pattern:
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // ... query with supabase (user-scoped via RLS)
  return NextResponse.json(data)
}
```

## Database

- Schema at `supabase/schema.sql`, migrations in `supabase/migrations/`
- Auto-generated types at `types/database.ts` — use `Tables<'table_name'>` for row types
- All tables have RLS enabled. Users see only their own data.
- Key tables: `profiles`, `business_metrics`, `intake_sessions`, `intake_messages`, `reports`, `subscriptions`, `offers`, `milestones`, `crucible_tasks`, `crucible_rocks`, `crucible_appointments`, `crucible_call_recordings`, `crucible_team_members`

## Streaming AI Responses

The intake chat (`/api/intake`) streams responses using `ReadableStream` with custom sentinels:
- `[CRUCIBLE_COMPLETE]` — signals conversation phase is done
- `[CRUCIBLE_ERROR:message]` — signals an error (NOT `controller.error()`, which drops TCP)
- `[METRIC_UPDATE:{"key":value}]` — inline metric extraction during streaming

## Stripe

- Checkout creates session via `/api/stripe/checkout` (supports `subscription` and `payment` modes)
- Webhook handler at `lib/stripe/webhooks.ts` handles: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- Subscription data stored in `subscriptions` table

## GoHighLevel (GHL)

- API wrapper at `lib/ghl/client.ts` with `ghlFetch()` helper
- 5-minute in-memory cache for pipeline data
- Used for: calendar sync, contact management, pipeline/opportunity tracking

## Rate Limiting

AI-calling routes (`/api/intake`, `/api/report`, `/api/offers/generate`) use `@upstash/ratelimit` with a sliding window of 10 requests per 60 seconds per user. The shared utility is at `lib/ratelimit.ts`. Requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` env vars.

## Known Issues

- No test framework or test files exist
- No CI/CD pipeline (relies on Vercel auto-deploy)
- No error boundaries (`error.tsx` files)

## Commands

```bash
npm run dev    # Start dev server (localhost:3000)
npm run build  # Production build
npm run lint   # ESLint check
```
