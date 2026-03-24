import type { ReactElement } from 'react'
import { useState, useMemo } from 'react'
import { Plus, BookMarked, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/library/ProjectCard'
import { CreateProjectModal } from '@/components/library/CreateProjectModal'
import {
  useProjects,
  useArchiveProject,
  useDeleteProject,
} from '@/hooks/useProject'
import { cn } from '@/lib/utils'
import type { ProjectStatus } from '@/types/database'

/* ── Filter tabs ────────────────────────────────────────────────── */

type FilterTab = 'all' | ProjectStatus

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'archived', label: 'Archived' },
]

/* ── Loading skeleton ───────────────────────────────────────────── */

function ProjectCardSkeleton(): ReactElement {
  return (
    <div
      aria-hidden
      className={cn(
        'flex flex-col gap-4 p-6',
        'bg-nf-surface rounded-lg border-l-4 border-nf-border',
        'animate-pulse',
      )}
    >
      <div className="space-y-2">
        <div className="h-5 w-3/4 rounded bg-nf-surface-high" />
        <div className="h-3 w-1/4 rounded bg-nf-surface-high" />
      </div>
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-full rounded bg-nf-surface-high" />
        <div className="h-3 w-4/5 rounded bg-nf-surface-high" />
      </div>
      <div className="h-px bg-nf-border-subtle" />
      <div className="flex justify-between">
        <div className="h-3 w-24 rounded bg-nf-surface-high" />
        <div className="h-4 w-16 rounded-full bg-nf-surface-high" />
      </div>
    </div>
  )
}

/* ── Empty state ────────────────────────────────────────────────── */

interface EmptyStateProps {
  isFiltered: boolean
  onCreateClick: () => void
}

function EmptyState({
  isFiltered,
  onCreateClick,
}: EmptyStateProps): ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      <BookMarked
        size={52}
        strokeWidth={0.75}
        className="text-nf-accent opacity-20"
      />

      {isFiltered ? (
        <>
          <p className="font-headline italic text-xl text-nf-text-secondary">
            No stories here.
          </p>
          <p className="font-label text-sm text-nf-text-muted max-w-xs">
            Try a different filter above.
          </p>
        </>
      ) : (
        <>
          <div className="space-y-1">
            <p className="font-headline italic text-2xl text-nf-text-secondary">
              Your forge is empty.
            </p>
            <p className="font-label text-sm text-nf-text-muted max-w-xs">
              Every story begins with a single title. Give your first
              manuscript a name.
            </p>
          </div>
          <Button
            onClick={onCreateClick}
            className={cn(
              'gap-2 font-label font-medium',
              'bg-gradient-to-br from-nf-accent to-nf-accent-container',
              'text-nf-accent-on',
            )}
          >
            <Plus size={16} />
            Begin First Story
          </Button>
        </>
      )}
    </div>
  )
}

/* ── LibraryPage ────────────────────────────────────────────────── */

export function LibraryPage(): ReactElement {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')

  const { data: projects, isLoading, isError, error } = useProjects()
  const archiveProject = useArchiveProject()
  const deleteProject = useDeleteProject()

  const filteredProjects = useMemo(() => {
    if (!projects) return []
    if (activeFilter === 'all') return projects
    return projects.filter((p) => p.status === activeFilter)
  }, [projects, activeFilter])

  const isFiltered = activeFilter !== 'all'

  /* Count per status tab (uses full list, not filteredProjects) */
  function countByStatus(status: ProjectStatus): number {
    return projects?.filter((p) => p.status === status).length ?? 0
  }

  return (
    <div className="flex h-full flex-col">
      {/* ── Page header ──────────────────────────────────────── */}
      <header className="flex items-end justify-between px-12 pb-8 pt-12">
        <div>
          <h1 className="font-headline italic text-5xl text-nf-text-primary">
            Library
          </h1>
          <p className="mt-1 font-headline italic text-lg text-nf-text-muted">
            Your manuscripts and worlds.
          </p>
        </div>

        <Button
          onClick={() => { setIsCreateOpen(true) }}
          className={cn(
            'gap-2 font-label font-medium',
            'bg-gradient-to-br from-nf-accent to-nf-accent-container',
            'text-nf-accent-on',
          )}
        >
          <Plus size={16} />
          New Story
        </Button>
      </header>

      {/* ── Filter tabs ──────────────────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-nf-border-subtle px-12 pb-4">
        {FILTER_TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => { setActiveFilter(id) }}
            className={cn(
              'rounded-full px-3 py-1.5',
              'font-label text-xs uppercase tracking-widest',
              'transition-all duration-200',
              activeFilter === id
                ? 'bg-nf-surface-highest text-nf-accent'
                : 'text-nf-text-muted hover:bg-nf-surface hover:text-nf-text-secondary',
            )}
          >
            {label}
            {id !== 'all' && projects !== undefined && (
              <span className="ml-1.5 opacity-50">
                ({countByStatus(id)})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto px-12 py-8">
        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </div>
        )}

        {/* Query error */}
        {isError && (
          <div
            role="alert"
            className={cn(
              'flex max-w-md items-center gap-3',
              'rounded-lg bg-nf-error/10 p-4 text-nf-error',
            )}
          >
            <AlertCircle size={16} className="shrink-0" />
            <p className="font-label text-sm">
              {error instanceof Error
                ? error.message
                : 'Failed to load projects.'}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && filteredProjects.length === 0 && (
          <EmptyState
            isFiltered={isFiltered}
            onCreateClick={() => { setIsCreateOpen(true) }}
          />
        )}

        {/* Project grid */}
        {!isLoading && !isError && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onArchive={() => { archiveProject.mutate(project.id) }}
                onDelete={() => { deleteProject.mutate(project.id) }}
                isArchiving={archiveProject.isPending}
                isDeleting={deleteProject.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Create project modal ──────────────────────────────── */}
      <CreateProjectModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  )
}