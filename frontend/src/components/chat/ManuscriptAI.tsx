import type { ReactElement, KeyboardEvent } from 'react'
import { useState, useRef, useEffect } from 'react'
import { Send, Trash2, Bot, AlertCircle } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import { useChat } from '@/hooks/useChat'
import { cn } from '@/lib/utils'

/* ── Props ──────────────────────────────────────────────────────── */

interface ManuscriptAIProps {
    projectTitle: string
    projectGenre: string
    sceneTitle: string
}

/* ── ManuscriptAI ───────────────────────────────────────────────── */

export function ManuscriptAI({
    projectTitle,
    projectGenre,
    sceneTitle,
}: ManuscriptAIProps): ReactElement {
    const [input, setInput] = useState('')
    const bottomRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const { messages, isStreaming, error, sendMessage, clearMessages } =
        useChat()

    /* Auto-scroll to bottom on every new chunk */
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    /* ── Send ─────────────────────────────────────────────────── */

    function handleSend(): void {
        if (!input.trim() || isStreaming) return

        void sendMessage(input, {
            title: projectTitle,
            genre: projectGenre,
            current_scene_title: sceneTitle,
        })

        setInput('')
        /* Reset textarea height after clearing */
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }
    }

    function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>): void {
        /* Enter sends; Shift+Enter inserts newline */
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    /* Auto-resize textarea as the user types */
    function handleInput(): void {
        const el = textareaRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    }

    /* ── Empty state ────────────────────────────────────────────── */

    const isEmpty = messages.length === 0

    /* ── Render ─────────────────────────────────────────────────── */

    return (
        <div
            className={cn(
                'flex w-80 shrink-0 flex-col',
                'border-l border-nf-border-subtle',
                'bg-nf-surface-low',
            )}
            aria-label="Manuscript AI chat panel"
        >
            {/* ── Header ─────────────────────────────────────────── */}
            <div
                className={cn(
                    'flex items-center justify-between',
                    'border-b border-nf-border-subtle px-4 py-3',
                )}
            >
                <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-nf-secondary/20">
                        <Bot size={12} className="text-nf-secondary" />
                    </div>
                    <span className="font-label text-[10px] uppercase tracking-widest text-nf-text-muted">
                        Manuscript AI
                    </span>
                    {/* Live indicator */}
                    <span
                        aria-label={isStreaming ? 'AI is responding' : 'AI ready'}
                        className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            isStreaming
                                ? 'animate-pulse bg-nf-secondary'
                                : 'bg-nf-text-disabled',
                        )}
                    />
                </div>

                {messages.length > 0 && (
                    <button
                        type="button"
                        onClick={clearMessages}
                        disabled={isStreaming}
                        aria-label="Clear conversation"
                        className="text-nf-text-disabled hover:text-nf-text-muted transition-colors"
                    >
                        <Trash2 size={13} />
                    </button>
                )}
            </div>

            {/* ── Messages ───────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
                {isEmpty && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 py-8 text-center">
                        <Bot
                            size={32}
                            strokeWidth={0.75}
                            className="text-nf-accent opacity-20"
                        />
                        <div className="space-y-1">
                            <p className="font-headline italic text-sm text-nf-text-muted">
                                Ask anything about your story.
                            </p>
                            <p className="font-label text-[10px] text-nf-text-disabled leading-relaxed">
                                Expand a scene, suggest a conflict, rewrite a paragraph — your
                                world, your voice.
                            </p>
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        isStreaming={isStreaming && i === messages.length - 1}
                    />
                ))}

                {/* Error banner */}
                {error !== null && (
                    <div
                        role="alert"
                        className={cn(
                            'flex items-start gap-2 rounded-lg p-3',
                            'bg-nf-error/10 text-nf-error',
                        )}
                    >
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        <p className="font-label text-[10px] leading-relaxed">{error}</p>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* ── Context badge ───────────────────────────────────── */}
            {sceneTitle !== '' && (
                <div className="border-t border-nf-border-subtle px-3 py-1.5">
                    <p className="font-label text-[10px] text-nf-text-disabled truncate">
                        Context:{' '}
                        <span className="text-nf-text-muted">{sceneTitle}</span>
                    </p>
                </div>
            )}

            {/* ── Input ──────────────────────────────────────────── */}
            <div
                className={cn(
                    'border-t border-nf-border-subtle p-3',
                    'flex items-end gap-2',
                )}
            >
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => { setInput(e.target.value) }}
                    onKeyDown={handleKeyDown}
                    onInput={handleInput}
                    disabled={isStreaming}
                    placeholder="Ask the AI… (Enter to send)"
                    rows={1}
                    className={cn(
                        'flex-1 resize-none rounded-md',
                        'bg-nf-surface-high border border-nf-border',
                        'px-3 py-2 font-label text-xs text-nf-text-primary',
                        'placeholder:text-nf-text-disabled',
                        'focus:outline-none focus:border-nf-accent focus:ring-1 focus:ring-nf-accent',
                        'disabled:opacity-50',
                        'max-h-[120px] overflow-y-auto',
                    )}
                />

                <button
                    type="button"
                    onClick={handleSend}
                    disabled={!input.trim() || isStreaming}
                    aria-label="Send message"
                    className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                        'bg-nf-accent/10 text-nf-accent',
                        'transition-all duration-150',
                        'hover:bg-nf-accent/20',
                        'disabled:opacity-30 disabled:cursor-not-allowed',
                    )}
                >
                    <Send size={14} />
                </button>
            </div>
        </div>
    )
}