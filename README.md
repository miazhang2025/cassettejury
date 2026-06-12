# Cassette Jury

A pocket jury for creative deadlocks. Pick nine AI jurors — each with their own job, taste, and agenda — ask them an open-ended creative question, watch them physically brawl over it on a 3D stage, and read the deliberation as it streams in. Then the verdict comes down.

Built by Mia & Ingrid. Not a research tool — a delightful, slightly absurd alternative to running a focus group when you have no time and no budget.

**[Project write-up](/writeup)** · [cabbageblame.me](https://cabbageblame.me)

## How it works

- **Landing** (`/`): choose 9 of 16 jurors. Each tile is a pre-rendered WebP portrait of the juror's 3D model.
- **Stage** (`/jury`): the chosen jurors load as GLB models on a Three.js stage with a custom physics brawl. Submitting a question calls Claude (Anthropic API), which deliberates in-character and streams back NDJSON — one juror verdict per line — so opinions appear live while the fight plays out. The final line is the verdict.
- **Share**: the verdict renders to a downloadable share card (`html-to-image`), or copies as text.

## Stack

- Next.js (App Router) + React + TypeScript + Tailwind 4
- Three.js for the stage; custom physics in `utils/physics.ts`
- `@anthropic-ai/sdk` streaming in `app/api/jury/route.ts`; jury personas and the NDJSON protocol live in `config/juries.ts` and `config/prompts.ts`
- Admin character generator under `/admin` (password-gated via `proxy.ts`)

## Running locally

```bash
npm install
npm run dev
```

Environment (`.env.local`):

| Variable | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Server-side Claude key powering the jury (required) |
| `ADMIN_PASSWORD` | Gates `/admin` and the character-generator API routes |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for Open Graph metadata |

Visitors use the hosted key automatically. A personal Anthropic key can still be set from the in-experience settings menu; it is kept in `sessionStorage` and sent only with jury requests.

## Asset pipeline

Juror thumbnails, WebP backgrounds, and the OG image are generated from the source PNGs:

```bash
node scripts/generate-images.mjs
```
