import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useSessionStore } from "@/lib/store/sessionStore";

interface ProtectedRouteProps {
    children: ReactElement;
}

export default function ProtectedRoute({
    children,
}: ProtectedRouteProps): ReactElement {
    const { user, isLoading } = useSessionStore();

    if (isLoading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: "var(--bg-primary)" }}
            >
                <p style={{ color: "var(--text-muted)" }}>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}