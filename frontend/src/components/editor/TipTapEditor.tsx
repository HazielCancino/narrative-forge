import type { ReactElement } from 'react'
import { useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Typography from '@tiptap/extension-typography'
import { EditorToolbar } from './EditorToolbar'
import { markdownToTiptap, isTipTapJson } from '@/lib/utils/markdownToTiptap'

/* ── Constants ──────────────────────────────────────────────────── */

const AUTOSAVE_DELAY_MS = 1500

/* ── Helpers ────────────────────────────────────────────────────── */

function countWords(text: string): number {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

/**
 * Resolves the raw DB string to a value TipTap's setContent accepts.
 *
 * - Empty string → '' (TipTap renders the placeholder)
 * - TipTap JSON  → parsed object (legacy content from before this fix)
 * - Markdown     → TipTap document JSON via markdownToTiptap()
 */
function resolveContent(raw: string): object | string {
    if (raw.trim() === '') return ''

    if (isTipTapJson(raw)) {
        try {
            return JSON.parse(raw) as object
        } catch {
            // Malformed JSON — fall through to markdown parser
        }
    }

    return markdownToTiptap(raw) ?? ''
}

/* ── Props ──────────────────────────────────────────────────────── */

interface TipTapEditorProps {
    initialContent: string
    onSave: (content: string, wordCount: number) => void
    placeholder?: string
}

/* ── TipTapEditor ───────────────────────────────────────────────── */

export function TipTapEditor({
    initialContent,
    onSave,
    placeholder = 'Begin your scene…',
}: TipTapEditorProps): ReactElement {
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const onSaveRef = useRef(onSave)
    useEffect(() => { onSaveRef.current = onSave }, [onSave])

    /* ── Autosave ─────────────────────────────────────────────────── */

    const scheduleAutosave = useCallback(
        (json: string, text: string) => {
            if (debounceTimer.current !== null) clearTimeout(debounceTimer.current)
            debounceTimer.current = setTimeout(() => {
                onSaveRef.current(json, countWords(text))
            }, AUTOSAVE_DELAY_MS)
        },
        [],
    )

    useEffect(() => {
        return () => {
            if (debounceTimer.current !== null) clearTimeout(debounceTimer.current)
        }
    }, [])

    /* ── Editor instance ──────────────────────────────────────────── */

    const editor = useEditor({
        extensions: [
            StarterKit,
            Typography,
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
            CharacterCount,
        ],
        content: resolveContent(initialContent),
        editorProps: {
            attributes: {
                class: 'prose-nf focus:outline-none min-h-[400px]',
                spellcheck: 'true',
            },
        },
        onUpdate: ({ editor: e }) => {
            /*
             * Save as TipTap JSON. This is the canonical format going
             * forward — new content is always saved as JSON, old markdown
             * content is converted once on first open via resolveContent().
             */
            scheduleAutosave(
                JSON.stringify(e.getJSON()),
                e.getText(),
            )
        },
    })

    /* ── Content sync when active scene changes ───────────────────── */

    useEffect(() => {
        if (!editor) return

        if (initialContent.trim() === '') {
            editor.commands.clearContent()
            return
        }

        const resolved = resolveContent(initialContent)
        // Only update if the document actually changed to preserve undo history
        const current = JSON.stringify(editor.getJSON())
        const incoming = typeof resolved === 'string'
            ? resolved
            : JSON.stringify(resolved)

        if (current !== incoming) {
            editor.commands.setContent(resolved)
        }
    }, [editor, initialContent])

    if (!editor) return <div className="flex-1" />

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <EditorToolbar editor={editor} />
            <div className="flex-1 overflow-auto px-16 py-12">
                <div className="mx-auto max-w-prose">
                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    )
}