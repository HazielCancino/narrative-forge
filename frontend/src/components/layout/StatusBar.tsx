import type { ReactElement } from 'react'
import { Bot, Zap, Palette, Cloud, CloudOff, Loader2 } from 'lucide-react'
import { useUIStore } from '@/lib/store/uiStore'
import { cn } from '@/lib/utils'

/* ── Helpers ────────────────────────────────────────────────────── */

function formatTokens(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return String(count)
}

function formatSyncLabel(
  status: string,
  lastSavedAt: Date | null,
): string {
  if (status === 'syncing') return 'Saving…'
  if (status === 'error') return 'Sync error'
  if (status === 'offline') return 'Offline'
  if (lastSavedAt) {
    const diff = Math.round((Date.now() - lastSavedAt.getTime()) / 1000)
    if (diff < 10) return 'Saved just now'
    if (diff < 60) return `Saved ${diff}s ago`
    return `Saved ${Math.round(diff / 60)}m ago`
  }
  return 'Synced'
}

/* ── Sub-component: a single status pill ────────────────────────── */

interface StatusItemProps {
  icon: ReactElement
  label: string
  accent?: boolean
  muted?: boolean
}

function StatusItem({
  icon,
  label,
  accent = false,
  muted = false,
}: StatusItemProps): ReactElement {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 font-label text-[10px] uppercase tracking-wider',
        accent && 'text-nf-secondary',
        muted && 'text-nf-text-disabled',
        !accent && !muted && 'text-nf-text-muted',
      )}
    >
      {icon}
      <span>{label}</span>
    </div>
  )
}

/* ── Separator ──────────────────────────────────────────────────── */

function Sep(): ReactElement {
  return <div className="h-3 w-px bg-nf-border-subtle" />
}

/* ── StatusBar ──────────────────────────────────────────────────── */

export function StatusBar(): ReactElement {
  const {
    llmConnected,
    llmProvider,
    llmModel,
    tokenCount,
    theme,
    syncStatus,
    lastSavedAt,
  } = useUIStore()

  return (
    <footer
      className={cn(
        'h-8 shrink-0 z-50',
        'flex items-center px-4 gap-4',
        'bg-nf-surface-lowest border-t border-nf-border-subtle',
        'backdrop-blur-md',
      )}
      role="status"
      aria-label="Application status"
    >
      {/* LLM connection */}
      <StatusItem
        icon={
          <Bot
            size={12}
            className={
              llmConnected ? 'text-nf-secondary' : 'text-nf-text-disabled'
            }
          />
        }
        label={`LLM: ${llmConnected ? 'Connected' : 'Disconnected'}`}
        accent={llmConnected}
        muted={!llmConnected}
      />

      <Sep />

      {/* Provider + model */}
      <StatusItem
        icon={<Zap size={12} />}
        label={`${llmProvider} · ${llmModel}`}
      />

      <Sep />

      {/* Token counter */}
      <StatusItem
        icon={<Zap size={12} />}
        label={`${formatTokens(tokenCount)} tokens`}
      />

      <Sep />

      {/* Theme */}
      <StatusItem
        icon={<Palette size={12} />}
        label={`Theme: ${theme}`}
      />

      {/* Sync — pushed to the right */}
      <div className="ml-auto flex items-center gap-1.5 font-label text-[10px] uppercase tracking-wider text-nf-text-disabled">
        {syncStatus === 'syncing' ? (
          <Loader2 size={12} className="animate-spin" />
        ) : syncStatus === 'error' || syncStatus === 'offline' ? (
          <CloudOff size={12} className="text-nf-error" />
        ) : (
          <Cloud size={12} />
        )}
        <span>{formatSyncLabel(syncStatus, lastSavedAt)}</span>
      </div>
    </footer>
  )
}
