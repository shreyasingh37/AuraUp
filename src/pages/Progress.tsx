import { useEffect, useMemo, useState } from "react";
import useAuth from "../services/auth/useAuth";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import EmptyState from "../components/EmptyState";
import ShareModal from "../components/ShareModal";
import { computeCompletionPercent, listHabits } from "../services/habits";
import { createSignedPhotoUrl, listPhotos, type PhotoRow } from "../services/photos";

function pickBeforeLatest(photos: PhotoRow[]) {
  if (photos.length === 0) return { before: null, latest: null };
  const latest = photos[0];
  const before = photos[photos.length - 1];
  return { before, latest };
}

export default function ProgressPage() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [latestUrl, setLatestUrl] = useState<string | null>(null);
  const [daysActive, setDaysActive] = useState(0);
  const [habitPercent, setHabitPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!user) return;
      setError(null);
      try {
        const [p, h] = await Promise.all([listPhotos(user.id, 366), listHabits(user.id, 800)]);
        if (cancelled) return;
        setPhotos(p);
        setHabitPercent(computeCompletionPercent(h));

        const dateSet = new Set<string>();
        for (const row of p) dateSet.add(row.date);
        for (const row of h) dateSet.add(row.date);
        setDaysActive(dateSet.size);

        const { before, latest } = pickBeforeLatest(p);
        if (before) {
          const signed = await createSignedPhotoUrl(before.image_url);
          if (!cancelled) setBeforeUrl(signed);
        }
        if (latest) {
          const signed = await createSignedPhotoUrl(latest.image_url);
          if (!cancelled) setLatestUrl(signed);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "Failed to load progress.");
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const { before, latest } = useMemo(() => pickBeforeLatest(photos), [photos]);
  const beforeLabel = "Day 1";
  const afterLabel = `Day ${Math.max(daysActive, 1)}`;

  if (photos.length === 0) {
    return (
      <EmptyState
        title="No progress yet"
        body="Upload your first daily photo and you’ll see a before/after here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="h1 text-2xl">Progress</div>
            <div className="mt-1 text-sm text-black/60">Before vs latest</div>
          </div>
          <Button variant="soft" onClick={() => setShareOpen(true)} disabled={!beforeUrl || !latestUrl}>
            Share
          </Button>
        </div>

        {error ? <div className="mt-3 text-sm text-red-700">{error}</div> : null}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/60">
            <div className="aspect-square w-full bg-black/5">
              {beforeUrl ? (
                <img src={beforeUrl} alt="Before" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-xs text-black/60">
                  Loading…
                </div>
              )}
            </div>
            <div className="px-3 py-2">
              <div className="text-xs font-semibold">{beforeLabel}</div>
              <div className="text-[11px] text-black/60">{before?.date ?? ""}</div>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/60">
            <div className="aspect-square w-full bg-black/5">
              {latestUrl ? (
                <img src={latestUrl} alt="Latest" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-xs text-black/60">
                  Loading…
                </div>
              )}
            </div>
            <div className="px-3 py-2">
              <div className="text-xs font-semibold">{afterLabel}</div>
              <div className="text-[11px] text-black/60">{latest?.date ?? ""}</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="text-xs text-black/60">Days active</div>
          <div className="h1 mt-1 text-3xl">{daysActive}</div>
        </Card>
        <Card>
          <div className="text-xs text-black/60">Habit completion</div>
          <div className="h1 mt-1 text-3xl">{habitPercent}%</div>
        </Card>
      </div>

      {beforeUrl && latestUrl ? (
        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          beforeUrl={beforeUrl}
          afterUrl={latestUrl}
          beforeLabel={beforeLabel}
          afterLabel={afterLabel}
        />
      ) : null}
    </div>
  );
}
