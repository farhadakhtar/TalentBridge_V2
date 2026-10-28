/**
 * GET /api/company/stats — everything the Company Command Center needs,
 * computed live from the database (CompanyStats shape in src/lib/types.ts).
 */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuth } from '@/lib/auth'
import { safeUserSelect, toSafeUser, toEventDTO } from '@/lib/serialize'
import type {
  CompanyStats,
  DmStatRow,
  PipelineRow,
  FunnelData,
  KpiData,
  CollectionCounts,
} from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const auth = await getAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Trivial query timed to report DB latency.
    const t0 = Date.now()
    const usersCount = await db.user.count()
    const dbLatencyMs = Date.now() - t0

    const [conversations, messages, events, notificationsCount, auditLogsCount, jobsCount, applicationsCount, recruiters, seekers] =
      await Promise.all([
        db.conversation.findMany({ include: { participants: { select: { id: true } } } }),
        db.message.findMany({ select: { conversationId: true, senderId: true, read: true } }),
        db.calendarEvent.findMany({
          include: {
            creator: { select: { name: true } },
            targetUser: { select: { name: true, title: true } },
          },
          orderBy: [{ date: 'asc' }, { time: 'asc' }],
        }),
        db.notification.count(),
        db.auditLog.count(),
        db.job.count(),
        db.application.count(),
        db.user.findMany({
          where: { role: 'recruiter' },
          orderBy: { name: 'asc' },
          select: { id: true, name: true },
        }),
        db.user.findMany({
          where: { role: 'job_seeker' },
          orderBy: { name: 'asc' },
          select: safeUserSelect,
        }),
      ])

    const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    const monthPrefix = today.slice(0, 7) // YYYY-MM

    // ---- Funnel (cumulative candidate statuses) ----
    const [applied, interview, offer] = await Promise.all([
      db.user.count({ where: { role: 'job_seeker', status: { in: ['Applied', 'Interview', 'Offer'] } } }),
      db.user.count({ where: { role: 'job_seeker', status: { in: ['Interview', 'Offer'] } } }),
      db.user.count({ where: { role: 'job_seeker', status: 'Offer' } }),
    ])
    const funnel: FunnelData = { applied, interview, offer }

    // ---- DM stats per recruiter ----
    const participantsByConv = new Map(
      conversations.map((c) => [c.id, c.participants.map((p) => p.id)])
    )
    const dmStats: DmStatRow[] = recruiters.map((r) => {
      const sent = messages.filter((m) => m.senderId === r.id).length
      const received = messages.filter(
        (m) => m.senderId !== r.id && (participantsByConv.get(m.conversationId)?.includes(r.id) ?? false)
      ).length
      return { recruiterId: r.id, recruiterName: r.name, sent, received, total: sent + received }
    })

    // ---- Upcoming meetings (date >= today), earliest first, max 8 ----
    const upcomingMeetings = events
      .filter((e) => e.date >= today)
      .slice(0, 8)
      .map(toEventDTO)

    // ---- Candidate pipeline ----
    const pipeline: PipelineRow[] = seekers.map((s) => {
      const myConvIds = new Set(
        conversations.filter((c) => c.participants.some((p) => p.id === s.id)).map((c) => c.id)
      )
      const convMessages = messages.filter((m) => myConvIds.has(m.conversationId))
      const nextEvent = events.find((e) => e.targetUserId === s.id && e.date >= today) ?? null
      return {
        user: toSafeUser(s),
        upcomingEvent: nextEvent
          ? {
              id: nextEvent.id,
              title: nextEvent.title,
              date: nextEvent.date,
              time: nextEvent.time,
              type: nextEvent.type,
            }
          : null,
        unreadDmCount: convMessages.filter((m) => m.senderId !== s.id && !m.read).length,
        totalMessages: convMessages.length,
      }
    })

    // ---- KPIs ----
    const mostActive = [...dmStats].sort((a, b) => b.sent - a.sent)[0]
    const kpis: KpiData = {
      totalApplicants: funnel.applied,
      eventsThisMonth: events.filter((e) => e.date.startsWith(monthPrefix)).length,
      dmsExchanged: messages.length,
      mostActiveRecruiter: mostActive && mostActive.sent > 0 ? mostActive.recruiterName : '—',
    }

    // ---- Collection counts ----
    const collectionCounts: CollectionCounts = {
      users: usersCount,
      conversations: conversations.length,
      messages: messages.length,
      calendarEvents: events.length,
      notifications: notificationsCount,
      auditLogs: auditLogsCount,
      jobs: jobsCount,
      applications: applicationsCount,
    }

    const stats: CompanyStats = {
      funnel,
      dmStats,
      upcomingMeetings,
      pipeline,
      kpis,
      collectionCounts,
      dbLatencyMs,
      dbConnected: true,
    }

    return NextResponse.json(stats)
  } catch (err) {
    console.error('[company/stats:GET]', err)
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
  }
}
