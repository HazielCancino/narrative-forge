import type { ReactElement, ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useCreateProject, type CreateProjectInput } from '@/hooks/useProject'
import { cn } from '@/lib/utils'

/* ── Genre autocomplete suggestions ────────────────────────────── */

const GENRE_SUGGESTIONS = [
    'Fantasy',
    'Dark Fantasy',
    'Epic Fantasy',
    'Science Fiction',
    'Cyberpunk',
    'Space Opera',
    'Horror',
    'Gothic Horror',
    'Psychological Horror',
    'Mystery',
    'Thriller',
    'Historical Fiction',
    'Literary Fiction',
    'Magical Realism',
    'Dystopia',
    'Romance',
    'Adventure',
    'Mythology',
] as const

/* ── Initial form state ─────────────────────────────────────────── */

const EMPTY_FORM: CreateProjectInput = {
    title: '',
    genre: '',
    description: '',
}

/* ── Props ──────────────────────────────────────────────────────── */

interface CreateProjectModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

/* ── Component ──────────────────────────────────────────────────── */

export function CreateProjectModal({
    open,
    onOpenChange,
}: CreateProjectModalProps): ReactElement {
    const [form, setForm] = useState<CreateProjectInput>(EMPTY_FORM)
    const createProject = useCreateProject()

    /* ── Handlers ─────────────────────────────────────────────── */

    function handleFieldChange(
        field: keyof CreateProjectInput,
    ): (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void {
        return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }

    function handleSubmit(e: FormEvent): void {
        e.preventDefault()
        if (!form.title.trim()) return

        createProject.mutate(
            {
                title: form.title.trim(),
                genre: form.genre?.trim() || undefined,
                description: form.description?.trim() || undefined,
            },
            {
                onSuccess: () => {
                    setForm(EMPTY_FORM)
                    onOpenChange(false)
                },
            },
        )
    }

    function handleClose(): void {
        if (createProject.isPending) return
        setForm(EMPTY_FORM)
        onOpenChange(false)
    }

    /* ── Shared field class ────────────────────────────────────── */

    const fieldClass = cn(
        'bg-nf-surface-high border-nf-border',
        'text-nf-text-primary placeholder:text-nf-text-disabled',
        'focus-visible:ring-1 focus-visible:ring-nf-accent',
        'focus-visible:border-nf-accent',
    )

    /* ── Render ────────────────────────────────────────────────── */

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                className={cn(
                    'bg-nf-surface border-nf-border',
                    'text-nf-text-primary',
                    'max-w-lg',
                    /* Glass effect from design system */
                    'shadow-[0_20px_40px_rgba(6,14,32,0.5)]',
                )}
            >
                <DialogHeader>
                    <DialogTitle className="font-headline italic text-2xl">
                        Begin a New Story
                    </DialogTitle>
                    <p className="font-label text-sm text-nf-text-muted mt-1">
                        Give your manuscript a name. Everything else can come later.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-2 space-y-5">
                    {/* Title */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="project-title"
                            className="font-label text-[10px] uppercase tracking-widest text-nf-text-muted"
                        >
                            Title{' '}
                            <span className="text-nf-error" aria-hidden>*</span>
                        </Label>
                        <Input
                            id="project-title"
                            value={form.title}
                            onChange={handleFieldChange('title')}
                            placeholder="The Hollow Crown…"
                            autoFocus
                            required
                            disabled={createProject.isPending}
                            className={cn(fieldClass, 'font-headline italic text-lg')}
                        />
                    </div>

                    {/* Genre */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="project-genre"
                            className="font-label text-[10px] uppercase tracking-widest text-nf-text-muted"
                        >
                            Genre{' '}
                            <span className="text-nf-text-disabled">(optional)</span>
                        </Label>
                        <Input
                            id="project-genre"
                            list="genre-suggestions"
                            value={form.genre}
                            onChange={handleFieldChange('genre')}
                            placeholder="Dark Fantasy, Sci-Fi, Horror…"
                            disabled={createProject.isPending}
                            className={fieldClass}
                        />
                        <datalist id="genre-suggestions">
                            {GENRE_SUGGESTIONS.map((g) => (
                                <option key={g} value={g} />
                            ))}
                        </datalist>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="project-description"
                            className="font-label text-[10px] uppercase tracking-widest text-nf-text-muted"
                        >
                            Description{' '}
                            <span className="text-nf-text-disabled">(optional)</span>
                        </Label>
                        <Textarea
                            id="project-description"
                            value={form.description}
                            onChange={handleFieldChange('description')}
                            placeholder="What's this story about? A sentence is enough."
                            rows={3}
                            disabled={createProject.isPending}
                            className={cn(fieldClass, 'resize-none')}
                        />
                    </div>

                    {/* Mutation error */}
                    {createProject.isError && (
                        <p className="font-label text-xs text-nf-error" role="alert">
                            {createProject.error instanceof Error
                                ? createProject.error.message
                                : 'Something went wrong. Try again.'}
                        </p>
                    )}

                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            disabled={createProject.isPending}
                            className="text-nf-text-muted hover:text-nf-text-secondary"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={!form.title.trim() || createProject.isPending}
                            className={cn(
                                'font-label font-medium gap-2',
                                'bg-gradient-to-br from-nf-accent to-nf-accent-container',
                                'text-nf-accent-on',
                                'disabled:opacity-50',
                            )}
                        >
                            {createProject.isPending ? 'Creating…' : 'Create Story'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}