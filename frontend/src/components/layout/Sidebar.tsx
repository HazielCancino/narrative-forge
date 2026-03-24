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
import { useProjectStore } from '@/lib/store/projectStore'
import { cn } from '@/lib/utils'

/* ── Global nav items ───────────────────────────────────────────── */

interface GlobalNavItem {
  readonly label: string
  readonly to: string
  readonly end?: boolean
  readonly icon: ReactElement
}

const GLOBAL_NAV: readonly GlobalNavItem[] = [
  {
    label: 'Writing',
    to: '/writing',
    icon: <PenLine size={16} strokeWidth={1.5} />,
  },
  {
    label: 'World Builder',
    to: '/world-builder',
    icon: <Layers size={16} strokeWidth={1.5} />,
  },
  {
    label: 'Library',
    to: '/',
    end: true,
    icon: <LayoutGrid size={16} strokeWidth={1.5} />,
  },
] as const

/* ── Project-contextual nav items ───────────────────────────────── */

interface ProjectNavItem {
  readonly label: string
  readonly to: string
  readonly icon: ReactElement
}

const PROJECT_NAV: readonly ProjectNavItem[] = [
  {
    label: 'Chapters',
    to: '/writing',
    icon: <ScrollText size={16} strokeWidth={1.5} />,
  },
  {
    label: 'Characters',
    to: '/world-builder/characters',
    icon: <Users size={16} strokeWidth={1.5} />,
  },
  {
    label: 'World Lore',
    to: '/world-builder/lore',
    icon: <Map size={16} strokeWidth={1.5} />,
  },
  {
    label: 'Media Assets',
    to: '/world-builder/media',
    icon: <ImageIcon size={16} strokeWidth={1.5} />,
  },
  {
    label: 'Archives',
    to: '/world-builder/archives',
    icon: <Archive size={16} strokeWidth={1.5} />,
  },
] as const

/* ── Shared nav link classes ────────────────────────────────────── */

const linkBase =
  'flex items-center gap-3 mx-2 py-2.5 pl-4 pr-3 font-label text-sm rounded-r-full transition-all duration-300 select-none'

const linkActive =
  'bg-nf-surface-highest text-nf-accent font-medium border-l-4 border-nf-accent'

const linkInactive = [
  'text-nf-text-muted',
  'border-l-4 border-transparent',
  'hover:bg-nf-surface-bright/50 hover:translate-x-1',
  'hover:text-nf-text-secondary',
  'cursor-pointer',
].join(' ')

const linkDisabled = [
  'text-nf-text-disabled',
  'border-l-4 border-transparent',
  'opacity-40 cursor-not-allowed pointer-events-none',
].join(' ')

/* ── Sub-components ─────────────────────────────────────────────── */

function SectionLabel({
  children,
}: {
  children: string
}): ReactElement {
  return (
    <p className="select-none px-4 pb-1 pt-4 font-label text-[10px] uppercase tracking-widest text-nf-text-disabled">
      {children}
    </p>
  )
}

function Divider(): ReactElement {
  return <div className="mx-4 my-2 h-px bg-nf-border-subtle" />
}

/* ── Sidebar ────────────────────────────────────────────────────── */

export function Sidebar(): ReactElement {
  const currentProject = useProjectStore((s) => s.currentProject)
  const hasActiveProject = currentProject !== null

  return (
    <aside
      className={cn(
        'flex h-full w-64 shrink-0 flex-col',
        'bg-nf-surface-low',
        'shadow-[var(--nf-shadow-sidebar)]',
        'overflow-x-hidden overflow-y-auto',
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
        <SectionLabel>Project</SectionLabel>

        {hasActiveProject ? (
          /*
           * Project is open: show its name and enable nav items.
           * In Block 7+ these links will deep-link into the project.
           */
          <>
            <p
              title={currentProject.title}
              className="truncate px-4 pb-2 font-headline italic text-xs text-nf-text-muted"
            >
              {currentProject.title}
            </p>

            <nav aria-label="Project sections">
              {PROJECT_NAV.map(({ label, to, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(linkBase, isActive ? linkActive : linkInactive)
                  }
                >
                  {icon}
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </>
        ) : (
          /*
           * No project open: items are disabled and a hint is shown.
           * User goes to Library → opens a project → items activate.
           */
          <>
            <p className="px-4 pb-2 font-label text-[10px] italic text-nf-text-disabled">
              No project open
            </p>

            <div aria-hidden>
              {PROJECT_NAV.map(({ label, icon }) => (
                <div
                  key={label}
                  className={cn(linkBase, linkDisabled)}
                  role="presentation"
                >
                  {icon}
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  )
}