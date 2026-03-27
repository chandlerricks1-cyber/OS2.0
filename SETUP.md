# Crucible — Setup Guide

## 1. Install Node.js

Node.js is not currently installed. Install it via:

```bash
# Option A: Official installer
# Download from https://nodejs.org (LTS version)

# Option B: Homebrew (recommended)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node

# Option C: NVM (manage multiple versions)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install --lts
```

## 2. Install dependencies

```bash
npm install
```

## 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API |
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks → signing secret |
| `STRIPE_MONTHLY_PRICE_ID` | Stripe Dashboard → Products |
| `STRIPE_ONE_TIME_PRICE_ID` | Stripe Dashboard → Products |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for dev |

## 4. Set up Supabase

1. Create a new Supabase project at supabase.com
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. This creates all tables, RLS policies, and the auto-profile trigger

## 5. Set up Stripe

1. Create two products in Stripe:
   - **Monthly subscription**: set a price (e.g. $197/mo), grab the Price ID
   - **One-time payment**: $499 one-time, grab the Price ID
2. Put both Price IDs in `.env.local`
3. For webhooks (local dev):
   ```bash
   npm install -g stripe
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`

## 6. Create admin account

After running the schema, manually set a user's role to `admin`:

```sql
-- In Supabase SQL Editor, after signing up with your email:
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

## 7. Run the app

```bash
npm run dev
```

Open http://localhost:3000

## 8. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add all environment variables in the Vercel dashboard (Settings → Environment Variables).

For the Stripe webhook in production, create a new webhook endpoint in Stripe pointing to:
```
https://your-domain.vercel.app/api/stripe/webhook
```

---

## Architecture Quick Reference

| Path | Purpose |
|---|---|
| `/` | Marketing landing page |
| `/signup` `/login` | Auth |
| `/intake` | AI chat (free, auth required) |
| `/upgrade` | Paywall + Stripe checkout |
| `/dashboard` | Metrics (subscription required) |
| `/dashboard/report` | AI report (subscription required) |
| `/admin` | CRM table (admin role required) |
| `/admin/clients/[id]` | Client detail + transcript |
| `/api/intake` | Streaming Claude endpoint |
| `/api/report` | Report generation |
| `/api/stripe/checkout` | Create checkout session |
| `/api/stripe/webhook` | Stripe event handler |
