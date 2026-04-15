# Money Model Organizer — Development Plan

Feature: a client-dashboard page where owners can see, edit, and organize their Hormozi-style money model (attraction / core / upsell / downsell / continuity offers), map offers to milestones in the customer journey, and maintain a Skool-style classroom library for each offer's sales pitch + servicing detail.

Grounded in [CRUCIBLE_CONTEXT.md](CRUCIBLE_CONTEXT.md) — voice is small-business-owner simple, framework is Hormozi $100M Offers / Money Models.

---

## Data Model

### `offers`
```
id                  uuid pk
user_id             uuid fk → profiles(id) on delete cascade
name                text                   -- "Offer Name"
offer_type          text check in ('attraction','core','upsell','downsell','continuity')
price               text                   -- "How much does it cost" (text: "Free", "$99/mo", "15% of…")
what_customer_gets  text
why_do_it           text
when_offered        text
trigger             text                   -- "What triggers the need to offer it"
sales_pitch         text                   -- "What should I say to sell it"
-- Classroom view
thumbnail_url       text
short_description   text
video_url           text                   -- pasted YouTube or Loom URL
classroom_body      text                   -- TipTap HTML/JSON for full sales + service detail
sort_order          int default 0          -- order within kanban column
is_active           bool default true
created_at / updated_at
```

### `milestones`
```
id           uuid pk
user_id      uuid fk → profiles(id) on delete cascade
name         text                          -- e.g. "First service scheduled", "90 days in"
description  text
sort_order   int                           -- chronological on timeline
created_at / updated_at
```

### `milestone_offers`
```
milestone_id uuid fk → milestones(id) on delete cascade
offer_id     uuid fk → offers(id) on delete cascade
sequence     int                           -- 1st, 2nd, 3rd offer at that milestone
pk (milestone_id, offer_id)
```

RLS: user can CRUD their own rows; admin role can read all.

---

## Three Views on `/dashboard/money-model`

Tabbed layout (sticky tabs below page header).

### View 1 — Overview (Kanban)
- Columns: **Attraction · Core · Upsell · Downsell · Continuity**
- Card front: name, price, short "what customer gets" line, type badge
- Expand → side drawer with the full 8-field offer template
- dnd-kit: drag between columns to change `offer_type`; drag within column to update `sort_order`
- "+ Add offer" per column

### View 2 — Customer Journey (Timeline)
- Horizontal timeline of milestones (vertical on mobile)
- Each milestone node: name + description, numbered offer stack below showing sequence (1st / 2nd / 3rd)
- dnd-kit: reorder offers within a milestone (updates `sequence`); drag offer between milestones (updates FK); reorder milestones themselves
- "+ Add milestone" at end; "+ Attach offer" per milestone (picker from existing `offers`)

### View 3 — Classroom (Skool-style library)
- Grid of cards: horizontal 16:9 thumbnail, offer title, short description
- Click → full-page detail at `/dashboard/money-model/classroom/[offerId]`:
  - H1 title
  - Embedded video at top (paste YouTube or Loom URL — server parses to embed URL)
  - Large content body below (TipTap rich-text editor) for sales pitch + service detail
  - Edit button flips body into editor mode

**Video handling:** paste-a-URL only (YouTube or Loom). Helper `lib/video/embed.ts` detects provider and returns embed URL (`youtube.com/embed/<id>` or `loom.com/embed/<id>`). No uploads, no Supabase Storage bucket needed.

**Rich text:** TipTap with StarterKit + Link + Image extensions. Store as HTML string in `classroom_body`.

---

## Routes & API

### Pages
- `app/(app)/dashboard/money-model/page.tsx` — tabbed shell (server component fetches all data)
- `app/(app)/dashboard/money-model/classroom/[offerId]/page.tsx` — Skool-style detail

### API
- `POST   /api/offers` — create
- `PATCH  /api/offers/[id]` — update any field (incl. `offer_type`, `sort_order`)
- `DELETE /api/offers/[id]` — soft delete (`is_active=false`)
- `POST   /api/offers/seed` — one-time seed from `business_metrics.offers` JSONB
- `POST   /api/milestones` · `PATCH /api/milestones/[id]` · `DELETE /api/milestones/[id]`
- `POST   /api/milestones/[id]/offers` — attach offer (creates `milestone_offers` row)
- `PATCH  /api/milestones/[id]/offers/[offerId]` — update `sequence` or move to another milestone
- `DELETE /api/milestones/[id]/offers/[offerId]` — detach

All routes use `createClient()` from `lib/supabase/server.ts` and rely on RLS for auth.

---

## Dashboard Entry Tile

Add a "Money Model" summary tile on main `/dashboard`:
- Count per column (e.g. "2 attraction · 1 core · 3 upsell · 0 downsell · 1 continuity")
- Gap warnings: "No continuity offer" / "No milestones mapped yet"
- Links to `/dashboard/money-model` (default tab = Overview)

---

## Build Phases

- [ ] **Phase 1 — Schema & API.** Migration for `offers`, `milestones`, `milestone_offers` + RLS + CRUD routes.
- [ ] **Phase 2 — Overview (Kanban).** Read-only render → edit drawer → dnd-kit drag.
- [ ] **Phase 3 — Classroom view.** Grid + detail page + URL-to-embed helper + TipTap editor for `classroom_body`.
- [ ] **Phase 4 — Customer Journey (Timeline).** Milestone CRUD, attach offers, drag to reorder both levels.
- [ ] **Phase 5 — Intake seed.** Auto-create offer rows from `business_metrics.offers` JSONB on first visit.
- [ ] **Phase 6 — Dashboard tile.** Summary + gap warnings on main dashboard.

---

## Dependencies to Add
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`

---

## Verification per Phase
- **Phase 1:** Supabase SQL editor — insert/update/delete rows as a test user, confirm RLS blocks cross-user reads.
- **Phase 2:** Create offers, drag between columns, reload — order persists.
- **Phase 3:** Paste a Loom + YouTube URL, confirm both embed correctly; edit classroom body, reload.
- **Phase 4:** Create 2 milestones + attach 3 offers to each; reorder; confirm `sequence` reflects DOM order.
- **Phase 5:** User with existing `business_metrics.offers` hits the page fresh — offers appear pre-populated.
- **Phase 6:** Main dashboard shows accurate counts + correct gap warnings.
