import {
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Scene } from '@/types/database'

/* ── Input types ────────────────────────────────────────────────── */

export interface CreateSceneInput {
    project_id: string
    title: string
}

export interface UpdateSceneContentInput {
    id: string
    content: string
    word_count: number
}

export interface UpdateSceneTitleInput {
    id: string
    title: string
}

/* ── Query key factory ──────────────────────────────────────────── */

export const sceneKeys = {
    all: ['scenes'] as const,
    byProject: (id: string) =>
        [...sceneKeys.all, id] as const,
} as const

/* ── useScenes ──────────────────────────────────────────────────── */

export function useScenes(projectId: string | null) {
    return useQuery({
        queryKey: sceneKeys.byProject(projectId ?? ''),
        enabled: projectId !== null,
        queryFn: async (): Promise<Scene[]> => {
            if (!projectId) return []

            const { data, error } = await supabase
                .from('scenes')
                .select('*')
                .eq('project_id', projectId)
                .is('parent_id', null)        // top-level scenes only for now
                .order('order_index', { ascending: true })

            if (error) throw new Error(error.message)
            return (data ?? []) as Scene[]
        },
    })
}

/* ── useCreateScene ─────────────────────────────────────────────── */

export function useCreateScene() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: CreateSceneInput): Promise<Scene> => {
            /*
             * Derive order_index from the current count so the new scene
             * always appends to the end of the list.
             */
            const { count } = await supabase
                .from('scenes')
                .select('*', { count: 'exact', head: true })
                .eq('project_id', input.project_id)

            const { data, error } = await supabase
                .from('scenes')
                .insert({
                    project_id: input.project_id,
                    title: input.title,
                    order_index: count ?? 0,
                })
                .select()
                .single()

            if (error) throw new Error(error.message)
            return data as Scene
        },
        onSuccess: (scene) => {
            void queryClient.invalidateQueries({
                queryKey: sceneKeys.byProject(scene.project_id),
            })
        },
    })
}

/* ── useSaveSceneContent ────────────────────────────────────────── */

/*
 * This mutation is called by the autosave debounce in the editor.
 * It updates only content + word_count + updated_at — never title.
 * Using uiStore.setSyncStatus is the responsibility of the caller
 * (ChapterEditor) so the hook stays pure and testable.
 */
export function useSaveSceneContent() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (
            input: UpdateSceneContentInput,
        ): Promise<void> => {
            const { error } = await supabase
                .from('scenes')
                .update({
                    content: input.content,
                    word_count: input.word_count,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', input.id)

            if (error) throw new Error(error.message)
        },
        onSuccess: (_data, variables) => {
            /*
             * Optimistic update: patch the cached scene so the word count
             * in the scene list refreshes without a full refetch.
             */
            queryClient.setQueriesData<Scene[]>(
                { queryKey: sceneKeys.all },
                (prev) =>
                    prev?.map((s) =>
                        s.id === variables.id
                            ? { ...s, word_count: variables.word_count }
                            : s,
                    ),
            )
        },
    })
}

/* ── useUpdateSceneTitle ────────────────────────────────────────── */

export function useUpdateSceneTitle() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: UpdateSceneTitleInput): Promise<void> => {
            const { error } = await supabase
                .from('scenes')
                .update({ title: input.title, updated_at: new Date().toISOString() })
                .eq('id', input.id)

            if (error) throw new Error(error.message)
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: sceneKeys.all })
        },
    })
}

/* ── useDeleteScene ─────────────────────────────────────────────── */

export function useDeleteScene() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string): Promise<string> => {
            const { data, error } = await supabase
                .from('scenes')
                .delete()
                .eq('id', id)
                .select('project_id')
                .single()

            if (error) throw new Error(error.message)
            return (data as { project_id: string }).project_id
        },
        onSuccess: (projectId) => {
            void queryClient.invalidateQueries({
                queryKey: sceneKeys.byProject(projectId),
            })
        },
    })
}