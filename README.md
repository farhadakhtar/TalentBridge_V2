# TalentBridge_V2

A localhost-only job portal connecting **Job Seekers** and **Recruiters** with real-time DMs, a shared event calendar, and a **Company Command Center** for the Cyber Security Head, Lead Engineer and CEO.

> Built with Next.js 16 (App Router) + TypeScript + Prisma (SQLite) + Tailwind CSS + shadcn/ui.
> The original master prompt specified MERN (Express + MongoDB); this build maps it 1:1 onto the enforced sandbox stack — every feature, model, demo account and acceptance criterion is preserved.

---

## Quick Start

```bash
bun install          # install dependencies
bun run db:push      # sync Prisma schema to SQLite
bun run db:seed      # seed all demo users + data (idempotent, resets everything)
bun run dev          # start the app → http://localhost:3000
```

The dev server proxies everything through port **3000**. No other services are needed.

---

## Demo Accounts (password for all: `123456`)

### 👤 Job Seekers — View 1 (blue)
| Email | Name | Title |
|---|---|---|
| `aarav@mail.com` | Aarav Sharma | Frontend Developer |
| `priya@mail.com` | Priya Patel | Data Analyst |
| `rohan@mail.com` | Rohan Mehta | Backend Developer |
| `sneha@mail.com` | Sneha Kapoor | Cybersecurity Analyst |

### 💼 Recruiters — View 2 (green)
| Email | Name | Title |
|---|---|---|
| `recruiter1@mail.com` | Nikhil Verma | Talent Lead |
| `recruiter2@mail.com` | Ananya Iyer | Technical Recruiter |

### 🏢 Company — View 3 (violet Command Center)
| Email | Name | Title |
|---|---|---|
| `cyber@mail.com` | Vikram Rao | Cyber Security Head |
| `eng@mail.com` | Dev Menon | Lead Engineer |
| `ceo@mail.com` | Meera Nair | CEO |

The login screen also has **one-click quick-login buttons** for every account.

---

## Features

- **Cinematic landing page** — `/` opens on a scroll-animated landing: parallax hero with a pulsing brand bridge, keyword marquee, the three role worlds with live mini-UIs, an interactive product tour, feature grid, demo loop and the seeded cast. Every section reveals on scroll (directional slides, blur-ins, self-drawing connector lines, scroll-linked glows, a right-edge progress rail). The final CTA fires a **liftoff launch sequence** — warp tunnel, shock rings and a TB monogram zoom-through ending in a white flash that dissolves straight into the sign-in screen. The intro replays from the sign-in screen and is skipped for the rest of the session after the first launch.
- **Job Seeker view** — profile card with application status & skills, personal calendar (events assigned to them appear **flagged**), DM inbox with the recruiters, notification bell.
- **Recruiter view** — applicant board (4 candidates) with **Message** and **Schedule** actions, calendar + **Create Event** form (title / date / time / type / notes + required **"For whom"** targeting exactly one job seeker), DM inbox, notification bell.
- **Direct Messages** — 1:1 threads seeker ↔ recruiter in both directions; unread counts per thread + bell badge; polls every 3.5 s so replies appear without reload; all messages persisted.
- **Notifications** — bell with two labeled sections: ✉️ **Messages** (new DMs) and 📅 **Calendar** (events scheduled for you). Clicking a row marks it read and jumps to the exact thread / event.
- **Job Board** — recruiters **post jobs** (title, company, location, type, description, required skills); every signed-in user sees the board. Postings whose role **aligns with the viewer's profile** (shared skills or overlapping job/profile title) are shown with **high preference**: pinned to the top, ranked by match score, wrapped in an accent gradient border with a **Strong match / High preference / Role aligned** badge, a profile-match progress bar and check-marked skill chips. Seekers get an alignment summary strip ("2 of 6 roles align with your profile"); recruiters can delete their own postings; the company view is read-only.
- **Company Command Center** (read-only observers) —
  - *Overview*: hiring funnel (Applied → Interview → Offer), DM activity per recruiter, upcoming meetings, candidate pipeline table.
  - *Cyber Security*: login audit log + security checklist.
  - *Engineer*: API status, database connection + latency, record counts per table (incl. jobs + applications).
  - *CEO*: KPI cards — total applicants, events this month, DMs exchanged, most active recruiter.

## Resetting Demo Data

```bash
bun run db:seed
```

Clears and re-creates all users, conversations, events, job postings and notifications.

## Tech Notes

- **Auth**: email + password (bcrypt-hashed) → JWT (`jose`, HS256, 7-day expiry) stored in `localStorage`; every API request sends it as a Bearer token. No registration — only seeded accounts can log in.
- **Data model** (`prisma/schema.prisma`): `User`, `Conversation` (2 participants), `Message` (read flag), `CalendarEvent` (creator = recruiter, target = job seeker), `Notification` (`dm` | `event`), `AuditLog` (login entries), `Job` (posted by recruiter, skills stored as JSON).
- **API** (Next.js route handlers under `src/app/api`): `auth/login`, `users`, `conversations`, `conversations/[id]/messages`, `events`, `notifications`, `notifications/mark-read`, `jobs` (GET all roles / POST+DELETE recruiter), `company/stats`, `audit`. `GET /api/jobs` computes a per-viewer `match` (skill overlap %, matched skills, title alignment, high-preference flag) server-side and sorts aligning roles first.
- **Matching** (`src/lib/job-match.ts`): case-insensitive skill overlap + token-based title alignment ignoring generic role words ("engineer", "analyst", seniority…), so "Frontend Developer" aligns with "Senior Frontend Engineer" but "Data Analyst" does not align with "SOC Analyst".
- **Frontend**: single-route client SPA (`src/app/page.tsx` + `src/components/talentbridge/**`) with TanStack Query polling; custom hand-rolled month calendar; role-colored UI (seeker = blue, recruiter = emerald, company = violet).
