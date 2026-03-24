import { create } from 'zustand'
import type { Project } from '@/types/database'

/* ── State ──────────────────────────────────────────────────────── */

interface ProjectState {
    currentProject: Project | null
}

/* ── Actions ────────────────────────────────────────────────────── */

interface ProjectActions {
    setCurrentProject: (project: Project) => void
    clearCurrentProject: () => void
}

/* ── Store ──────────────────────────────────────────────────────── */

export const useProjectStore = create<ProjectState & ProjectActions>(
    (set) => ({
        currentProject: null,

        setCurrentProject: (project) => set({ currentProject: project }),

        clearCurrentProject: () => set({ currentProject: null }),
    }),
)