<div align="center">

<img src="https://github.com/user-attachments/assets/c75e3435-0c0b-46c6-be74-0f9ab276a36a" width="60" height="60" alt="Achebestan Logo" />

# Achebestan

**A modern web fiction reading platform — where stories live.**

[![Status](https://img.shields.io/badge/status-live-brightgreen?style=flat-square&labelColor=0d0d0d)](https://achebestan.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js&logoColor=white&labelColor=0d0d0d)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white&labelColor=0d0d0d)](https://www.typescriptlang.org)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel&logoColor=white&labelColor=0d0d0d)](https://achebestan.vercel.app)

> *There are no happy endings here 🙃*

[**Visit Achebestan →**](https://achebestan.vercel.app)

</div>

---

## 📱 Previews

| Home Page | Story View |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/64489499-850e-4a04-b4f9-fbe7889e91d2" width="100%" alt="Home Page" /> | <img src="https://github.com/user-attachments/assets/c26155ae-b457-4396-becf-ccddfcffac51" width="100%" alt="Story Page" /> |
| **Story Actions** | **Stories Grid** |
| <img src="https://github.com/user-attachments/assets/72462e6c-8acb-44e8-a4e6-11bc1e8b8330" width="100%" alt="Actions" /> | <img src="https://github.com/user-attachments/assets/b0ed8432-cf85-4fd5-b69e-843a45acc6b0" width="100%" alt="Grid" /> |

---

## 📖 Overview

Achebestan is a full-stack web fiction platform designed for an immersive, distraction-free reading experience. It is optimized for serialized fiction, featuring multi-POV narratives and chapter-based progression.

By leveraging the latest Next.js features, the platform eliminates the need for a separate backend, running everything—from authentication to server actions—within a single unified application deployed to the edge.

---

## ✨ Features

- **Serialized Reader** – Clean UI focused entirely on the reading experience.
- **Multi-POV Support** – Built-in structure for complex narratives with multiple perspectives.
- **Advanced Caching** – Instant content invalidation using Next.js `cacheTag` and `revalidateTag`.
- **Type-Safe Actions** – End-to-end type safety for all mutations via `next-safe-action`.
- **Offline Support** – Progressive Web App (PWA) capabilities powered by **Serwist 9.x**.
- **Secure Auth** – Reliable session management with `better-auth`.
- **Modern UI** – Beautifully crafted with **Mantine v8**, supporting both Light and Dark modes.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Mantine v8 |
| **Database** | PostgreSQL (Neon) |
| **ORM** | Drizzle ORM |
| **Auth** | better-auth |
| **Service Worker** | Serwist 9.x |
| **Deployment** | Vercel |

---

## 📂 Project Structure

```bash
achebestan/
├── app/                # Next.js App Router (pages, layouts, loading states)
│   ├── (auth)/         # Authentication routes
│   └── (reader)/       # Fiction reader & content routes
├── components/         # Reusable UI components
├── lib/
│   ├── db/             # Drizzle schema and migrations
│   ├── auth/           # better-auth configuration
│   └── actions/        # next-safe-action server actions
├── public/             # Static assets and PWA manifest
└── sw.ts               # Serwist service worker entry
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `>= 20`
- **npm** (recommended) or npm
- **PostgreSQL** database (Neon recommended)

### 1. Clone the repository

```bash
git clone [https://github.com/CrusaderGoT/achebestan.git](https://github.com/CrusaderGoT/achebestan.git)
cd achebestan
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=your_neon_postgres_connection_string

# Auth (better-auth)
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000
```

### 4. Database Setup

```bash
npm drizzle-kit migrate
```

### 5. Run the development server

```bash
npm dev
```
Open [http://localhost:3000](http://localhost:3000) to see the result.

---

## ⚠️ Known Limitations

- **Experimental Caching**: The `"use cache"` directive requires strict `Suspense` boundary placement. Missing boundaries will result in static prerender failures during build.
- **PWA Performance**: Service worker caching behavior is experimental and may require tuning based on your specific deployment environment.
- **Migration Hashes**: To prevent schema mismatches, always ensure you run `drizzle-kit generate` before applying migrations.

---

<div align="center">

Built and written by **[Achebestan](https://achebestan.vercel.app)**

*"Imagination supplements reality."*

</div>
