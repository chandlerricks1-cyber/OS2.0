-- Per-client custom retainer billing
-- Adds stripe_product_id to subscriptions (one Product per client)
-- and a crucible_pro_invoices ledger that mirrors Stripe invoices
-- (subscription cycles + one-offs) into the app DB for in-app history.

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;

CREATE TABLE IF NOT EXISTS crucible_pro_invoices (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_invoice_id        TEXT UNIQUE NOT NULL,
  stripe_subscription_id   TEXT,
  stripe_customer_id       TEXT,
  invoice_type             TEXT NOT NULL
                              CHECK (invoice_type IN ('subscription_cycle','one_off')),
  amount_cents             INTEGER NOT NULL,
  currency                 TEXT NOT NULL DEFAULT 'usd',
  status                   TEXT NOT NULL,  -- draft | open | paid | void | uncollectible
  description              TEXT,
  hosted_invoice_url       TEXT,
  invoice_pdf_url          TEXT,
  number                   TEXT,
  finalized_at             TIMESTAMPTZ,
  sent_at                  TIMESTAMPTZ,
  paid_at                  TIMESTAMPTZ,
  voided_at                TIMESTAMPTZ,
  due_date                 TIMESTAMPTZ,
  metadata                 JSONB NOT NULL DEFAULT '{}',
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS crucible_pro_invoices_user_idx
  ON crucible_pro_invoices (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS crucible_pro_invoices_status_idx
  ON crucible_pro_invoices (status);

ALTER TABLE crucible_pro_invoices ENABLE ROW LEVEL SECURITY;

-- Clients see their own invoices
CREATE POLICY "Users can view own invoices" ON crucible_pro_invoices
  FOR SELECT USING (auth.uid() = user_id);

-- Admins see all invoices (uses public.is_admin() helper from 20260416_crucible_pro)
CREATE POLICY "Admins can view all invoices" ON crucible_pro_invoices
  FOR SELECT USING (public.is_admin());

-- Writes are admin/server only (server actions + webhook use supabaseAdmin which
-- bypasses RLS); no INSERT/UPDATE policies are intentionally defined.
