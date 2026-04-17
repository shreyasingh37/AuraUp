import { useEffect, useMemo, useState } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { renderShareImage } from "../services/share";

export default function ShareModal({
  open,
  onClose,
  beforeUrl,
  afterUrl,
  beforeLabel,
  afterLabel,
}: {
  open: boolean;
  onClose: () => void;
  beforeUrl: string;
  afterUrl: string;
  beforeLabel: string;
  afterLabel: string;
}) {
  const [busy, setBusy] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const filename = useMemo(() => `auraup_${beforeLabel.replace(/\s+/g, "_")}_vs_${afterLabel.replace(/\s+/g, "_")}.png`, [beforeLabel, afterLabel]);

  useEffect(() => {
    if (!open) {
      setDataUrl(null);
      setBusy(false);
    }
  }, [open]);

  async function generate() {
    setBusy(true);
    try {
      const url = await renderShareImage({
        beforeUrl,
        afterUrl,
        beforeLabel,
        afterLabel,
      });
      setDataUrl(url);
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/30 px-4 pb-4 pt-10 backdrop-blur">
      <div className="w-full max-w-md animate-fadeUp">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-semibold">Share</div>
              <div className="text-xs text-black/60">{beforeLabel} vs {afterLabel}</div>
            </div>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="mt-4">
            {dataUrl ? (
              <img src={dataUrl} alt="Share preview" className="w-full rounded-2xl border border-black/10" />
            ) : (
              <div className="grid aspect-[4/5] w-full place-items-center rounded-2xl border border-black/10 bg-white/50 text-sm text-black/60">
                {busy ? "Generating…" : "Preview will appear here"}
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <Button className="flex-1" onClick={() => void generate()} disabled={busy}>
              {busy ? "Working…" : dataUrl ? "Regenerate" : "Generate"}
            </Button>
            <Button className="flex-1" variant="soft" onClick={download} disabled={!dataUrl || busy}>
              Download
            </Button>
          </div>
          <div className="mt-2 text-xs text-black/60">
            No external APIs: this is generated locally on your device.
          </div>
        </Card>
      </div>
    </div>
  );
}

