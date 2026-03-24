import type { ReactElement } from 'react'
import { NavLink } from 'react-router-dom'
import {
  PenLine,
  Layers,
  LayoutGrid,
  ScrollText,
  Users,
  Map,
  ImageIcon,
  Archive,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ── Types ──────────────────────────────────────────────────────── */

interface GlobalNavItem {
  readonly label: string
  readonly to: string
  readonly end?: boolean
  readonly icon: ReactElement
}

interface ProjectNavItem {
  readonly label: string
  readonly to: string
  readonly icon: ReactElement
}

/* ── Global navigation items ────────────────────────────────────── */

const GLOBAL_NAV: readonly GlobalNavItem[] = [
  {
    label: 'Writing',
    to:    '/writing',
    icon:  <PenLine size={16} strokeWidth={1.5} />,
  },
  {
    label: 'World Builder',
    to:    '/world-builder',
    icon:  <Layers size={16} strokeWidth={1.5} />,
  },
  {
    label: 'Library',
    to:    '/',
    end:   true,
    icon:  <LayoutGrid size={16} strokeWidth={1.5} />,
  },
] as const

/*
 * Project-contextual items — these are disabled when no project is
 * open (Phase 1 default). They become active in Block 6 once
 * projectStore tracks the current project.
 *
 * Kept here intentionally to establish the full layout from the
 * start, avoiding a visual "jump" when projects are added.
 */
const PROJECT_NAV: readonly ProjectNavItem[] = [
  {
    label: 'Chapters',
    to:    '/writing',
    icon:  <ScrollText size={16} strokeWidth={1.5} />,
  },
  {
    label: 'Characters',
    to:    '/world-builder/characters',
    icon:  <Users size={16} strokeWidth={1.5} />,
  },
  {
    label: 'World Lore',
    to:    '/world-builder/lore',
    icon:  <Map size={16} strokeWidth={1.5} />,
  },
  {
    label: 'Media Assets',
    to:    '/world-builder/media',
    icon:  <ImageIcon size={16} strokeWidth={1.5} />,
  },
  {
    label: 'Archives',
    to:    '/world-builder/archives',
    icon:  <Archive size={16} strokeWidth={1.5} />,
  },
] as const

/* ── Sub-components ─────────────────────────────────────────────── */

function SectionLabel({ children }: { children: string }): ReactElement {
  return (
    <p className="font-label text-[10px] uppercase tracking-widest text-nf-text-disabled px-4 pt-4 pb-1 select-none">
      {children}
    </p>
  )
}

function Divider(): ReactElement {
  return <div className="mx-4 my-2 h-px bg-nf-border-subtle" />
}

/* ── Active nav link style (Manuscript Drawer from bocetos) ──────
 *
 * Active: surface-highest bg, accent text, left border, rounded-r-full
 * Hover:  subtle bg shift + slight x translation
 * Both states use font-label text-sm, consistent height py-3
 */
const linkBase =
  'flex items-center gap-3 mx-2 py-2.5 pl-4 pr-3 font-label text-sm rounded-r-full transition-all duration-300 cursor-pointer select-none'

const linkActive =
  'bg-nf-surface-highest text-nf-accent font-medium border-l-4 border-nf-accent'

const linkInactive =
  'text-nf-text-muted border-l-4 border-transparent hover:bg-nf-surface-bright/50 hover:translate-x-1 hover:text-nf-text-secondary'

const linkDisabled =
  'text-nf-text-disabled border-l-4 border-transparent opacity-40 cursor-not-allowed pointer-events-none'

/* ── Sidebar ────────────────────────────────────────────────────── */

export function Sidebar(): ReactElement {
  /*
   * Block 6 will introduce projectStore with currentProjectId.
   * For now, hasActiveProject is always false — project section
   * items render as disabled.
   */
  const hasActiveProject = false

  return (
    <aside
      className={cn(
        'w-64 shrink-0 h-full flex flex-col',
        'bg-nf-surface-low',
        'shadow-[var(--nf-shadow-sidebar)]',
        'overflow-y-auto overflow-x-hidden',
      )}
      aria-label="Sidebar navigation"
    >
      {/* ── Global navigation ─────────────────────────────── */}
      <div className="pt-2">
        <SectionLabel>Navigate</SectionLabel>

        <nav aria-label="Main sections">
          {GLOBAL_NAV.map(({ label, to, end, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(linkBase, isActive ? linkActive : linkInactive)
              }
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <Divider />

      {/* ── Project context ───────────────────────────────── */}
      <div className="flex-1">
        <SectionLabel>
          {hasActiveProject ? 'Current Project' : 'Project'}
        </SectionLabel>

        {!hasActiveProject && (
          <p className="font-label text-[10px] italic text-nf-text-disabled px-4 pb-2">
            No project open
          </p>
        )}

        <nav aria-label="Project sections">
          {PROJECT_NAV.map(({ label, to, icon }) => (
            <div
              key={to}
              className={cn(linkBase, linkDisabled)}
              aria-disabled="true"
              role="link"
            >
              {icon}
              <span>{label}</span>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}
