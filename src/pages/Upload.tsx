import { useEffect, useMemo, useRef, useState } from "react";
import useAuth from "../services/auth/useAuth";
import { formatLongDate, todayLocalISO } from "../services/date";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PhotoGallery from "../components/PhotoGallery";
import {
  createSignedPhotoUrl,
  getPhotoForDate,
  listPhotos,
  uploadDailyPhoto,
  type PhotoRow,
} from "../services/photos";

export default function UploadPage() {
  const { user } = useAuth();
  const today = todayLocalISO();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [todayPhoto, setTodayPhoto] = useState<PhotoRow | null>(null);
  const [todayUrl, setTodayUrl] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!user) return;
      setError(null);
      try {
        const [tp, list] = await Promise.all([getPhotoForDate(user.id, today), listPhotos(user.id)]);
        if (cancelled) return;
        setTodayPhoto(tp);
        setPhotos(list);
        if (tp) {
          const signed = await createSignedPhotoUrl(tp.image_url);
          if (!cancelled) setTodayUrl(signed);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "Failed to load photos.");
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [user, today]);

  const cta = useMemo(() => {
    if (todayPhoto) return "Replace today’s photo";
    return "Upload today’s photo";
  }, [todayPhoto]);

  async function onUpload() {
    if (!user || !file) return;
    setBusy(true);
    setError(null);
    try {
      const row = await uploadDailyPhoto(user.id, today, file);
      setTodayPhoto(row);
      setTodayUrl(await createSignedPhotoUrl(row.image_url));
      setFile(null);
      const list = await listPhotos(user.id);
      setPhotos(list);
    } catch (err: any) {
      setError(err?.message ?? "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="h1 text-2xl">Daily photo</div>
            <div className="mt-1 text-sm text-black/60">{formatLongDate(today)}</div>
          </div>
          <div className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold">
            1 / day
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/50">
            <div className="aspect-square w-full bg-black/5">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
              ) : todayUrl ? (
                <img src={todayUrl} alt="Today" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-xs text-black/60">
                  No photo yet
                </div>
              )}
            </div>
            <div className="px-3 py-2">
              <div className="text-xs font-semibold">{previewUrl ? "Preview" : "Today"}</div>
              <div className="text-[11px] text-black/60">{today}</div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-3">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <Button variant="soft" onClick={() => inputRef.current?.click()} disabled={busy}>
              Choose photo
            </Button>
            <Button onClick={() => void onUpload()} disabled={!file || busy}>
              {busy ? "Uploading…" : cta}
            </Button>
            <div className="text-xs text-black/60">
              Tip: stand in similar lighting each day for the clearest change.
            </div>
          </div>
        </div>
      </Card>

      {error ? (
        <Card className="border border-red-200 bg-red-50/60">
          <div className="text-sm font-semibold text-red-900">Upload issue</div>
          <div className="mt-1 text-xs text-red-800">{error}</div>
        </Card>
      ) : null}

      <PhotoGallery photos={photos} />
    </div>
  );
}
