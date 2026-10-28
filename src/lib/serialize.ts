/**
 * TalentBridge_V2 — shared server-side serializers.
 * Convert Prisma rows into the exact DTO shapes defined in src/lib/types.ts.
 * Never leaks password hashes.
 */
import type {
  SafeUser,
  Role,
  CompanySubRole,
  ConversationDTO,
  MessageDTO,
  EventDTO,
  EventType,
  JobDTO,
  JobMatch,
  JobType,
  ApplicationDTO,
} from './types'

/** Minimal Prisma user row shape needed for SafeUser. */
export interface DbUserLike {
  id: string
  name: string
  email: string
  role: string
  title: string | null
  skills: string | null
  status: string | null
  subRole: string | null
  createdAt: Date
}

/** Explicit select so `password` is never fetched. */
export const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  title: true,
  skills: true,
  status: true,
  subRole: true,
  createdAt: true,
} as const

/** Parse the JSON-stringified skills column defensively. */
export function parseSkills(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.map((s) => String(s))
    return []
  } catch {
    return []
  }
}

export function toSafeUser(u: DbUserLike): SafeUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as Role,
    title: u.title,
    skills: parseSkills(u.skills),
    status: u.status,
    subRole: u.subRole as CompanySubRole | null,
    createdAt: u.createdAt.toISOString(),
  }
}

export function toMessageDTO(
  m: { id: string; conversationId: string; senderId: string; text: string; read: boolean; createdAt: Date },
  senderName: string
): MessageDTO {
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    senderName,
    text: m.text,
    read: m.read,
    createdAt: m.createdAt.toISOString(),
  }
}

export function toConversationDTO(
  conv: {
    id: string
    lastMessageAt: Date
    participants: DbUserLike[]
    messages?: { text: string; senderId: string; createdAt: Date }[]
  },
  unreadCount: number
): ConversationDTO {
  const last = conv.messages?.[0] ?? null
  return {
    id: conv.id,
    participants: conv.participants.map(toSafeUser),
    lastMessageAt: conv.lastMessageAt.toISOString(),
    lastMessage: last
      ? { text: last.text, senderId: last.senderId, createdAt: last.createdAt.toISOString() }
      : null,
    unreadCount,
  }
}

export function toEventDTO(e: {
  id: string
  title: string
  date: string
  time: string
  type: string
  notes: string | null
  createdById: string
  creator: { name: string }
  targetUserId: string
  targetUser: { name: string; title: string | null }
  createdAt: Date
}): EventDTO {
  return {
    id: e.id,
    title: e.title,
    date: e.date,
    time: e.time,
    type: e.type as EventType,
    notes: e.notes,
    createdById: e.createdById,
    creatorName: e.creator.name,
    targetUserId: e.targetUserId,
    targetUserName: e.targetUser.name,
    targetUserTitle: e.targetUser.title,
    createdAt: e.createdAt.toISOString(),
  }
}

export function toJobDTO(
  j: {
    id: string
    title: string
    company: string
    location: string
    type: string
    description: string
    skills: string
    postedById: string
    postedBy: { name: string; title: string | null }
    createdAt: Date
  },
  match: JobMatch,
  applied: boolean = false,
  applicantCount: number = 0
): JobDTO {
  return {
    id: j.id,
    title: j.title,
    company: j.company,
    location: j.location,
    type: j.type as JobType,
    description: j.description,
    skills: parseSkills(j.skills),
    postedById: j.postedById,
    postedByName: j.postedBy.name,
    postedByTitle: j.postedBy.title,
    createdAt: j.createdAt.toISOString(),
    match,
    applied,
    applicantCount,
  }
}

/** Serialize an Application row (with its applicant user) for the recruiter. */
export function toApplicationDTO(a: {
  id: string
  jobId: string
  userId: string
  coverLetter: string | null
  status: string
  createdAt: Date
  job: { title: string }
  user: { name: string; title: string | null; skills: string | null }
}): ApplicationDTO {
  return {
    id: a.id,
    jobId: a.jobId,
    jobTitle: a.job.title,
    userId: a.userId,
    userName: a.user.name,
    userTitle: a.user.title,
    userSkills: parseSkills(a.user.skills),
    coverLetter: a.coverLetter,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
  }
}

/** Truncate long DM text for notification bodies (~80 chars). */
export function truncate(text: string, max = 80): string {
  return text.length > max ? `${text.slice(0, max)}…` : text
}
