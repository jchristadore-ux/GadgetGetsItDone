# Gadget Gets It Done

Local tech setup, fix, connect, and maintain for home and business.

## Setup

1. Copy `.env.example` to `.env` and fill values
2. `npm install`
3. `npx prisma db push`
4. `npm run db:seed`
5. `npm run dev`

Admin bootstrap: set `ADMIN_BOOTSTRAP_TOKEN`, open `/setup`, then magic-link at `/login`.

## Brand

- Logo: `public/brand/logo.jpeg`
- Navy `#0B1F3A`, orange `#F15A29`, yellow sparingly — no teal

## Tests

`npm test` — pricing, authz, webhook signature helpers.
