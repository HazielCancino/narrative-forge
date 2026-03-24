import { create } from 'zustand'

/* ── Types ──────────────────────────────────────────────────────── */

export type NavSection =
  | 'library'
  | 'writing'
  | 'world-builder'
  | 'settings'

export type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline'

/* ── State shape ────────────────────────────────────────────────── */

interface UIState {
  /* Navigation */
  activeNav: NavSection

  /* Sidebar */
  isSidebarOpen: boolean

  /* Theming */
  theme: string

  /* LLM status — updated by the chat hook when a connection is
   * established or lost. The status bar reads these values. */
  llmConnected: boolean
  llmProvider: string
  llmModel: string
  tokenCount: number

  /* Sync status — updated by TanStack Query mutation callbacks */
  syncStatus: SyncStatus
  lastSavedAt: Date | null
}

/* ── Actions ────────────────────────────────────────────────────── */

interface UIActions {
  setActiveNav: (nav: NavSection) => void
  toggleSidebar: () => void
  setLLMStatus: (
    connected: boolean,
    provider?: string,
    model?: string,
  ) => void
  setTokenCount: (count: number) => void
  incrementTokenCount: (delta: number) => void
  setSyncStatus: (status: SyncStatus, savedAt?: Date) => void
}

/* ── Store ──────────────────────────────────────────────────────── */

export const useUIStore = create<UIState & UIActions>((set) => ({
  /* ── Initial state ── */
  activeNav: 'library',
  isSidebarOpen: true,
  theme: 'ethereal-dark',
  llmConnected: false,
  llmProvider: 'ollama',
  llmModel: 'llama3',
  tokenCount: 0,
  syncStatus: 'synced',
  lastSavedAt: null,

  /* ── Actions ── */
  setActiveNav: (nav) => set({ activeNav: nav }),

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setLLMStatus: (connected, provider, model) =>
    set({
      llmConnected: connected,
      ...(provider !== undefined && { llmProvider: provider }),
      ...(model !== undefined && { llmModel: model }),
    }),

  setTokenCount: (count) => set({ tokenCount: count }),

  incrementTokenCount: (delta) =>
    set((state) => ({ tokenCount: state.tokenCount + delta })),

  setSyncStatus: (status, savedAt) =>
    set({
      syncStatus: status,
      ...(savedAt !== undefined && { lastSavedAt: savedAt }),
    }),
}))
