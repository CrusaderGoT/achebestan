<div align="center">

<br />

# ◈ Achebestan

**A modern web fiction reading platform — where stories live.**

[![Status](https://img.shields.io/badge/status-live-brightgreen?style=flat-square&labelColor=0d0d0d)](https://achebestan.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js&logoColor=white&labelColor=0d0d0d)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white&labelColor=0d0d0d)](https://www.typescriptlang.org)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel&logoColor=white&labelColor=0d0d0d)](https://achebestan.vercel.app)

<br />

[**→ Visit Achebestan**](https://achebestan.vercel.app)

<br />

</div>

---

## Overview

Achebestan is a full-stack web fiction platform built for immersive reading. It hosts serialized fiction with a focus on clean typography, fast page loads, and a distraction-free experience. Currently home to **IQ** — a multi-POV crime and tragedy series.

---

## Features

- **Serialized Fiction Reader** — Chapter-based navigation with a clean, focused reading UI
- **Multi-POV Series Support** — Structured to handle complex narrative arcs across multiple perspectives
- **Tag-based Cache Invalidation** — Instant content updates powered by Next.js `cacheTag` / `revalidateTag`
- **Offline Support** — Progressive Web App capabilities via a custom Serwist 9.x service worker
- **Authentication** — Secure user sessions with `better-auth`
- **Optimized Performance** — Static prerendering where possible, with fine-grained dynamic boundaries

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Mantine v8 |
| **Database** | PostgreSQL (Neon) |
| **ORM** | Drizzle ORM |
| **Auth** | better-auth |
| **Service Worker** | Serwist 9.x |
| **Deployment** | Vercel |

---

## Getting Started

### Prerequisites

- **Node.js** `>= 20`
- **pnpm** (recommended) or npm
- A **PostgreSQL** connection string (e.g. [Neon](https://neon.tech))

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/achebestan.git
cd achebestan
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env.local` file at the root of the project:

```env
# Database
DATABASE_URL=your_neon_postgres_connection_string

# Auth
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000
```

> ⚠️ Never commit `.env.local` to version control.

### 4. Run database migrations

```bash
pnpm drizzle-kit migrate
```

### 5. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

<div align="center">

<br />

Built by [Achebestan](https://achebestan.vercel.app) · Fiction first.

</div>
