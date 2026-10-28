'use client'

/**
 * TalentBridge_V2 — two-pane real-time chat (job seeker & recruiter).
 * Premium dark messenger: gradient-ring avatars, layoutId active highlight,
 * spring-in bubbles (mine = role gradient, theirs = glass), rotating send.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Inbox, Loader2, MessagesSquare, SendHorizontal } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api-client'
import type { ConversationDTO, SafeUser } from '@/lib/types'
import { useAuthGuard, useAuthErrorEffect } from './auth-context'
import { accentClasses, initials, roleTheme, timeAgo, toastError, type Accent } from './tb-utils'
import { LiveDot, spring } from './tb-motion'

interface Props {
  user: SafeUser
  accent: Accent
  selectedId: string | null
  onSelect: (conversationId: string) => void
}

function ConversationRow({
  conv,
  myId,
  theme,
  active,
  onClick,
}: {
  conv: ConversationDTO
  myId: string
  theme: (typeof roleTheme)[Accent]
  active: boolean
  onClick: () => void
}) {
  const other = conv.participants.find((p) => p.id !== myId) ?? conv.participants[0]
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left outline-none transition-colors duration-200',
        active ? 'bg-white/[0.04]' : 'hover:bg-white/[0.05]',
      )}
    >
      {active && (
        <motion.span
          layoutId="tb-chat-active"
          className={cn('absolute inset-0 rounded-lg border border-white/10 bg-gradient-to-r', theme.activePill)}
          transition={spring}
        />
      )}
      <span className={cn('relative z-10 shrink-0 rounded-full bg-gradient-to-br p-[2px]', theme.avatarRing)}>
        <Avatar className="size-9">
          <AvatarFallback className="rounded-full bg-[oklch(0.19_0.022_275)] text-xs font-semibold text-white">
            {initials(other?.name ?? '?')}
          </AvatarFallback>
        </Avatar>
      </span>
      <span className="relative z-10 min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-foreground">{other?.name ?? 'Unknown'}</span>
          <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(conv.lastMessageAt)}</span>
        </span>
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-xs text-muted-foreground">
            {conv.lastMessage ? conv.lastMessage.text : 'No messages yet'}
          </span>
          {conv.unreadCount > 0 && (
            <span
              className={cn(
                'flex h-5 min-w-5 shrink-0 animate-pulse items-center justify-center rounded-full bg-gradient-to-r px-1.5 text-[10px] font-bold text-white',
                theme.gradient,
              )}
            >
              {conv.unreadCount}
            </span>
          )}
        </span>
      </span>
    </button>
  )
}

export function ChatView({ user, accent, selectedId, onSelect }: Props) {
  const guard = useAuthGuard()
  const queryClient = useQueryClient()
  const theme = roleTheme[accent]
  const acc = accentClasses[accent]
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const conversationsQuery = useQuery({
    queryKey: ['conversations'],
    queryFn: api.getConversations,
    refetchInterval: 3500,
  })

  const messagesQuery = useQuery({
    queryKey: ['messages', selectedId],
    queryFn: () => api.getMessages(selectedId as string),
    enabled: Boolean(selectedId),
    refetchInterval: 3500,
  })

  useAuthErrorEffect(conversationsQuery.error)
  useAuthErrorEffect(messagesQuery.error)

  const conversations = useMemo(
    () =>
      [...(conversationsQuery.data?.conversations ?? [])].sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
      ),
    [conversationsQuery.data],
  )

  const selected = conversations.find((c) => c.id === selectedId) ?? null
  const other = selected?.participants.find((p) => p.id !== user.id) ?? null
  const messages = messagesQuery.data?.messages ?? []

  // Auto-scroll (smooth) to the newest message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, selectedId])

  const send = useMutation({
    mutationFn: (text: string) => api.sendMessage(selectedId as string, text),
    onSuccess: () => {
      setDraft('')
      queryClient.invalidateQueries({ queryKey: ['messages', selectedId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (err: Error) => {
      guard(err)
      toastError(err.message)
    },
  })

  return (
    <div className="grid h-full min-h-0 grid-cols-1 overflow-hidden rounded-xl border border-white/8 bg-white/[0.02] shadow-[0_18px_60px_-24px_oklch(0_0_0/55%)] backdrop-blur-xl md:grid-cols-[320px_1fr]">
      {/* Conversation list */}
      <div className={cn('flex min-h-0 flex-col border-b border-white/8 md:border-b-0 md:border-r', 'max-h-56 md:max-h-none')}>
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
          <MessagesSquare className={cn('size-4', theme.text)} aria-hidden />
          <p className="text-sm font-semibold tracking-tight">Conversations</p>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-1 p-2">
            {conversationsQuery.isLoading && (
              <div className="space-y-2 p-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg bg-white/5" />
                ))}
              </div>
            )}
            {!conversationsQuery.isLoading && conversations.length === 0 && (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <Inbox className="size-8 text-muted-foreground/50" aria-hidden />
                <p className="text-sm text-muted-foreground">
                  No messages yet — start a conversation from the dashboard
                </p>
              </div>
            )}
            {conversations.map((c) => (
              <ConversationRow
                key={c.id}
                conv={c}
                myId={user.id}
                theme={theme}
                active={c.id === selectedId}
                onClick={() => onSelect(c.id)}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Thread */}
      <div className="flex min-h-0 flex-col">
        {!selected ? (
          <div className="bg-cosmos-soft flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04]">
              <MessagesSquare className="size-6 text-muted-foreground/60" aria-hidden />
            </span>
            <p className="text-sm text-muted-foreground">Select a conversation to start messaging</p>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="glass flex items-center gap-3 border-b border-white/8 px-4 py-3">
              <span className={cn('shrink-0 rounded-full bg-gradient-to-br p-[2px]', theme.avatarRing)}>
                <Avatar className="size-9">
                  <AvatarFallback className="rounded-full bg-[oklch(0.19_0.022_275)] text-xs font-semibold text-white">
                    {initials(other?.name ?? '?')}
                  </AvatarFallback>
                </Avatar>
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight">{other?.name ?? 'Unknown'}</p>
                <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                  <LiveDot tone="emerald" className="scale-75" /> {other?.title ?? '—'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="bg-cosmos-soft relative min-h-0 flex-1">
              <ScrollArea className="h-full">
                <div className="space-y-3 p-4">
                  {messagesQuery.isLoading && (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-2/3 rounded-xl bg-white/5" />
                      ))}
                    </div>
                  )}
                  <AnimatePresence initial={false}>
                    {messages.map((m) => {
                      const mine = m.senderId === user.id
                      return (
                        <motion.div
                          key={m.id}
                          layout="position"
                          initial={{ opacity: 0, y: 12, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={spring}
                          className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}
                        >
                          <div
                            className={cn(
                              'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                              mine
                                ? cn(
                                    'rounded-br-md bg-gradient-to-br text-white',
                                    theme.gradient,
                                    acc.glow,
                                  )
                                : 'rounded-bl-md border border-white/8 bg-white/[0.06] text-foreground backdrop-blur',
                            )}
                          >
                            {!mine && (
                              <p className="mb-0.5 text-[10px] font-semibold text-muted-foreground">
                                {m.senderName}
                              </p>
                            )}
                            <p className="whitespace-pre-wrap break-words">{m.text}</p>
                          </div>
                          <span className="mt-0.5 px-1 text-[10px] text-muted-foreground/70">
                            {timeAgo(m.createdAt)}
                          </span>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Composer */}
            <form
              className="glass flex items-center gap-2 border-t border-white/8 p-3"
              onSubmit={(e) => {
                e.preventDefault()
                const text = draft.trim()
                if (!text || send.isPending) return
                send.mutate(text)
              }}
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                aria-label="Message"
                maxLength={1000}
                className="border-white/10 bg-white/[0.05] focus-visible:ring-ring/40"
              />
              <motion.button
                type="submit"
                aria-label="Send message"
                disabled={!draft.trim() || send.isPending}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg transition-all duration-200 hover:-rotate-12 hover:brightness-110 disabled:opacity-40 disabled:hover:rotate-0',
                  theme.gradient,
                  acc.glow,
                )}
              >
                {send.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <SendHorizontal className="size-4" aria-hidden />
                )}
              </motion.button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
