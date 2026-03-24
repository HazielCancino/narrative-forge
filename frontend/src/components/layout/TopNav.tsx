import type { ReactElement } from 'react'
import { NavLink } from 'react-router-dom'
import { Feather } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ── Nav items definition ───────────────────────────────────────── */

interface NavItem {
  readonly label: string
  readonly to: string
  readonly end?: boolean
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Writing',       to: '/writing' },
  { label: 'World Builder', to: '/world-builder' },
  { label: 'Library',       to: '/',       end: true },
  { label: 'Settings',      to: '/settings' },
] as const

/* ── TopNav ─────────────────────────────────────────────────────── */

export function TopNav(): ReactElement {
  return (
    <header
      className={cn(
        'h-16 shrink-0 z-50',
        'flex items-center px-8 gap-8',
        /*
         * Semi-transparent base + backdrop-blur creates the glass
         * effect from the design system. The border-b uses the subtle
         * white overlay — matching the "No-Line" principle (tonal
         * separation, not a hard 1px stroke).
         */
        'bg-nf-bg/80 backdrop-blur-xl',
        'border-b border-nf-border-subtle',
        /* inset top shadow from glass panel rule */
        'shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]',
      )}
    >
      {/* ── Logo ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mr-2 select-none">
        <Feather
          size={18}
          className="text-nf-accent"
          strokeWidth={1.5}
        />
        {/*
         * gradient-to-br from accent → accent-container gives the
         * violet-to-purple gradient seen in the bocetos logo.
         * bg-clip-text + text-transparent renders only the gradient.
         */}
        <span className="font-headline italic text-2xl bg-gradient-to-br from-nf-accent to-nf-accent-container bg-clip-text text-transparent leading-none">
          Narrative Forge
        </span>
      </div>

      {/* ── Navigation links ────────────────────────────────── */}
      <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
        {NAV_ITEMS.map(({ label, to, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'font-headline italic text-lg transition-colors duration-300 pb-0.5',
                isActive
                  ? 'text-nf-accent border-b-2 border-nf-accent'
                  : 'text-nf-text-muted hover:text-nf-accent border-b-2 border-transparent',
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
