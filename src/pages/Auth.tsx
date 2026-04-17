import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import useAuth from "../services/auth/useAuth";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

type Mode = "login" | "signup";

export default function AuthPage() {
  const { session } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => {
    return mode === "login" ? "Welcome back" : "Start your glow-up";
  }, [mode]);

  if (session) return <Navigate to="/home" replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <div className="h1 text-4xl leading-tight">AuraUp</div>
          <div className="mt-2 text-sm text-black/60">
            Minimal habits. One photo a day. Real progress.
          </div>
        </div>

        <Card>
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <div className="text-lg font-semibold">{title}</div>
              <div className="text-xs text-black/60">
                {mode === "login" ? "Log in to continue." : "Create your account."}
              </div>
            </div>
            <button
              className="text-xs font-semibold underline decoration-black/20 underline-offset-4 hover:decoration-black/40"
              onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
              type="button"
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <div>
              <div className="mb-1 text-xs font-semibold text-black/70">Email</div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold text-black/70">Password</div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={6}
                required
              />
            </div>

            {error ? <div className="text-sm text-red-700">{error}</div> : null}

            <Button className="w-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
            </Button>
            <div className="text-xs text-black/60">
              Tip: use a real email if you want password resets later.
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

