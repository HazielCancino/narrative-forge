import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/lib/store/sessionStore";
import type { Profile } from "@/types/database";

export function useAuthListener(): void {
    const { setSession, setProfile, setLoading, clear } = useSessionStore();

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                clear();
            }
        });

        return () => subscription.unsubscribe();
    }, [setSession, setProfile, setLoading, clear]);

    async function fetchProfile(userId: string): Promise<void> {
        const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        setProfile(data as Profile | null);
        setLoading(false);
    }
}