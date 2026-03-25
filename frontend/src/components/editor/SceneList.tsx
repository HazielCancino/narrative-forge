import type { ReactElement, KeyboardEvent } from 'react'
import { useState, useRef, useEffect } from 'react'
import {
    Plus,
    Trash2,
    ScrollText,
    Loader2,
} from 'lucide-react'
import {
    useCreateScene,
    useDeleteScene,
    useUpdateSceneTitle,
} from '@/hooks/useScene'
import { cn } from '@/lib/utils'
import type { Scene } from '@/types/database'

/* ── Helpers ────────────────────────────────────────────────────── */

function formatWordCount(n: number): string {
    if (n === 0) return 'empty'
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
    return `${n}w`
}

/* ── SceneItem ──────────────────────────────────────────────────── */

interface SceneItemProps {
    scene: Scene
    isActive: boolean
    onSelect: (scene: Scene) => void
    onDelete: (id: string) => void
    isDeleting: boolean
}

function SceneItem({
    scene,
    isActive,
    onSelect,
    onDelete,
    isDeleting,
}: SceneItemProps): ReactElement {
    const [isEditing, setIsEditing] = useState(false)
    const [titleDraft, setTitleDraft] = useState(scene.title)
    const inputRef = useRef<HTMLInputElement>(null)
    const updateTitle = useUpdateSceneTitle()

    /* Focus input when edit mode opens */
    useEffect(() => {
        if (isEditing) {
            setTimeout(() => { inputRef.current?.select() }, 0)
        }
    }, [isEditing])

    function commitRename(): void {
        const trimmed = titleDraft.trim()
        if (trimmed !== '' && trimmed !== scene.title) {
            updateTitle.mutate({ id: scene.id, title: trimmed })
        } else {
            setTitleDraft(scene.title)
        }
        setIsEditing(false)
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
        if (e.key === 'Enter') { commitRename(); return }
        if (e.key === 'Escape') {
            setTitleDraft(scene.title)
            setIsEditing(false)
        }
    }

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => { if (!isEditing) onSelect(scene) }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !isEditing) onSelect(scene) }}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
                'group flex items-start gap-2 px-3 py-2.5 rounded-md',
                'cursor-pointer transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-nf-accent',
                isActive
                    ? 'bg-nf-surface-highest text-nf-text-primary'
                    : 'text-nf-text-muted hover:bg-nf-surface hover:text-nf-text-secondary',
            )}
        >
            <ScrollText
                size={14}
                strokeWidth={1.5}
                className="mt-0.5 shrink-0 text-nf-text-disabled"
            />

            <div className="min-w-0 flex-1">
                {isEditing ? (
                    <input
                        ref={inputRef}
                        value={titleDraft}
                        onChange={(e) => { setTitleDraft(e.target.value) }}
                        onBlur={commitRename}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => { e.stopPropagation() }}
                        className={cn(
                            'w-full bg-transparent font-label text-xs',
                            'text-nf-text-primary outline-none',
                            'border-b border-nf-accent',
                        )}
                    />
                ) : (
                    <span
                        onDoubleClick={(e) => {
                            e.stopPropagation()
                            setIsEditing(true)
                        }}
                        className="block truncate font-label text-xs leading-snug"
                    >
                        {scene.title}
                    </span>
                )}

                <span className="font-label text-[10px] text-nf-text-disabled">
                    {formatWordCount(scene.word_count)}
                </span>
            </div>

            {/* Delete button — visible on hover */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation()
                    onDelete(scene.id)
                }}
                disabled={isDeleting}
                aria-label={`Delete scene: ${scene.title}`}
                className={cn(
                    'shrink-0 rounded p-0.5 mt-0.5',
                    'text-nf-text-disabled hover:text-nf-error',
                    'transition-colors duration-150',
                    'opacity-0 group-hover:opacity-100',
                    isDeleting && 'cursor-wait',
                )}
            >
                <Trash2 size={12} />
            </button>
        </div>
    )
}

/* ── SceneList ──────────────────────────────────────────────────── */

interface SceneListProps {
    scenes: Scene[]
    activeSceneId: string | null
    projectId: string
    isLoading: boolean
    onSelectScene: (scene: Scene) => void
}

export function SceneList({
    scenes,
    activeSceneId,
    projectId,
    isLoading,
    onSelectScene,
}: SceneListProps): ReactElement {
    const createScene = useCreateScene()
    const deleteScene = useDeleteScene()

    function handleNewScene(): void {
        createScene.mutate(
            {
                project_id: projectId,
                title: `Scene ${scenes.length + 1}`,
            },
            {
                /*
                 * Auto-select the newly created scene so the user can start
                 * writing immediately without an extra click.
                 */
                onSuccess: (scene) => { onSelectScene(scene) },
            },
        )
    }

    return (
        <aside
            className={cn(
                'flex w-56 shrink-0 flex-col',
                'border-r border-nf-border-subtle',
                'bg-nf-surface-low',
            )}
            aria-label="Scene list"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-3 border-b border-nf-border-subtle">
                <span className="font-label text-[10px] uppercase tracking-widest text-nf-text-disabled">
                    Scenes
                </span>
                <button
                    type="button"
                    onClick={handleNewScene}
                    disabled={createScene.isPending}
                    aria-label="New scene"
                    className={cn(
                        'flex h-6 w-6 items-center justify-center rounded',
                        'text-nf-text-muted hover:bg-nf-surface-bright hover:text-nf-accent',
                        'transition-colors duration-150',
                        createScene.isPending && 'cursor-wait opacity-50',
                    )}
                >
                    {createScene.isPending
                        ? <Loader2 size={13} className="animate-spin" />
                        : <Plus size={13} />
                    }
                </button>
            </div>

            {/* Scene items */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 size={16} className="animate-spin text-nf-text-disabled" />
                    </div>
                )}

                {!isLoading && scenes.length === 0 && (
                    <div className="px-2 py-6 text-center">
                        <p className="font-label text-[10px] italic text-nf-text-disabled">
                            No scenes yet.
                        </p>
                        <p className="font-label text-[10px] text-nf-text-disabled mt-1">
                            Press + to create one.
                        </p>
                    </div>
                )}

                {scenes.map((scene) => (
                    <SceneItem
                        key={scene.id}
                        scene={scene}
                        isActive={scene.id === activeSceneId}
                        onSelect={onSelectScene}
                        onDelete={(id) => { deleteScene.mutate(id) }}
                        isDeleting={deleteScene.isPending}
                    />
                ))}
            </div>

            {/* Footer — total word count */}
            {scenes.length > 0 && (
                <div className="border-t border-nf-border-subtle px-3 py-2">
                    <span className="font-label text-[10px] text-nf-text-disabled">
                        Total:{' '}
                        {scenes
                            .reduce((acc, s) => acc + s.word_count, 0)
                            .toLocaleString()}{' '}
                        words
                    </span>
                </div>
            )}
        </aside>
    )
}