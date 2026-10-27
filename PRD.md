# Product Requirements Document (PRD) — TalentBridge_V2

## 1. Executive Summary
TalentBridge_V2 is a streamlined, local-first talent acquisition and candidate collaboration platform built on the MERN stack. It resolves fragmentation across three core personas: **Job Seekers**, **Recruiters**, and **Company Observers** (C-Suite, Engineering, and Security), providing real-time direct messaging, targeted calendar scheduling, and aggregated recruitment telemetry.

---

## 2. Target Personas & Use Cases

### 2.1 Persona 1: Job Seeker (`role: job_seeker`)
- **Profile Context:** Active candidate evaluating roles and interview offers.
- **Needs:**
  - View current application status (`Applied`, `Interview`, `Offer`) and personal profile summary.
  - Review scheduled interviews and meetings in an interactive month calendar view.
  - Exchange direct messages with recruiters in real-time.
  - Receive actionable instant notifications for newly scheduled calendar events and direct messages.

### 2.2 Persona 2: Recruiter (`role: recruiter`)
- **Profile Context:** Talent acquisition professional managing sourcing pipelines.
- **Needs:**
  - View applicant cards for all active job seekers with quick actions.
  - Schedule structured events (`Interview`, `Meeting`, `Call`) strictly targeting a specific job seeker.
  - Conduct 1-on-1 direct message conversations with any candidate.
  - Receive notification alerts when candidates send replies or updates.

### 2.3 Persona 3: Company Leadership (`role: company`)
- **Sub-personas:**
  - **CEO:** Real-time visibility into hiring velocity, applicant volume, and recruiter performance.
  - **Lead Engineer:** System health monitor, uptime indicators, database connection status, and collection entity counts.
  - **Cyber Security Head:** Real-time audit logs of authentication and system access events, alongside compliance verification checks.
- **Role Constraints:** Read-only observers; cannot initiate direct messages or create calendar bookings.

---

## 3. Core Functional Requirements

### 3.1 Authentication & Role-Based Routing
- Single unified login screen at `/login` requesting `email` and `password`.
- Passwords verified against bcrypt hashes.
- JWT issued upon successful authentication and retained in client `localStorage`.
- Post-login dynamic routing directly into corresponding views:
  - `job_seeker` → `/seeker` (View 1)
  - `recruiter` → `/recruiter` (View 2)
  - `company` → `/company` (View 3)
- Quick-login buttons on the login screen for each seeded user to expedite testing.

### 3.2 View 1: Job Seeker Dashboard
- **Profile Summary Header:** Display full name, role title, technical skill badges, placeholder avatar, and application status tag.
- **Interactive Calendar:** Visual month grid highlighting days with scheduled bookings. Clicking an event displays event modal/flyout with time, event type, notes, and organizer details.
- **Direct Messaging Hub:** Chat sidebar listing recruiter threads with unread counters and live message stream.
- **Global Navbar:** Unified brand header with active user profile chip, logout action, and persistent Notification Bell.

### 3.3 View 2: Recruiter Dashboard
- **Applicant Directory:** Renders candidate cards displaying name, target role, current pipeline stage, and quick-launch action triggers (`Message`, `Schedule`).
- **Recruiter Calendar & Scheduler:** Visual calendar accompanied by a "Create Event" modal.
  - Form validations require: `Title`, `Date`, `Time`, `Type` (`Interview` | `Meeting` | `Call`), `Notes`, and `Target Seeker` selection dropdown.
  - Creation automatically updates the target candidate's calendar and queues a notification.
- **Recruiter Messaging Hub:** Comprehensive inbox to manage candidate threads.

### 3.4 View 3: Company Command Center
- **Aggregated Analytics:**
  - Visual stage funnel with real-time candidate tallies (`Applied` → `Interview` → `Offer`).
  - Recruiter productivity metrics (total messages dispatched and threads maintained).
  - Upcoming scheduled meeting tracker.
- **Candidate Pipeline Matrix:** Data grid of all candidates with status, skills, upcoming events, and pending message counts.
- **Leadership Modules:**
  - **Cyber Security:** Real-time authentication audit log feed (timestamp, user, role, action) and defensive posture checklist.
  - **Engineering:** API status indicator, MongoDB active connection state, and record counters across collections.
  - **CEO KPIs:** High-level summary metrics (Total Applicants, Monthly Events, Total Messages Exchanged, Top Recruiter).

### 3.5 Real-Time Communication & Notification Engine
- Direct message exchange without page reload via regular 3–5 second polling.
- Bidirectional unread badge counters.
- Global Notification Bell featuring segmented tabs:
  - **Messages tab:** Envelope icons, unread conversation alerts.
  - **Calendar tab:** Calendar icons, scheduled interview alerts.
- Single-click notification dismissal marking records as read in database.

---

## 4. Non-Functional Requirements
- **Local-First Mandate:** Operates entirely without external cloud endpoints, paid CDNs, or external databases.
- **Zero Third-Party Auth:** Pure local JWT and bcrypt security layer.
- **High Performance:** UI responds under 100ms; polling overhead minimal with indexed MongoDB queries.
- **Idempotent Data Seeding:** Single command resets and populates predictable test fixtures.

---

## 5. Acceptance Matrix
| Item | Requirement | Verification Method |
|---|---|---|
| AC-1 | All 9 demo users authenticate successfully | Log in with every seeded email and `123456` |
| AC-2 | Role-based navigation boundary | Job seeker cannot access `/company` or `/recruiter` |
| AC-3 | Event scheduling targeting | Recruiter creates event for Aarav; appears on Aarav's calendar only |
| AC-4 | Direct messaging synchronicity | Message sent in recruiter tab appears in seeker tab within polling cycle |
| AC-5 | Notification bell counters | Unread counts sync across message/event creation |
| AC-6 | Company telemetry accuracy | Funnel and pipeline data match database document state exactly |
