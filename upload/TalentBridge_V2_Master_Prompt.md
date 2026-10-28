# MASTER PROMPT — Build "TalentBridge_V2"

Copy everything below this line into a new Z.ai chat.

---

You are a senior full-stack engineer. Build a complete, fully working MERN web application named **TalentBridge_V2** that runs 100% on localhost. Do not use any cloud services, paid APIs, or deployments. Prioritize a working end-to-end flow over extra features, but keep the UI clean and modern. Everything below is mandatory unless marked optional.

## 1. Tech Stack & Environment
- **Frontend:** React (Vite) + React Router
- **Backend:** Node.js + Express (REST API)
- **Database:** MongoDB via Mongoose — local instance, connection string in `server/.env` as `MONGO_URI` (default: `mongodb://127.0.0.1:27017/talentbridge_v2`)
- **Run with one command:** root `package.json` using `concurrently` — `npm run dev` starts backend on `http://localhost:5000` and frontend on `http://localhost:5173`
- **Seed script:** `npm run seed` creates all demo users and demo data (idempotent: clears collections, then re-creates)
- **Auth:** simple login form (email + password) issuing a JWT stored in localStorage. No registration page — only the seeded demo accounts can log in. Hash passwords with bcryptjs.

## 2. Roles & Demo Accounts (seed exactly these)
**4 Job Seekers** (View 1):
- `aarav@mail.com` / `123456` — Aarav Sharma (Frontend Developer)
- `priya@mail.com` / `123456` — Priya Patel (Data Analyst)
- `rohan@mail.com` / `123456` — Rohan Mehta (Backend Developer)
- `sneha@mail.com` / `123456` — Sneha Kapoor (Cybersecurity Analyst)

**2 Recruiters** (View 2):
- `recruiter1@mail.com` / `123456` — Nikhil Verma
- `recruiter2@mail.com` / `123456` — Ananya Iyer

**3 Company Users** (View 3):
- `cyber@mail.com` / `123456` — Vikram Rao (Cyber Security Head)
- `eng@mail.com` / `123456` — Dev Menon (Lead Engineer)
- `ceo@mail.com` / `123456` — Meera Nair (CEO)

Login page: one shared login form; after login, route to the correct view based on role. Add quick-login buttons under the form that auto-fill each demo account for easy testing.

## 3. View 1 — Job Seeker Dashboard
- Profile summary card: name, title, skills, profile photo placeholder, application status
- **My Calendar:** month-view grid showing events targeted at this seeker, visually flagged/highlighted; clicking an event opens details (title, date, time, type, who created it, notes)
- **Messages:** list of DM threads with each recruiter → opens chat view
- **Notification bell** in the navbar (see Section 6)

## 4. View 2 — Recruiter Dashboard
- Applicant board: cards for the 4 job seekers (name, title, status) with quick actions **Message** and **Schedule**
- **My Calendar:** month-view grid + **Create Event** button. Event form fields: title, date, time, type (Interview / Meeting / Call), notes, and a required dropdown **"For whom"** listing the 4 job seekers — the recruiter must select exactly one
- The created event automatically appears flagged on the selected job seeker's calendar and triggers a notification for them
- **Messages:** DM threads with each job seeker → chat view
- **Notification bell** in the navbar

## 5. View 3 — Company Command Center (shared by Cyber Security Head, Engineer, CEO)
All three company users log into the same command center with these sections:
- **Analytics dashboard:** hiring funnel (Applied → Interview → Offer) as a visual funnel/bar chart with real DB counts; DM activity stats (messages exchanged per recruiter); upcoming meetings list pulled from calendar events
- **Candidate pipeline table:** all 4 applicants with title, status, upcoming event, unread DM count
- **Cyber Security section:** login activity log (who logged in, when — record a log entry on every login) + a simple security checklist card
- **Engineer section:** system status panel — API status, MongoDB connection status, record counts per collection
- **CEO section:** KPI summary cards — total applicants, events scheduled this month, DMs exchanged, most active recruiter
- Company users are read-only observers: they cannot send DMs or create events. Keep this view simple but data-driven.

## 6. DM System (core feature)
- Any job seeker ↔ any recruiter can DM each other in 1:1 threads. Company users have no inbox.
- Messages persist in MongoDB; a thread shows sender name, text, and timestamp in chronological order
- Unread message count per thread + total unread in the bell badge
- Poll for new messages every 3–5 seconds so replies appear without a manual reload
- Sending a message creates a notification for the recipient
- Clicking a DM notification opens that exact thread

## 7. Notifications
- Bell icon in the navbar of View 1 and View 2 with an unread badge count
- Dropdown with two labeled sections: **Messages** (new DMs — envelope icon) and **Calendar** (new events — calendar icon), each row showing who/what/when
- Items mark as read when clicked; badges update on the same polling interval as messages
- Event notifications are created for the targeted job seeker when a recruiter schedules them

## 8. Data Models (Mongoose)
- **User:** name, email, password (hashed), role (`job_seeker` | `recruiter` | `company`), title, skills
- **Message:** conversationId, senderId, text, createdAt, read (bool)
- **Conversation:** participantIds [2 users], lastMessageAt
- **CalendarEvent:** title, date, time, type, notes, createdBy (recruiter), targetUser (job seeker), createdAt
- **Notification:** userId, type (`dm` | `event`), refId, message, read (bool), createdAt
- **AuditLog:** userId, action, createdAt (feeds the Cyber Security section)

## 9. Seed Data
- All 9 users listed above
- 2–3 sample DM conversations with 4–5 messages each (e.g., Priya ↔ Nikhil discussing an interview)
- 2–3 calendar events (e.g., "Interview — Frontend Role" for Aarav, created by Nikhil, dated next week)
- Everything resets cleanly via `npm run seed`

## 10. UI / UX
- Clean, modern design with a fixed sidebar layout per view
- Color coding: Job Seeker = blue accents, Recruiter = green accents, Company = dark/purple accents
- Build the calendar as a simple custom month grid (no heavy calendar library needed); a light chart approach (plain CSS bars or recharts) for the funnel
- Laptop-friendly responsive layout; no mobile-first complexity required

## 11. Deliverables
- Two folders: `/client` and `/server`, plus root `package.json` (`npm run install-all`, `npm run seed`, `npm run dev`)
- `README.md`: setup steps (start MongoDB → install → seed → run) and the demo account table
- Basic error handling: invalid login, DB down, empty states ("No events yet", "No messages yet")

## 12. Acceptance Checklist (self-verify before finishing)
- [ ] All 9 seeded users log in and land on the correct view
- [ ] Recruiter creates an event picking exactly 1 of the 4 seekers; that seeker sees it flagged on their calendar
- [ ] DM works both directions seeker ↔ recruiter without page reload; unread counts are correct
- [ ] Bell shows both DM and calendar notifications; dropdown works; clicking navigates to the thread/event
- [ ] Company view renders funnel, pipeline, and all 3 role sections using real DB data
- [ ] `npm run seed` resets everything; `npm run dev` boots both servers with no errors

Build the complete project now. If anything is ambiguous, make a reasonable choice and keep going — do not stop to ask questions.
