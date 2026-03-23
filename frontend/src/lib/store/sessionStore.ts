import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";

interface SessionState {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    isLoading: boolean;
    setSession: (session: Session | null) => void;
    setProfile: (profile: Profile | null) => void;
    setLoading: (loading: boolean) => void;
    clear: () => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    setSession: (session) =>
        set({ session, user: session?.user ?? null }),
    setProfile: (profile) => set({ profile }),
    setLoading: (isLoading) => set({ isLoading }),
    clear: () =>
        set({ user: null, session: null, profile: null, isLoading: false }),
}));