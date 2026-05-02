import React, { createContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase, supabaseEnv } from "../supabaseClient";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  configError: string | null;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!supabaseEnv.ok) {
      setConfigError("Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    const supabase = getSupabase();

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) throw error;
        setSession(data.session ?? null);
      })
      .catch((err: any) => {
        if (!mounted) return;
        setConfigError(err?.message ?? "Failed to initialize auth.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      session,
      user: session?.user ?? null,
      loading,
      configError,
      signOut: async () => {
        if (!supabaseEnv.ok) return;
        await getSupabase().auth.signOut();
      },
    };
  }, [session, loading, configError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
