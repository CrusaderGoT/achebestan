<div align="center">

<br />

# ◈ Achebestan

**A modern web fiction reading platform — where stories live.**

[![Status](https://img.shields.io/badge/status-live-brightgreen?style=flat-square&labelColor=0d0d0d)](https://achebestan.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js&logoColor=white&labelColor=0d0d0d)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white&labelColor=0d0d0d)](https://www.typescriptlang.org)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel&logoColor=white&labelColor=0d0d0d)](https://achebestan.vercel.app)
[![Last Commit](https://img.shields.io/github/last-commit/CrusaderGoT/achebestan?style=flat-square&labelColor=0d0d0d&color=555)](https://github.com/CrusaderGoT/achebestan/commits/main)

<br />

> *A place built for fiction that earns its readers.*

<br />

[**→ Visit Achebestan**](https://achebestan.vercel.app)

<br />

---

![Achebestan — add a screenshot here](https://placehold.co/900x480/0d0d0d/444444?text=Add+a+screenshot+of+the+reader+UI)

---

</div>

## Overview

Achebestan is a full-stack web fiction platform built for immersive, distraction-free reading. It hosts serialized fiction — structured around multi-POV narratives, chapter-based progression, and a reading experience that gets out of the way and lets the story speak.

No separate backend. No unnecessary complexity. Everything — auth, data, server actions — runs within a single Next.js application, deployed to the edge.

---

## Features

- **Serialized Fiction Reader** — Chapter-based navigation with a clean, focused reading UI
- **Multi-POV Series Support** — Structured to handle complex narrative arcs across multiple perspectives
- **Tag-based Cache Invalidation** — Instant content updates powered by Next.js `cacheTag` / `revalidateTag` / `updateTag`
- **Type-safe Server Actions** — Mutations handled via `next-safe-action` with full end-to-end type safety
- **Offline Support** — Progressive Web App capabilities via a custom Serwist 9.x service worker
- **Authentication** — Secure, session-based user auth with `better-auth`
- **Optimized Performance** — Static prerendering where possible, with fine-grained dynamic boundaries via `"use cache"`

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | Next.js (App Router) | 16 |
| **Language** | TypeScript | 5 |
| **Styling** | Mantine | v8 |
| **Database** | PostgreSQL (Neon) | — |
| **ORM** | Drizzle ORM | latest |
| **Auth** | better-auth | latest |
| **Server Actions** | next-safe-action | latest |
| **Service Worker** | Serwist | 9.x |
| **Deployment** | Vercel | — |

---

## Project Structure

```
achebestan/
├── app/                  # Next.js App Router — pages, layouts, loading states
│   ├── (auth)/           # Auth-gated routes
│   └── (reader)/         # Fiction reader routes
├── components/           # Shared UI components
├── lib/
│   ├── db/               # Drizzle schema, migrations, client
│   ├── auth/             # better-auth config
│   └── actions/          # next-safe-action server actions
├── public/               # Static assets + service worker
└── sw.ts                 # Serwist service worker entry
```

> Structure may vary slightly. Refer to the source for the latest layout.

---

## Getting Started

### Prerequisites

- **Node.js** `>= 20`
- **pnpm** (recommended) or npm
- A **PostgreSQL** connection string — [Neon](https://neon.tech) recommended

### 1. Clone the repository

```bash
git clone https://github.com/CrusaderGoT/achebestan.git
cd achebestan
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env.local` file at the root:

```env
# Database
DATABASE_URL=your_neon_postgres_connection_string

# Auth (better-auth)
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000
```

> ⚠️ Never commit `.env.local` to version control. Verify these key names match your `auth.ts` config exactly.

### 4. Run database migrations

```bash
pnpm drizzle-kit migrate
```

### 5. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Known Limitations

- Service worker caching behaviour is experimental and may need tuning per deployment environment
- `"use cache"` directives require careful Suspense boundary placement — missing boundaries will cause static prerender failures at build time
- Drizzle migration hash mismatches can occur if schema and migration files fall out of sync — always run `drizzle-kit generate` before `migrate`

---

<div align="center">

<br />

Built and written by **[Achebestan](https://achebestan.vercel.app)**

*Imagination supplements reality.*

<br />

</div>
