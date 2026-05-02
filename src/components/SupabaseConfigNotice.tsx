import Card from "./ui/Card";

export default function SupabaseConfigNotice() {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Card>
          <div className="h1 text-2xl">Connect Supabase</div>
          <div className="mt-2 text-sm text-black/60">
            AuraUp can’t start because Supabase environment variables are missing.
          </div>
          <div className="mt-4 rounded-xl border border-black/10 bg-white/70 p-3 text-xs">
            <div className="font-semibold">Required</div>
            <div className="mt-1 font-mono">VITE_SUPABASE_URL</div>
            <div className="mt-1 font-mono">VITE_SUPABASE_ANON_KEY</div>
          </div>
          <div className="mt-4 text-xs text-black/60">
            Local: create <span className="font-mono">.env.local</span>. Vercel: set Environment Variables
            in Project Settings.
          </div>
        </Card>
      </div>
    </div>
  );
}

