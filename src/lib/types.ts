/**
 * TalentBridge_V2 — Shared API contract types.
 * Used by both backend routes (src/app/api/**) and frontend components.
 */

export type Role = 'job_seeker' | 'recruiter' | 'company'
export type CompanySubRole = 'cyber' | 'engineer' | 'ceo'
export type ApplicationStatus = 'Applied' | 'Interview' | 'Offer'
export type EventType = 'Interview' | 'Meeting' | 'Call'
export type NotificationType = 'dm' | 'event'
export type JobType = 'Full-time' | 'Part-time' | 'Internship' | 'Contract'

export interface SafeUser {
  id: string
  name: string
  email: string
  role: Role
  title: string | null
  skills: string[]
  status: string | null
  subRole: CompanySubRole | null
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: SafeUser
}

export interface MessageDTO {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  text: string
  read: boolean
  createdAt: string
}

export interface ConversationDTO {
  id: string
  participants: SafeUser[]
  lastMessageAt: string
  lastMessage: { text: string; senderId: string; createdAt: string } | null
  unreadCount: number
}

export interface EventDTO {
  id: string
  title: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  type: EventType
  notes: string | null
  createdById: string
  creatorName: string
  targetUserId: string
  targetUserName: string
  targetUserTitle: string | null
  createdAt: string
}

export interface NotificationDTO {
  id: string
  type: NotificationType
  refId: string
  message: string
  read: boolean
  createdAt: string
}

export interface CreateEventPayload {
  title: string
  date: string
  time: string
  type: EventType
  notes?: string
  targetUserId: string
}

/** Viewer-specific alignment between a job posting and the user's profile. */
export interface JobMatch {
  /** 0-100: share of the job's required skills the viewer also has. */
  score: number
  /** The viewer's skills that appear in the job's required skills. */
  matchedSkills: string[]
  /** True when the job title aligns with the viewer's profile title. */
  titleMatch: boolean
  /** High preference — the role aligns with the viewer's profile. */
  high: boolean
}

export interface JobDTO {
  id: string
  title: string
  company: string
  location: string
  type: JobType
  description: string
  skills: string[]
  postedById: string
  postedByName: string
  postedByTitle: string | null
  createdAt: string
  /** Computed server-side for the requesting user. */
  match: JobMatch
  /** Whether the current viewer (seeker) has already applied to this job. */
  applied: boolean
  /** Total number of applicants for this job (visible to everyone). */
  applicantCount: number
}

export interface CreateJobPayload {
  title: string
  company: string
  location: string
  type: JobType
  description: string
  skills: string[]
}

/** A seeker's application to a job — returned to the recruiter who owns the job. */
export interface ApplicationDTO {
  id: string
  jobId: string
  jobTitle: string
  userId: string
  userName: string
  userTitle: string | null
  userSkills: string[]
  coverLetter: string | null
  status: string
  createdAt: string
}

/** Payload a seeker sends when applying to a job. */
export interface ApplyJobPayload {
  coverLetter?: string
}

export interface FunnelData {
  applied: number
  interview: number
  offer: number
}

export interface DmStatRow {
  recruiterId: string
  recruiterName: string
  sent: number
  received: number
  total: number
}

export interface PipelineRow {
  user: SafeUser
  upcomingEvent: { id: string; title: string; date: string; time: string; type: string } | null
  unreadDmCount: number // messages sent TO this seeker still unread by them
  totalMessages: number
}

export interface KpiData {
  totalApplicants: number
  eventsThisMonth: number
  dmsExchanged: number
  mostActiveRecruiter: string
}

export interface CollectionCounts {
  users: number
  conversations: number
  messages: number
  calendarEvents: number
  notifications: number
  auditLogs: number
  jobs: number
  applications: number
}

export interface CompanyStats {
  funnel: FunnelData
  dmStats: DmStatRow[]
  upcomingMeetings: EventDTO[]
  pipeline: PipelineRow[]
  kpis: KpiData
  collectionCounts: CollectionCounts
  dbLatencyMs: number
  dbConnected: boolean
}

export interface AuditLogDTO {
  id: string
  userId: string
  userName: string
  userRole: string
  action: string
  createdAt: string
}
