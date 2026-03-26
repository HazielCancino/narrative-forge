import type { ReactElement } from 'react'
import { Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/hooks/useChat'

/* ── Streaming cursor ───────────────────────────────────────────── */

function Cursor(): ReactElement {
    return (
        <span
            aria-hidden
            className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-nf-accent align-middle"
        />
    )
}

/* ── MessageBubble ──────────────────────────────────────────────── */

interface MessageBubbleProps {
    message: ChatMessage
    isStreaming: boolean
}

export function MessageBubble({
    message,
    isStreaming,
}: MessageBubbleProps): ReactElement {
    const isUser = message.role === 'user'
    const isLastEmpty = message.content === '' && isStreaming

    return (
        <div
            className={cn(
                'flex gap-2.5',
                isUser ? 'flex-row-reverse' : 'flex-row',
            )}
        >
            {/* Avatar */}
            <div
                aria-hidden
                className={cn(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                    isUser
                        ? 'bg-nf-accent/20'
                        : 'bg-nf-surface-highest',
                )}
            >
                {isUser
                    ? <User size={12} className="text-nf-accent" />
                    : <Bot size={12} className="text-nf-secondary" />
                }
            </div>

            {/* Bubble */}
            <div
                className={cn(
                    'max-w-[85%] rounded-lg px-3 py-2',
                    'font-body text-sm leading-relaxed',
                    isUser
                        ? 'bg-nf-accent/10 text-nf-text-primary'
                        : 'bg-nf-surface-high text-nf-text-secondary',
                )}
            >
                {isLastEmpty ? (
                    /* Thinking indicator while the first chunk hasn't arrived */
                    <span className="flex items-center gap-1">
                        <span className="font-label text-[10px] italic text-nf-text-disabled">
                            Thinking
                        </span>
                        <Cursor />
                    </span>
                ) : (
                    <>
                        {/*
             * White-space preserved so multi-paragraph responses from
             * the LLM render with line breaks intact.
             */}
                        <span className="whitespace-pre-wrap">{message.content}</span>
                        {/* Append cursor to the last assistant message while streaming */}
                        {!isUser && isStreaming && <Cursor />}
                    </>
                )}
            </div>
        </div>
    )
}