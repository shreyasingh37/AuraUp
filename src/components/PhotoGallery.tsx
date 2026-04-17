import { useEffect, useMemo, useState } from "react";
import Card from "./ui/Card";
import type { PhotoRow } from "../services/photos";
import { createSignedPhotoUrl } from "../services/photos";
import { formatLongDate } from "../services/date";

export default function PhotoGallery({ photos }: { photos: PhotoRow[] }) {
  const [urlById, setUrlById] = useState<Record<string, string>>({});

  const visible = useMemo(() => photos.slice(0, 60), [photos]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const missing = visible.filter((p) => !urlById[p.id]);
      if (missing.length === 0) return;
      const entries = await Promise.all(
        missing.map(async (p) => [p.id, await createSignedPhotoUrl(p.image_url)] as const),
      );
      if (cancelled) return;
      setUrlById((prev) => {
        const next = { ...prev };
        for (const [id, url] of entries) next[id] = url;
        return next;
      });
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [visible, urlById]);

  if (photos.length === 0) {
    return (
      <Card className="text-center">
        <div className="text-sm font-semibold">No photos yet</div>
        <div className="mt-1 text-xs text-black/60">Upload your first photo to start the gallery.</div>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-2 text-xs font-semibold text-black/70">Gallery</div>
      <div className="grid grid-cols-2 gap-3">
        {visible.map((p) => (
          <Card key={p.id} className="overflow-hidden p-0">
            <div className="aspect-square w-full bg-black/5">
              {urlById[p.id] ? (
                <img
                  src={urlById[p.id]}
                  alt={p.date}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-xs text-black/50">
                  Loading…
                </div>
              )}
            </div>
            <div className="px-3 py-2">
              <div className="text-xs font-semibold">{formatLongDate(p.date)}</div>
              <div className="text-[11px] text-black/60">{p.date}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
