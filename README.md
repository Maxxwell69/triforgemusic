# Tri Forge Music Studio

Internal AI music generation tool for Tri Forge Media. Staff generate tracks from
text prompts (genre tags, optional lyrics, duration); a persistent library keeps a
history of everything generated. Built to grow into a client-facing tier later.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind)
- **fal.ai** hosted API running [ACE-Step](https://github.com/ace-step/ACE-Step) (Apache 2.0 license) for text-to-music generation
- **Postgres** (Railway addon) for the track library
- Lightweight cookie-based staff passcode gate (`STAFF_PASSCODE`) — not real multi-user auth yet, see below

## Environment variables

Copy `.env.example` to `.env.local` for local dev:

- `FAL_KEY` — API key from [fal.ai](https://fal.ai)
- `STAFF_PASSCODE` — shared passphrase staff use to log in
- `DATABASE_URL` — Postgres connection string (Railway injects this automatically when you link the Postgres addon via a variable reference)
- `PGSSL` — set to `true` only if connecting to Postgres over a public/non-internal URL

## Local development

```bash
npm install
npm run dev
```

## Deploying on Railway

1. Create a Postgres addon in the project.
2. On the app service, add a **Variable Reference** to the Postgres addon's `DATABASE_URL`.
3. Set `FAL_KEY` and `STAFF_PASSCODE` on the app service.
4. Railway builds with Nixpacks and runs `npm run build` / `npm run start` automatically (see `railway.json`).

## Roadmap notes

- `tracks.owner_role` is already `staff | client` — a client-facing generation tier can reuse the same table without a schema change.
- The passcode gate is intentionally minimal for an internal MVP. Before any client ever logs in directly, replace it with real per-user/per-client auth (e.g. NextAuth, or Railway's own auth patterns) — the shared passcode should never be exposed outside staff.
