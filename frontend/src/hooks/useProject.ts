import {
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/types/database'

/* ── Input types ────────────────────────────────────────────────── */

export interface CreateProjectInput {
    title: string
    genre?: string
    description?: string
}

/* ── Query key factory ──────────────────────────────────────────── */

/*
 * Centralising query keys prevents typos and makes invalidation
 * predictable. All hooks that touch the projects table use these.
 */
export const projectKeys = {
    all: ['projects'] as const,
    lists: () => [...projectKeys.all, 'list'] as const,
} as const

/* ── useProjects ────────────────────────────────────────────────── */

export function useProjects() {
    return useQuery({
        queryKey: projectKeys.lists(),
        queryFn: async (): Promise<Project[]> => {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('updated_at', { ascending: false })

            if (error) throw new Error(error.message)

            /*
             * Supabase returns `any` without type generation; cast explicitly.
             * This is safe because the shape is enforced by RLS + schema.
             */
            return (data ?? []) as Project[]
        },
    })
}

/* ── useCreateProject ───────────────────────────────────────────── */

export function useCreateProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: CreateProjectInput): Promise<Project> => {
            /*
             * RLS policy: WITH CHECK (auth.uid() = user_id)
             * The policy validates that the inserted row's user_id matches
             * the authenticated user. Without this field the column arrives
             * as null, the check fails, and Supabase returns a 403.
             */
            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser()

            if (authError ?? !user) {
                throw new Error('Not authenticated.')
            }

            const { data, error } = await supabase
                .from('projects')
                .insert({
                    user_id: user.id,
                    title: input.title,
                    genre: input.genre ?? null,
                    description: input.description ?? null,
                })
                .select()
                .single()

            if (error) throw new Error(error.message)
            return data as Project
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
        },
    })
}

/* ── useArchiveProject ──────────────────────────────────────────── */

export function useArchiveProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string): Promise<void> => {
            const { error } = await supabase
                .from('projects')
                .update({ status: 'archived' })
                .eq('id', id)

            if (error) throw new Error(error.message)
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
        },
    })
}

/* ── useDeleteProject ───────────────────────────────────────────── */

export function useDeleteProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string): Promise<void> => {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', id)

            if (error) throw new Error(error.message)
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
        },
    })
}