'use client'

/**
 * TalentBridge_V2 — Command Center "Cyber Security" tab (Vikram Rao).
 * Login-activity audit log (dark glass table) + glowing security checklist.
 */
import {
  CheckCircle2,
  Database,
  Eye,
  FileClock,
  KeyRound,
  Lock,
  ScrollText,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { AuditLogDTO } from '@/lib/types'
import { formatDateTime } from './tb-utils'
import { MotionCard } from './tb-motion'

const CHECKLIST = [
  { icon: Lock, label: 'bcrypt password hashing' },
  { icon: KeyRound, label: 'JWT session tokens' },
  { icon: UserCheck, label: 'Role-based API guards' },
  { icon: ShieldCheck, label: 'Zod input validation' },
  { icon: FileClock, label: 'Audit logging enabled' },
  { icon: Eye, label: 'Read-only observer mode' },
]

function ActionBadge({ action }: { action: string }) {
  const map: Record<string, string> = {
    login: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
    create_event: 'border-violet-400/30 bg-violet-500/10 text-violet-300',
    send_message: 'border-blue-400/30 bg-blue-500/10 text-blue-300',
  }
  return (
    <Badge variant="outline" className={map[action] ?? 'border-white/10 bg-white/5 text-zinc-300'}>
      {action}
    </Badge>
  )
}

export function CompanyCyberTab({ logs }: { logs: AuditLogDTO[] }) {
  return (
    <div className="space-y-4">
      <MotionCard accent="violet" interactive={false} className="p-5">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <ScrollText className="size-3.5 text-violet-300" aria-hidden /> Login activity (audit log)
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">Latest 50 recorded actions, newest first</p>
        <div className="mt-4">
          {logs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No audit entries yet</p>
          ) : (
            <div className="max-h-96 overflow-y-auto rounded-lg border border-white/[0.06]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-[oklch(0.17_0.022_275/95%)] backdrop-blur">
                  <TableRow className="border-white/8 hover:bg-transparent">
                    <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-300/80">
                      User
                    </TableHead>
                    <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-300/80">
                      Role
                    </TableHead>
                    <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-300/80">
                      Action
                    </TableHead>
                    <TableHead className="h-9 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-300/80">
                      Timestamp
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow
                      key={log.id}
                      className="border-white/[0.06] transition-colors duration-200 hover:bg-white/[0.04]"
                    >
                      <TableCell className="font-medium">{log.userName}</TableCell>
                      <TableCell className="text-muted-foreground">{log.userRole}</TableCell>
                      <TableCell>
                        <ActionBadge action={log.action} />
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {formatDateTime(log.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </MotionCard>

      <MotionCard accent="violet" interactive={false} className="p-5" delay={0.05}>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <ShieldCheck className="size-3.5 text-violet-300" aria-hidden /> Security checklist
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">Platform security posture at a glance</p>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {CHECKLIST.map((item) => (
            <div
              key={item.label}
              className={cn(
                'flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] p-3',
                'transition-all duration-200 hover:border-emerald-400/25 hover:bg-white/[0.06]',
              )}
            >
              <CheckCircle2
                className="size-4 shrink-0 text-emerald-400 drop-shadow-[0_0_6px_oklch(0.7_0.15_162/0.6)]"
                aria-hidden
              />
              <item.icon className="size-4 shrink-0 text-violet-300" aria-hidden />
              <span className="text-sm text-foreground/90">{item.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Database className="size-3.5" aria-hidden />
          All sessions are bearer-token based; expired or invalid tokens receive HTTP 401 and are logged out client-side.
        </p>
      </MotionCard>
    </div>
  )
}
