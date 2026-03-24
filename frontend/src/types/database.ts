/* ─────────────────────────────────────────────────────────────────
 * Database types — mirrors the Supabase schema in NARRATIVE_FORGE.md
 * Updated Block 6: added ProjectStatus union, aligned nullability,
 * added WorldLore and Image types.
 * ───────────────────────────────────────────────────────────────── */

/* ── Shared unions ──────────────────────────────────────────────── */

export type ProjectStatus = 'active' | 'archived' | 'completed'

export type SceneStatus = 'draft' | 'in_progress' | 'final' | 'archived'

export type ImageType =
    | 'portrait'
    | 'scenery'
    | 'item'
    | 'mood_board'
    | 'general'

export type GeneratedBy = 'replicate' | 'comfyui' | 'manual'

/* ── Tables ─────────────────────────────────────────────────────── */

export interface Profile {
    id: string
    username: string | null
    avatar_url: string | null
    settings: Record<string, unknown> | null
    created_at: string
}

export interface Project {
    id: string
    user_id: string
    title: string
    description: string | null
    genre: string | null
    cover_image_path: string | null
    word_count: number
    status: ProjectStatus
    llm_config: Record<string, unknown> | null
    created_at: string
    updated_at: string
}

export interface Scene {
    id: string
    project_id: string
    parent_id: string | null
    title: string
    content: string | null
    order_index: number
    status: SceneStatus
    word_count: number
    created_at: string
    updated_at: string
}

export interface Character {
    id: string
    project_id: string
    name: string
    role: string | null
    personality: string | null
    backstory: string | null
    avatar_path: string | null
    atmosphere: Record<string, unknown> | null
    metadata: Record<string, unknown> | null
    created_at: string
    updated_at: string
}

export interface WorldLore {
    id: string
    project_id: string
    parent_id: string | null
    title: string
    type: 'folder' | 'document'
    content: string | null
    order_index: number
    metadata: Record<string, unknown> | null
    created_at: string
    updated_at: string
}

export interface Image {
    id: string
    project_id: string | null
    storage_path: string
    prompt: string | null
    generated_by: GeneratedBy | null
    image_type: ImageType
    is_primary: boolean
    variant_group: string | null
    tags: string[]
    created_at: string
}