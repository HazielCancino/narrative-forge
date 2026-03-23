import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ReactElement } from "react";

export default function Login(): ReactElement {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleLogin(): Promise<void> {
        setError(null);
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            navigate("/");
        }

        setLoading(false);
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{ backgroundColor: "var(--bg-primary)" }}
        >
            <div
                className="w-full max-w-md p-8 rounded-lg border"
                style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border)",
                }}
            >
                <h1
                    className="text-2xl font-bold mb-2"
                    style={{ color: "var(--text-primary)" }}
                >
                    Narrative Forge
                </h1>
                <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
                    Sign in to continue
                </p>

                <div className="flex flex-col gap-4">
                    <div>
                        <label
                            className="block text-sm mb-1"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 rounded border text-sm outline-none"
                            style={{
                                backgroundColor: "var(--bg-secondary)",
                                borderColor: "var(--border)",
                                color: "var(--text-primary)",
                            }}
                        />
                    </div>

                    <div>
                        <label
                            className="block text-sm mb-1"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            className="w-full px-3 py-2 rounded border text-sm outline-none"
                            style={{
                                backgroundColor: "var(--bg-secondary)",
                                borderColor: "var(--border)",
                                color: "var(--text-primary)",
                            }}
                        />
                    </div>

                    {error && (
                        <p className="text-sm" style={{ color: "#f87171" }}>
                            {error}
                        </p>
                    )}

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full py-2 rounded text-sm font-medium transition-opacity"
                        style={{
                            backgroundColor: "var(--accent)",
                            color: "var(--text-primary)",
                            opacity: loading ? 0.6 : 1,
                        }}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>

                    <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
                        No account?{" "}
                        <Link
                            to="/register"
                            style={{ color: "var(--accent-light)" }}
                        >
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}