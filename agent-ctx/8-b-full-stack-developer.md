# Task 8-b — Frontend Jobs (Job Board, Post-a-Job dialog, app-shell wiring)

Agent: full-stack-developer
Status: DONE — lint 0/0, tsc clean under src/, dev server compiles clean (GET / 200)

## What was built

### 1. `src/components/talentbridge/jobs-view.tsx` (NEW)
- Props: `{ user: SafeUser; accent: Accent }` — accent blue (seeker) / emerald (recruiter) / violet (company).
- Data: `useQuery(['jobs'], api.getJobs, refetchInterval: 8000)` + `useAuthErrorEffect` + `useAuthGuard`.
- SectionHeading: eyebrow "Job Board", title `Open <gradient>roles</gradient>`, per-role description:
  - seeker: `"N of M roles align with your profile — they're pinned to the top."` / `"No openings align with your profile yet — check back soon."`
  - recruiter: "Post a role and every candidate sees it on their board."
  - company: "Read-only view of every posting published by recruiters."
- Right slot: recruiter-only "Post a Job" button (`theme.solid` + `shine` + Plus).
- Seeker alignment strip (highCount > 0): glass row, gradient Sparkles tile, "N of M roles align with your profile", ≤6 unique matched-skill chips (accent-tinted).
- Cards grid: `StaggerGroup grid gap-4 md:grid-cols-2 xl:grid-cols-3` of StaggerItem > MotionCard.
- HIGH-PREFERENCE treatment (match.high):
  - gradient hairline wrapper `rounded-2xl bg-gradient-to-b from-<accent>-400/40 via-white/10 to-white/5 p-px` (literal `HIGH_WRAPPER` map);
  - badge row: `Strong match · {score}%` (score≥60) / `High preference · {n} skill(s)` (matchedSkills>0) / `Role aligned with your profile` (titleMatch only) — accent tint + Sparkles size-3 + glow (`HIGH_BADGE` map);
  - 2px "Profile match" progress bar, `bg-gradient-to-r theme.gradient`, width `max(score, 8)%`.
- Type badges (`TYPE_BADGE` map): Full-time muted glass, Part-time sky, Internship amber, Contract rose.
- Skill chips: matched (case-insensitive vs `match.matchedSkills`) = accent tint + Check icon; unmatched = `border-white/8 bg-white/[0.04] text-foreground/70`.
- Footer: gradient-ring avatar (initials, size-7) + "Posted by {name}" + `· timeAgo`; recruiter sees Trash2 on own jobs (`postedById === user.id`) with two-step confirm (`confirmId`, "Click again" red hint, cleared by any other card click — button stopPropagation).
- deleteJob mutation → invalidate `['jobs']` + `toastSuccess('Job removed', …)`; errors via guard + toastError.
- Empty state (Briefcase circle + recruiter hint) / 6-skeleton loading / dialog wired `key={String(postOpen)}`.

### 2. `src/components/talentbridge/post-job-dialog.tsx` (NEW)
- Props `{ open, onOpenChange }`; parent remounts via `key={String(open)}` — no useEffect resets.
- Fields: Title, Company, Location (grid 2-col), Type Select (4 JobTypes, default Full-time, distinct-dark SelectContent), Description (rows 4), Skills (comma input) with live deduped chip preview + "{n} skills".
- Validation (first failure): title≥3, company≥2, location≥2, description≥10, ≥1 skill → toastError.
- createJob mutation → invalidate `['jobs']`, `toastSuccess('Job posted', '"{title}" is now live on the job board')`, close; onError guard+toastError; full-width emerald shine submit with pending spinner.

### 3. `src/components/talentbridge/app-shell.tsx` (EDITED)
- `Section` union + `SECTION_META` + `navItems` now include `jobs` (seeker/recruiter "Jobs" between Dashboard and Calendar; company "Job Board" after Command Center).
- `renderSection()` returns `<JobsView user accent />` for `jobs` (placed before the `isCompany` check so company gets the read-only board too).
- Added `isCompanyHome = isCompany && section === 'dashboard'` for topbar title/subtitle + contentKey (company's Job Board now shows correct meta; Command Center unchanged on dashboard). Mobile icon nav picks up navItems automatically.
- Fixed pre-existing TS error in mobile nav: `theme.soft` (doesn't exist on roleTheme) → `accentClasses[accent].soft`.

## Literal class maps (Tailwind-safe, keyed by accent/type)
`ACCENT_CHIP`, `HIGH_BADGE`, `HIGH_WRAPPER` (jobs-view.tsx) + `TYPE_BADGE` (keyed by JobType).

## Verification
- `bun run lint` → 0 errors / 0 warnings.
- `bunx tsc --noEmit` → no errors under src/ (remaining hits are pre-existing sandbox `examples/` + `skills/` noise, outside the Next app graph).
- `tail dev.log` → `✓ Compiled` + `GET / 200`, no compile errors.
- No browser/E2E testing (orchestrator owns final verification). No DB writes, no new routes.

## Notes for next agents
- `['jobs']` is the query cache key — invalidate it after any job write.
- `PostJobDialog` must be rendered with `key={String(open)}` (remount pattern) to reset form state.
- Jobs sort order (high first, then score, then newest) comes from the backend GET; the UI preserves it.
