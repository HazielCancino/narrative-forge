import type { ReactElement } from 'react'
import type { Editor } from '@tiptap/react'
import {
    Bold,
    Italic,
    Strikethrough,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Minus,
    Undo2,
    Redo2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ── Toolbar button ─────────────────────────────────────────────── */

interface ToolbarButtonProps {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    title: string
    children: ReactElement
}

function ToolbarButton({
    onClick,
    isActive = false,
    disabled = false,
    title,
    children,
}: ToolbarButtonProps): ReactElement {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            aria-label={title}
            aria-pressed={isActive}
            className={cn(
                'flex h-7 w-7 items-center justify-center rounded',
                'transition-colors duration-150',
                isActive
                    ? 'bg-nf-accent/20 text-nf-accent'
                    : 'text-nf-text-muted hover:bg-nf-surface-bright hover:text-nf-text-secondary',
                disabled && 'opacity-30 cursor-not-allowed pointer-events-none',
            )}
        >
            {children}
        </button>
    )
}

/* ── Separator ──────────────────────────────────────────────────── */

function Sep(): ReactElement {
    return <div className="mx-1 h-4 w-px bg-nf-border-subtle" />
}

/* ── EditorToolbar ──────────────────────────────────────────────── */

interface EditorToolbarProps {
    editor: Editor
}

export function EditorToolbar({ editor }: EditorToolbarProps): ReactElement {
    return (
        <div
            role="toolbar"
            aria-label="Text formatting"
            className={cn(
                'flex items-center flex-wrap gap-0.5 px-4 py-2',
                'border-b border-nf-border-subtle',
                'bg-nf-surface-low',
            )}
        >
            {/* ── History ─────────────────────────────────────── */}
            <ToolbarButton
                onClick={() => { editor.chain().focus().undo().run() }}
                disabled={!editor.can().undo()}
                title="Undo (Ctrl+Z)"
            >
                <Undo2 size={14} />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => { editor.chain().focus().redo().run() }}
                disabled={!editor.can().redo()}
                title="Redo (Ctrl+Shift+Z)"
            >
                <Redo2 size={14} />
            </ToolbarButton>

            <Sep />

            {/* ── Headings ────────────────────────────────────── */}
            <ToolbarButton
                onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                }}
                isActive={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
            >
                <Heading2 size={14} />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                }}
                isActive={editor.isActive('heading', { level: 3 })}
                title="Heading 3"
            >
                <Heading3 size={14} />
            </ToolbarButton>

            <Sep />

            {/* ── Inline marks ────────────────────────────────── */}
            <ToolbarButton
                onClick={() => { editor.chain().focus().toggleBold().run() }}
                isActive={editor.isActive('bold')}
                title="Bold (Ctrl+B)"
            >
                <Bold size={14} />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => { editor.chain().focus().toggleItalic().run() }}
                isActive={editor.isActive('italic')}
                title="Italic (Ctrl+I)"
            >
                <Italic size={14} />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => { editor.chain().focus().toggleStrike().run() }}
                isActive={editor.isActive('strike')}
                title="Strikethrough"
            >
                <Strikethrough size={14} />
            </ToolbarButton>

            <Sep />

            {/* ── Block elements ──────────────────────────────── */}
            <ToolbarButton
                onClick={() => { editor.chain().focus().toggleBulletList().run() }}
                isActive={editor.isActive('bulletList')}
                title="Bullet list"
            >
                <List size={14} />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => { editor.chain().focus().toggleOrderedList().run() }}
                isActive={editor.isActive('orderedList')}
                title="Numbered list"
            >
                <ListOrdered size={14} />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => { editor.chain().focus().toggleBlockquote().run() }}
                isActive={editor.isActive('blockquote')}
                title="Blockquote"
            >
                <Quote size={14} />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => { editor.chain().focus().setHorizontalRule().run() }}
                title="Horizontal rule"
            >
                <Minus size={14} />
            </ToolbarButton>
        </div>
    )
}