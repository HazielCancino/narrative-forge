import type { ReactElement } from 'react'
import { useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Typography from '@tiptap/extension-typography'
import { EditorToolbar } from './EditorToolbar'

/* ── Constants ──────────────────────────────────────────────────── */

/** Debounce delay in ms before autosave fires after the user stops typing */
const AUTOSAVE_DELAY_MS = 1500

/* ── Helpers ────────────────────────────────────────────────────── */

function countWords(text: string): number {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

/* ── Props ──────────────────────────────────────────────────────── */

interface TipTapEditorProps {
    /** TipTap JSON string or empty string for a new scene */
    initialContent: string
    /** Called on every autosave tick with the latest JSON + word count */
    onSave: (content: string, wordCount: number) => void
    /** Optional placeholder text */
    placeholder?: string
}

/* ── TipTapEditor ───────────────────────────────────────────────── */

export function TipTapEditor({
    initialContent,
    onSave,
    placeholder = 'Begin your scene…',
}: TipTapEditorProps): ReactElement {
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    /*
     * Stable ref to onSave so the debounce closure never captures a
     * stale version. Without this, updating onSave (e.g. when the
     * active scene changes) wouldn't take effect until the next mount.
     */
    const onSaveRef = useRef(onSave)
    useEffect(() => { onSaveRef.current = onSave }, [onSave])

    /* ── Autosave handler ─────────────────────────────────────────── */

    const scheduleAutosave = useCallback(
        (json: string, text: string) => {
            if (debounceTimer.current !== null) {
                clearTimeout(debounceTimer.current)
            }
            debounceTimer.current = setTimeout(() => {
                onSaveRef.current(json, countWords(text))
            }, AUTOSAVE_DELAY_MS)
        },
        [],
    )

    useEffect(() => {
        return () => {
            if (debounceTimer.current !== null) {
                clearTimeout(debounceTimer.current)
            }
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
        content: initialContent !== '' ? (JSON.parse(initialContent) as object) : '',
        editorProps: {
            attributes: {
                /*
                 * prose-nf: custom class applied via globals.css below.
                 * We avoid Tailwind's prose plugin to keep full control over
                 * the serif typography and line-height for the writing view.
                 */
                class: 'prose-nf focus:outline-none min-h-[400px]',
                spellcheck: 'true',
            },
        },
        onUpdate: ({ editor: e }) => {
            scheduleAutosave(
                JSON.stringify(e.getJSON()),
                e.getText(),
            )
        },
    })

    /*
     * When the user switches scenes, the editor content must change.
     * We cannot remount the editor (that would reset undo history), so
     * we use setContent instead. Guard against content-while-focused
     * conflicts by checking if the parsed content matches the current.
     */
    useEffect(() => {
        if (!editor) return
        if (initialContent === '') {
            editor.commands.clearContent()
            return
        }
        try {
            const parsed = JSON.parse(initialContent) as object
            const current = JSON.stringify(editor.getJSON())
            if (current !== initialContent) {
                editor.commands.setContent(parsed)
            }
        } catch {
            // initialContent was not valid JSON — ignore
        }
    }, [editor, initialContent])

    if (!editor) return <div className="flex-1" />

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <EditorToolbar editor={editor} />

            <div className="flex-1 overflow-auto px-16 py-12">
                {/*
         * max-w-prose keeps the line length comfortable for long-form
         * writing (~65–75 chars) — a standard editorial choice.
         */}
                <div className="mx-auto max-w-prose">
                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    )
}