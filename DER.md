# Deployment, Execution & Resilience Document (DER) — TalentBridge_V2

## 1. Environment & Execution Topology

TalentBridge_V2 runs completely in a local self-contained ecosystem.

### Execution Boundaries
- **Host System:** Windows 10/11 / macOS / Linux
- **Port Allocations:**
  - `5000`: Express API backend
  - `5173`: Vite React dev server
  - `27017`: Local MongoDB service
- **Process Orchestration:** Handled at root using `concurrently`.

---

## 2. Seed Idempotence & State Isolation

### Seeding Mechanism (`server/seed.js`)
1. **Connection Verification:** Validates connection to `mongodb://127.0.0.1:27017/talentbridge_v2`.
2. **Purge Phase:** Performs clean teardown of all 6 collections via `deleteMany({})`.
3. **Identity Setup:** Hashes default password (`123456`) and instantiates the 9 demo profiles.
4. **Relational Population:**
   - Creates cross-referencing DM threads with initial message histories.
   - Generates calendar events scheduled relative to `Date.now()`.
   - Links initial unread notifications to candidate accounts.
   - Emits initial system audit log events.

---

## 3. Resilience, Fault Tolerance & Error Handling

### 3.1 MongoDB Disconnection Resilience
- If MongoDB is offline, server responds with clean HTTP 500 error envelopes:
  ```json
  { "error": "Database connection unavailable. Please ensure mongod service is active." }
  ```
- Command Center (View 3) Engineering panel surfaces exact connection state:
  - `0`: Disconnected
  - `1`: Connected
  - `2`: Connecting
  - `3`: Disconnecting

### 3.2 Network Polling Fault Tolerance
- Frontend polling catches fetch rejections silently, avoiding error popups during temporary backend restarts.
- Failed message transmissions trigger clear UI retry hints.

### 3.3 Auth Token Expiry & Invalidation
- Expired or tampered JWTs trigger automatic client-side storage clearance and redirect to `/login`.

---

## 4. Disaster Recovery & Reset Protocol

To reset the entire system back to pristine state at any point:
```bash
# 1. Terminate running server processes (Ctrl+C)
# 2. Re-seed local MongoDB
npm run seed
# 3. Boot environment
npm run dev
```

---

## 5. Security Posture Checklist
- [x] Passwords hashed with bcryptjs (10 salt rounds)
- [x] Zero external API dependencies or cloud callbacks
- [x] Role-Based Access Control middleware for protected endpoints
- [x] Audit logs recorded for every authentication transaction
- [x] CORS restricted to local origin (`http://localhost:5173`)
- [x] All database operations scoped to local instance
