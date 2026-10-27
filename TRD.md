# Technical Requirements Document (TRD) — TalentBridge_V2

## 1. System Architecture & Tech Stack

```
   ┌────────────────────────────────────────────────────────┐
   │             Browser Client (React 18 / Vite)           │
   │               http://localhost:5173                    │
   └───────────────────────────┬────────────────────────────┘
                               │ HTTP / JSON REST
                               │ (Polling interval: 3-5s)
   ┌───────────────────────────▼────────────────────────────┐
   │             Node.js + Express REST API Server          │
   │               http://localhost:5000                    │
   │   - JWT Auth Middleware (RBAC)                         │
   │   - Audit Logging Engine                               │
   └───────────────────────────┬────────────────────────────┘
                               │ Mongoose ODM
   ┌───────────────────────────▼────────────────────────────┐
   │                   Local MongoDB Server                 │
   │           mongodb://127.0.0.1:27017/talentbridge_v2   │
   └────────────────────────────────────────────────────────┘
```

- **Frontend:** React 18, Vite, React Router v6/v7, Native CSS3 / Flexbox / Grid.
- **Backend:** Node.js, Express 4/5, Mongoose 8/9, `cors`, `dotenv`, `bcryptjs`, `jsonwebtoken`.
- **Database:** MongoDB Community Server (localhost:27017).
- **Execution:** Root `package.json` with `concurrently`.

---

## 2. API Contract & Endpoint Specifications

### 2.1 Authentication & Profile
- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Response: `{ token, user: { id, name, email, role, title, skills, status } }`
  - Side effect: Creates `AuditLog` entry.
- `GET /api/auth/me`
  - Headers: `Authorization: Bearer <token>`
  - Response: Current user object (excluding password).

### 2.2 Users Directory
- `GET /api/users?role=[job_seeker|recruiter|company]`
  - Headers: `Authorization: Bearer <token>`
  - Response: Array of user objects matching role filter.

### 2.3 Calendar Events
- `GET /api/events`
  - Headers: `Authorization: Bearer <token>`
  - Role logic:
    - `job_seeker`: Returns events where `targetUser == req.user.id`.
    - `recruiter`: Returns events where `createdBy == req.user.id`.
    - `company`: Returns all system events.
- `POST /api/events`
  - Headers: `Authorization: Bearer <token>` (Recruiter only)
  - Body: `{ title, date, time, type, notes, targetUser }`
  - Response: Created event document (201).
  - Side effect: Creates `Notification` document for `targetUser`.

### 2.4 Conversations & Direct Messages
- `GET /api/conversations`
  - Headers: `Authorization: Bearer <token>`
  - Response: List of conversations for user with `otherUser` details, `lastMessage`, and `unreadCount`.
- `POST /api/conversations/init`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ targetUserId }`
  - Response: Existing or newly created conversation document.
- `GET /api/conversations/:id/messages`
  - Headers: `Authorization: Bearer <token>`
  - Response: Array of message documents in chronological order.
  - Side effect: Marks messages where `senderId != req.user.id` as `read: true`.
- `POST /api/conversations/:id/messages`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ text }`
  - Response: Created message document (201).
  - Side effect: Updates `lastMessageAt`, creates `Notification` for the conversation recipient.

### 2.5 Notifications
- `GET /api/notifications`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ notifications: [...], unreadCount: Number }`
- `PATCH /api/notifications/:id/read`
  - Headers: `Authorization: Bearer <token>`
  - Response: Updated notification document with `read: true`.

### 2.6 Company Command Center
- `GET /api/company/command-center`
  - Headers: `Authorization: Bearer <token>` (Company role required)
  - Response:
    ```json
    {
      "funnel": { "applied": 2, "interview": 1, "offer": 1, "total": 4 },
      "recruiterStats": [{ "name": "...", "messagesSent": 5, "conversations": 2 }],
      "pipeline": [{ "name": "...", "status": "...", "upcomingEvent": "...", "unreadDMs": 1 }],
      "upcomingEvents": [...],
      "cyberSecurity": { "auditLogs": [...], "checklist": [...] },
      "engineer": { "apiStatus": "Healthy", "dbStatus": "Connected", "collectionCounts": {...} },
      "ceo": { "totalApplicants": 4, "eventsScheduled": 2, "totalMessages": 5, "mostActiveRecruiter": "Nikhil Verma" }
    }
    ```

---

## 3. Real-Time Synchronization Protocol
To comply with local-first, zero-external-dependency constraints without introducing WebSocket overhead:
1. **Polling Engine:** React hook `useInterval` polls `/api/conversations/:id/messages` and `/api/notifications` every 4000ms.
2. **Tab Visibility Check:** Polling temporarily pauses or throttles when the browser tab loses focus to prevent unneeded CPU consumption.
3. **Immediate Optimistic UI:** Sent messages render locally immediately while persisting via POST.

---

## 4. Security & Role-Based Access Control (RBAC)
- **Token Verification:** Express middleware checks `Authorization: Bearer <JWT>`.
- **Role Isolation:**
  - Company users attempting to POST to `/api/events` or `/api/conversations` receive `403 Forbidden`.
  - Non-recruiter users attempting to POST events receive `403 Forbidden`.
- **Password Protection:** Minimum 10 rounds of salt via `bcryptjs`.
- **Input Sanitization:** Express parses JSON strictly; field constraints enforced at schema level.
