/**
 * TalentBridge_V2 — job ↔ viewer profile alignment.
 * "High preference" = the role aligns with the viewer's profile, either
 * through shared skills or an overlapping job/profile title. Aligning jobs
 * are ranked above everything else in GET /api/jobs.
 */
import type { JobMatch } from './types'

/** Generic role words ignored when comparing titles (they alone don't align a role). */
const TITLE_STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'of', 'in', 'to', 'a', 'an', 'senior', 'junior',
  'lead', 'staff', 'principal', 'associate', 'intern', 'head', 'i', 'ii', 'iii',
  'engineer', 'developer', 'analyst', 'manager', 'designer', 'consultant',
  'specialist', 'architect', 'administrator', 'scientist', 'executive', 'officer',
])

function normalizeSkill(s: string): string {
  return s.trim().toLowerCase()
}

function titleTokens(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .split(/[^a-z0-9.]+/)
      .filter((t) => t.length >= 3 && !TITLE_STOP_WORDS.has(t))
  )
}

/**
 * Compute how well a job aligns with a viewer profile.
 * @param jobSkills raw JSON string from the Job row
 * @param viewerSkills skills array from the viewer's SafeUser
 * @param viewerTitle viewer's profile title (nullable)
 * @param jobTitle job's title
 */
export function computeJobMatch(
  jobSkillsRaw: string,
  jobTitle: string,
  viewerSkills: string[],
  viewerTitle: string | null
): JobMatch {
  // ---- Skill overlap (case-insensitive) ----
  let jobSkills: string[] = []
  try {
    const parsed: unknown = JSON.parse(jobSkillsRaw)
    if (Array.isArray(parsed)) jobSkills = parsed.map((s) => String(s))
  } catch {
    jobSkills = []
  }
  const viewerSet = new Set(viewerSkills.map(normalizeSkill).filter(Boolean))
  const matchedSkills = jobSkills.filter((s) => viewerSet.has(normalizeSkill(s)))
  const score =
    jobSkills.length > 0 ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 0

  // ---- Title alignment (e.g. "Frontend Developer" ↔ "Senior Frontend Engineer") ----
  let titleMatch = false
  if (viewerTitle) {
    const job = titleTokens(jobTitle)
    for (const t of titleTokens(viewerTitle)) {
      if (job.has(t)) {
        titleMatch = true
        break
      }
    }
  }

  const high = matchedSkills.length > 0 || titleMatch
  return { score, matchedSkills, titleMatch, high }
}
