# TalentBridge_V2

A production-grade, local-first MERN application connecting Job Seekers, Recruiters, and Corporate Leadership with zero cloud dependencies.

---

## 📌 Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local community server running on port `27017`

### 1. Installation
Run from root:
```bash
npm run install-all
```

### 2. Seed Database
Clears old collections and seeds 9 demo accounts, calendar events, direct messages, notifications, and audit logs:
```bash
npm run seed
```

### 3. Launch Application
Boots Express backend (`http://localhost:5000`) and Vite frontend (`http://localhost:5173`) in parallel:
```bash
npm run dev
```

---

## 👥 Seed Demo Accounts

All accounts use the password: `123456`

| View | Role | Name | Email | Password | Details |
|---|---|---|---|---|---|
| **View 1: Job Seeker** | `job_seeker` | Aarav Sharma | `aarav@mail.com` | `123456` | Frontend Developer (Status: Interview) |
| **View 1: Job Seeker** | `job_seeker` | Priya Patel | `priya@mail.com` | `123456` | Data Analyst (Status: Applied) |
| **View 1: Job Seeker** | `job_seeker` | Rohan Mehta | `rohan@mail.com` | `123456` | Backend Developer (Status: Offer) |
| **View 1: Job Seeker** | `job_seeker` | Sneha Kapoor | `sneha@mail.com` | `123456` | Cybersecurity Analyst (Status: Applied) |
| **View 2: Recruiter** | `recruiter` | Nikhil Verma | `recruiter1@mail.com` | `123456` | Senior Technical Recruiter |
| **View 2: Recruiter** | `recruiter` | Ananya Iyer | `recruiter2@mail.com` | `123456` | Technical Recruiter |
| **View 3: Company** | `company` | Vikram Rao | `cyber@mail.com` | `123456` | Cyber Security Head |
| **View 3: Company** | `company` | Dev Menon | `eng@mail.com` | `123456` | Lead Engineer |
| **View 3: Company** | `company` | Meera Nair | `ceo@mail.com` | `123456` | CEO |

---

## 📂 Project Architecture

```
TalentBridge_V2/
├── client/                     # Vite + React 18 Single Page App
│   ├── src/
│   │   ├── components/         # Shared navbar, notification bell, calendar grid
│   │   ├── pages/              # Login, View1 (Seeker), View2 (Recruiter), View3 (Company)
│   │   ├── services/           # API integration layer with polling
│   │   └── App.jsx             # Router and Auth Context
│   └── package.json
├── server/                     # Node.js + Express REST API
│   ├── models.js               # Mongoose schemas: User, Message, Conversation, Event, etc.
│   ├── seed.js                 # Idempotent database seeder
│   ├── index.js                # Express controllers, routes, RBAC middleware
│   ├── .env                    # Local configuration
│   └── package.json
├── PRD.md                      # Product Requirements Document
├── DRD.md                      # Design Requirements Document (UI/UX specs)
├── ERD.md                      # Entity Relationship & Database Schema Document
├── TRD.md                      # Technical Requirements & Architecture Document
├── DER.md                      # Deployment, Execution & Resilience Document
└── package.json                # Root orchestrator (concurrently)
```

---

## 📑 Core Documentation Index
- **[PRD.md](PRD.md)**: Product goals, user journeys, functional constraints, and acceptance criteria.
- **[DRD.md](DRD.md)**: Layout specifications, design tokens, color codings, and interactive behavior.
- **[ERD.md](ERD.md)**: Data schemas, relations, field constraints, and indexing strategy.
- **[TRD.md](TRD.md)**: System architecture, REST endpoints, polling protocol, and authentication model.
- **[DER.md](DER.md)**: Execution steps, seed idempotence, failure modes, and security posture.
