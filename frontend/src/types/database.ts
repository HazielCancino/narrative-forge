export interface Profile {
    id: string;
    username: string | null;
    avatar_url: string | null;
    settings: Record<string, unknown>;
    created_at: string;
}

export interface Project {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    genre: string | null;
    cover_image_path: string | null;
    word_count: number;
    status: "active" | "archived" | "completed";
    llm_config: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface Scene {
    id: string;
    project_id: string;
    parent_id: string | null;
    title: string;
    content: string | null;
    order_index: number;
    status: "draft" | "in_progress" | "final" | "archived";
    word_count: number;
    created_at: string;
    updated_at: string;
}

export interface Character {
    id: string;
    project_id: string;
    name: string;
    role: string | null;
    personality: string | null;
    backstory: string | null;
    avatar_path: string | null;
    atmosphere: Record<string, unknown>;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}