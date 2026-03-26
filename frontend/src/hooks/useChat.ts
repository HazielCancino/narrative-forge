import { useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useUIStore } from '@/lib/store/uiStore'

/* ── Types ──────────────────────────────────────────────────────── */

export interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
}

export interface ProjectContextPayload {
    title: string
    genre: string
    current_scene_title: string
}

/* ── Helpers ────────────────────────────────────────────────────── */

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

/* ── Hook ───────────────────────────────────────────────────────── */

interface UseChatReturn {
    messages: ChatMessage[]
    isStreaming: boolean
    error: string | null
    sendMessage: (content: string, ctx: ProjectContextPayload) => Promise<void>
    clearMessages: () => void
}

export function useChat(): UseChatReturn {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isStreaming, setIsStreaming] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const abortRef = useRef<AbortController | null>(null)

    const setLLMStatus = useUIStore((s) => s.setLLMStatus)
    const incrementTokens = useUIStore((s) => s.incrementTokenCount)

    /* ── sendMessage ────────────────────────────────────────────── */

    const sendMessage = useCallback(
        async (content: string, ctx: ProjectContextPayload): Promise<void> => {
            if (!content.trim() || isStreaming) return

            setError(null)

            const userMessage: ChatMessage = {
                id: generateId(),
                role: 'user',
                content: content.trim(),
            }
            setMessages((prev) => [...prev, userMessage])

            const assistantId = generateId()
            setMessages((prev) => [
                ...prev,
                { id: assistantId, role: 'assistant', content: '' },
            ])

            setIsStreaming(true)

            /* ── Auth token ─────────────────────────────────────────── */
            const { data: { session }, error: sessionError } =
                await supabase.auth.getSession()

            if (sessionError !== null || session === null) {
                setError('Not authenticated. Please log in again.')
                setIsStreaming(false)
                return
            }

            /* ── Build request body ─────────────────────────────────── */
            const body = {
                messages: [
                    ...messages.map((m) => ({ role: m.role, content: m.content })),
                    { role: 'user', content: content.trim() },
                ],
                project_context: {
                    title: ctx.title,
                    genre: ctx.genre,
                    current_scene_title: ctx.current_scene_title,
                    active_characters: [],
                },
                model_config: {
                    provider: 'ollama',
                    model: 'llama3',
                    temperature: 0.8,
                    api_base: 'http://localhost:11434',
                },
            }

            /* ── Fetch + ReadableStream ──────────────────────────────── */
            abortRef.current = new AbortController()

            try {
                const apiUrl = (import.meta.env.VITE_API_URL as string | undefined)
                    ?? 'http://localhost:8000'

                const response = await fetch(`${apiUrl}/api/v1/chat/stream`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify(body),
                    signal: abortRef.current.signal,
                })

                if (!response.ok) {
                    /*
                     * Read the full error body so we can show something useful
                     * instead of just the HTTP status code.
                     */
                    const errorText = await response.text().catch(() => response.statusText)
                    throw new Error(
                        `Server error ${response.status}: ${errorText}`,
                    )
                }

                if (!response.body) {
                    throw new Error('Response body is null.')
                }

                setLLMStatus(true, 'ollama', 'llama3')

                const reader = response.body.getReader()
                const decoder = new TextDecoder()
                let buffer = ''

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    buffer += decoder.decode(value, { stream: true })
                    const lines = buffer.split('\n')
                    buffer = lines.pop() ?? ''

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue

                        const raw = line.slice(6).trim()
                        if (raw === '[DONE]') break

                        try {
                            const parsed = JSON.parse(raw) as {
                                content?: string
                                error?: string
                            }

                            if (parsed.error) {
                                setError(parsed.error)
                                break
                            }

                            if (parsed.content) {
                                setMessages((prev) =>
                                    prev.map((m) =>
                                        m.id === assistantId
                                            ? { ...m, content: m.content + parsed.content }
                                            : m,
                                    ),
                                )
                                incrementTokens(
                                    Math.round(parsed.content.split(' ').length * 1.3),
                                )
                            }
                        } catch {
                            /* Malformed JSON line — skip */
                        }
                    }
                }
            } catch (err: unknown) {
                if (err instanceof DOMException && err.name === 'AbortError') return

                const message = err instanceof Error
                    ? err.message
                    : 'Unknown error.'

                /*
                 * "Failed to fetch" / "NetworkError when attempting to fetch resource"
                 * almost always means one of:
                 *   a) The backend is not running (check http://localhost:8000/api/v1/health)
                 *   b) CORS is blocking the request
                 *   c) VITE_API_URL is wrong or missing
                 */
                const isNetworkError =
                    message.includes('Failed to fetch') ||
                    message.includes('NetworkError')

                setError(
                    isNetworkError
                        ? `Cannot reach the backend. Is it running on ${(import.meta.env.VITE_API_URL as string | undefined)
                        ?? 'http://localhost:8000'
                        }? Check the terminal where you ran "poetry run uvicorn".`
                        : message,
                )

                setLLMStatus(false)
            } finally {
                setIsStreaming(false)
                abortRef.current = null
            }
        },
        [messages, isStreaming, setLLMStatus, incrementTokens],
    )

    /* ── clearMessages ──────────────────────────────────────────── */

    const clearMessages = useCallback((): void => {
        abortRef.current?.abort()
        setMessages([])
        setError(null)
        setIsStreaming(false)
    }, [])

    return { messages, isStreaming, error, sendMessage, clearMessages }
}