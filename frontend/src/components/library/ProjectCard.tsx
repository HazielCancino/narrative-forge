import type { ReactElement } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    MoreHorizontal,
    Archive,
    Trash2,
    AlertTriangle,
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useProjectStore } from '@/lib/store/projectStore'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/database'

/* ── Helpers ────────────────────────────────────────────────────── */

function formatWordCount(count: number): string {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k words`
    return `${count} ${count === 1 ? 'word' : 'words'}`
}

function formatRelativeDate(dateString: string): string {
    const date = new Date(dateString)
    const diffMs = Date.now() - date.getTime()
    const diffDays = Math.floor(diffMs / 86_400_000)

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    })
}

/* ── Status visual config ───────────────────────────────────────── */

const STATUS_CONFIG = {
    active: {
        border: 'border-nf-accent',
        badge: 'bg-nf-accent/10 text-nf-accent',
        label: 'Active',
    },
    completed: {
        border: 'border-nf-secondary',
        badge: 'bg-nf-secondary/10 text-nf-secondary',
        label: 'Completed',
    },
    archived: {
        border: 'border-nf-text-disabled',
        badge: 'bg-nf-surface-high text-nf-text-disabled',
        label: 'Archived',
    },
} satisfies Record<
    Project['status'],
    { border: string; badge: string; label: string }
>

/* ── Props ──────────────────────────────────────────────────────── */

interface ProjectCardProps {
    project: Project
    onArchive: () => void
    onDelete: () => void
    isArchiving: boolean
    isDeleting: boolean
}

/* ── Component ──────────────────────────────────────────────────── */

export function ProjectCard({
    project,
    onArchive,
    onDelete,
    isArchiving,
    isDeleting,
}: ProjectCardProps): ReactElement {
    const navigate = useNavigate()
    const setCurrentProject = useProjectStore((s) => s.setCurrentProject)
    const [pendingDelete, setPendingDelete] = useState(false)

    const statusCfg = STATUS_CONFIG[project.status]

    /* Click the card body → open project */
    function handleOpen(): void {
        setCurrentProject(project)
        void navigate('/writing')
    }

    /*
     * Two-step delete: first click arms, second click confirms.
     * The 3-second timeout disarms automatically so a mis-click
     * doesn't cause an accidental deletion.
     */
    function handleDeleteClick(): void {
        if (!pendingDelete) {
            setPendingDelete(true)
            window.setTimeout(() => { setPendingDelete(false) }, 3000)
            return
        }
        onDelete()
    }

    return (
        <article
            onClick={handleOpen}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') handleOpen() }}
            aria-label={`Open project: ${project.title}`}
            className={cn(
                'group relative flex flex-col gap-4 p-6',
                'bg-nf-surface rounded-lg',
                'border-l-4',
                statusCfg.border,
                'cursor-pointer select-none',
                'transition-all duration-300',
                'hover:bg-nf-surface-high hover:-translate-y-0.5',
                'hover:shadow-[0_20px_40px_rgba(6,14,32,0.4)]',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-nf-accent',
            )}
        >
            {/* ── Header ─────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h2 className="font-headline italic text-xl text-nf-text-primary truncate">
                        {project.title}
                    </h2>
                    {project.genre !== null && (
                        <span className="font-label text-[10px] uppercase tracking-widest text-nf-text-muted">
                            {project.genre}
                        </span>
                    )}
                </div>

                {/*
         * stopPropagation prevents the card's onClick from firing
         * when the user interacts with the dropdown.
         */}
                <div onClick={(e) => { e.stopPropagation() }}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={cn(
                                    'p-1.5 rounded-md',
                                    'text-nf-text-disabled hover:text-nf-text-secondary',
                                    'hover:bg-nf-surface-highest',
                                    'opacity-0 group-hover:opacity-100',
                                    'transition-all duration-200',
                                )}
                                aria-label="Project options"
                            >
                                <MoreHorizontal size={16} />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-44">
                            {project.status !== 'archived' && (
                                <DropdownMenuItem
                                    onClick={onArchive}
                                    disabled={isArchiving}
                                    className="gap-2 cursor-pointer"
                                >
                                    <Archive size={14} />
                                    Archive
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={handleDeleteClick}
                                disabled={isDeleting}
                                className={cn(
                                    'gap-2 cursor-pointer',
                                    pendingDelete
                                        ? 'text-nf-error focus:text-nf-error'
                                        : '',
                                )}
                            >
                                {pendingDelete ? (
                                    <>
                                        <AlertTriangle size={14} />
                                        Confirm delete
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={14} />
                                        Delete
                                    </>
                                )}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* ── Description ────────────────────────────────────── */}
            {project.description !== null ? (
                <p className="flex-1 font-body text-sm text-nf-text-secondary leading-relaxed line-clamp-2">
                    {project.description}
                </p>
            ) : (
                <p className="flex-1 font-body text-sm italic text-nf-text-disabled">
                    No description yet.
                </p>
            )}

            {/* ── Footer ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between pt-2 border-t border-nf-border-subtle">
                <div className="flex items-center gap-2">
                    <span className="font-label text-[10px] text-nf-text-muted">
                        {formatWordCount(project.word_count)}
                    </span>
                    <span className="text-nf-text-disabled text-xs">·</span>
                    <span className="font-label text-[10px] text-nf-text-muted">
                        {formatRelativeDate(project.updated_at)}
                    </span>
                </div>

                <span
                    className={cn(
                        'font-label text-[10px] uppercase tracking-wider',
                        'px-2 py-0.5 rounded-full',
                        statusCfg.badge,
                    )}
                >
                    {statusCfg.label}
                </span>
            </div>
        </article>
    )
}