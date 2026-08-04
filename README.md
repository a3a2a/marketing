# marketing

Marketing Studio — a full-stack Next.js app for content drafting, campaign
management, and reporting. Runs fully offline: no external services, API
keys, or cloud accounts required.

## Tech stack

- **Next.js 16** (App Router) + TypeScript — pages, layouts, and Server
  Actions / Route Handlers all live in this one codebase.
- **Tailwind CSS v4** for styling.
- **Prisma ORM v6** + **SQLite** (`prisma/dev.db`, committed to the repo) as
  the database.
- **Recharts** for the client-side charts on the `/report` dashboard.
- The "AI content generation" feature is a deterministic, in-process
  template generator — no external AI API is ever called.

## Getting started

```bash
npm install
npx prisma migrate dev
npm run dev
```

Then open http://localhost:3000.

## Data model

See `prisma/schema.prisma`. Two core models:

- `ContentDraft` (table `content_drafts`) — `id`, `title`, `type`
  (`ContentType`: `BLOG` | `SNS` | `EMAIL`), `product`, `audience`, `tone`
  (`ContentTone`: `FRIENDLY` | `PROFESSIONAL` | `HUMOROUS` | `TRUSTWORTHY`),
  `keywords` (optional), `body`, `status` (`ContentStatus`: `DRAFT` |
  `PUBLISHED`, default `DRAFT`), `createdAt`, `updatedAt`, and a one-to-many
  relation to `Campaign`.
- `Campaign` (table `campaigns`) — `id`, `name`, `channel`
  (`CampaignChannel`: `BLOG` | `SNS` | `EMAIL` | `ETC`), `status`
  (`CampaignStatus`: `DRAFT` | `SCHEDULED` | `ACTIVE` | `COMPLETED` |
  `PAUSED`, default `DRAFT`), `scheduledDate`, `notes` (optional),
  `contentDraftId` (optional FK to `ContentDraft.id`), `createdAt`,
  `updatedAt`.

Reporting (`/report`) is computed at request time via Prisma
`groupBy`/`count` over these two tables — there is no separate analytics
table.

## Project layout

- `app/` — routes (`/`, `/content`, `/campaign`, `/report`) using the App
  Router.
- `components/Nav.tsx` — the top nav bar, kept separate from
  `app/layout.tsx` so feature work on individual routes never needs to touch
  the shared layout.
- `lib/prisma.ts` — the shared `PrismaClient` singleton; import
  `{ prisma }` from here anywhere you need database access.
- `prisma/schema.prisma` — the data model described above.
