export default function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="glass w-full max-w-sm rounded-2xl p-6 text-center shadow-soft">
        <div className="h1 text-2xl">AuraUp</div>
        <div className="mt-2 text-sm text-black/60">Warming up…</div>
        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-black/10">
          <div className="h-full w-2/3 animate-shimmer rounded-full bg-gradient-to-r from-black/30 via-black/10 to-black/30" />
        </div>
      </div>
    </div>
  );
}

