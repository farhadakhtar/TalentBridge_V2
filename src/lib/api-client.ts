/**
 * TalentBridge_V2 — Client-side API helper.
 * Reads the JWT from localStorage and attaches it to every request.
 */
import type {
  AuthResponse, AuditLogDTO, ConversationDTO, CreateEventPayload, CreateJobPayload,
  EventDTO, JobDTO, MessageDTO, NotificationDTO, Role, SafeUser, CompanyStats,
  ApplicationDTO, ApplyJobPayload,
} from './types'

const TOKEN_KEY = 'tb_token'
export const CURRENT_USER_KEY = 'tb_user'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}
export function setSession(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(CURRENT_USER_KEY)
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(path, { ...init, headers })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError((body as { error?: string }).error ?? 'Request failed', res.status)
  return body as T
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getUsers: (role?: Role) =>
    request<{ users: SafeUser[] }>(`/api/users${role ? `?role=${role}` : ''}`),

  getConversations: () =>
    request<{ conversations: ConversationDTO[] }>('/api/conversations'),

  /** Get-or-create the 1:1 conversation with another user. */
  openConversation: (otherUserId: string) =>
    request<{ conversation: ConversationDTO }>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ otherUserId }),
    }),

  getMessages: (conversationId: string) =>
    request<{ messages: MessageDTO[] }>(`/api/conversations/${conversationId}/messages`),

  sendMessage: (conversationId: string, text: string) =>
    request<{ message: MessageDTO }>(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  getEvents: () => request<{ events: EventDTO[] }>('/api/events'),

  createEvent: (payload: CreateEventPayload) =>
    request<{ event: EventDTO }>('/api/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getNotifications: () =>
    request<{ notifications: NotificationDTO[]; unreadCount: number }>('/api/notifications'),

  markNotificationsRead: (payload: { ids?: string[]; all?: boolean }) =>
    request<{ ok: true }>('/api/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getCompanyStats: () => request<CompanyStats>('/api/company/stats'),

  getAuditLogs: () => request<{ logs: AuditLogDTO[] }>('/api/audit'),

  getJobs: () => request<{ jobs: JobDTO[] }>('/api/jobs'),

  createJob: (payload: CreateJobPayload) =>
    request<{ job: JobDTO }>('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteJob: (id: string) =>
    request<{ ok: true }>(`/api/jobs/${id}`, { method: 'DELETE' }),

  /** Seeker applies to a job (optional cover letter). */
  applyToJob: (jobId: string, payload: ApplyJobPayload = {}) =>
    request<{ application: { id: string; jobId: string; userId: string }; alreadyApplied: boolean }>(
      `/api/jobs/${jobId}/apply`,
      { method: 'POST', body: JSON.stringify(payload) }
    ),

  /** Seeker withdraws their application from a job. */
  withdrawApplication: (jobId: string) =>
    request<{ ok: true }>(`/api/jobs/${jobId}/apply`, { method: 'DELETE' }),

  /** Recruiter lists applicants for one of their own postings. */
  getJobApplicants: (jobId: string) =>
    request<{ applications: ApplicationDTO[]; jobTitle: string }>(
      `/api/jobs/${jobId}/applications`
    ),
}
