# Crucible Context

The canonical business brief for Crucible OS. Read this first. When building features, copy, or flows in this repo, check decisions against positioning, pricing, voice, and exclusivity rules below before shipping.

---

## 1. What Crucible Is

Crucible (cruciblecoaching.org) is a B2B consulting business positioned as a **fractional Chief Revenue Officer (CRO) service for home service companies**. Initial vertical: **pest control businesses doing $1M–$15M/year**. Target profile: operational capacity to scale, but stagnant growth or misaligned profit. Founder Chandler Ricks brings ~9 years in sales, marketing, and operations.

Crucible OS is the web app + dashboard that supports this business — marketing site, intake, CRO reports, client dashboards, and internal tooling.

## 2. Target Customer

- Business owners, $1M–$15M ARR
- Operationally capable but growth-stagnant or margin-misaligned
- ~400-contact Apollo.io outreach list of pest control owners built
- Small-business owners — vocabulary and UX should match that audience, not enterprise buyers

## 3. Offer & Pricing

- **Monthly fee:** 0.2% of client annual revenue, billed monthly (range: $5K–$12K/month)
- **Minimum commitment:** 3 months
- **Guarantee:** Conditional 90-day Revenue Confidence Guarantee
- **Exclusivity:** One company per state — hard differentiator, not a marketing tactic. Enforce in intake/sales flow.

## 4. Strategic Frameworks

- Alex Hormozi's $100M series (*Offers*, *Leads*, *Money Models*) — primary strategic reference
- **Client-financed acquisition** (Hormozi) shapes offer/pricing structure
- **"Rapid scaling season"** — frames growth as a defined internal company moment, making the offer feel timely rather than open-ended

## 5. Voice & Messaging Principles

- **Bullet frameworks, not verbatim scripts** — Chandler riffs from frameworks; don't write word-for-word dialogue
- **Simple small-business-owner vocabulary** — no MBA jargon, no enterprise-speak
- **High-level over granular** — concepts first, details on request
- **Clean audience-facing materials** — strip presenter/coaching/instructional language from anything a prospect sees
- **Consultant objection reframe:** "Just because you had a bad date doesn't mean you can't find the love of your life" — use this framing when addressing past bad consultant experiences
- **Two-round interview pattern** — when developing content in Chandler's voice, interview first to extract natural language, then draft. Produces more authentic output than drafting cold.

## 6. Stack & Tools

Business stack:
- **Go High Level** — CRM
- **Apollo.io** — prospecting
- **Skool** — community
- **Meta Ads** — paid acquisition
- **Stripe** — payments (live mode)

Product stack (this repo): Next.js 14, Supabase, Gemini AI, Stripe, Vercel + GitHub. See `SETUP.md` for technical setup.

## 7. Active Deliverables

Source-of-truth documents produced outside the repo:
- **Launch Strategy Report** — pricing, competitive landscape, guarantee framework, gap analysis
- **Operations Playbook** — Revenue Audit framework, sales script, onboarding system, services agreement legal brief
- **Cold Email + Loom Video Outreach Playbook**

Current focus: cold outreach to the pest control list + refining the sales process.

## 8. How to Use This Doc

Before shipping feature copy, pricing logic, intake flows, or positioning changes:
1. Check pricing tiers and terms against §3.
2. Check voice against §5 — especially for anything prospect-facing.
3. Enforce one-company-per-state (§3) in any state/intake logic.
4. When in doubt about audience framing, default to small-business-owner vocabulary (§2, §5).

Update this file when strategy shifts — pricing changes, new vertical, positioning pivot, new guarantee terms. Treat it as living source of truth, not an archive.
