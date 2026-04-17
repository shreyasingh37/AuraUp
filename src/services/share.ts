async function loadImageFromUrl(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image (${res.status})`);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    const img = new Image();
    img.decoding = "async";
    img.src = objectUrl;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to decode image"));
    });
    return img;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const r = img.width / img.height;
  const targetR = w / h;
  let sw = img.width;
  let sh = img.height;
  let sx = 0;
  let sy = 0;
  if (r > targetR) {
    // wider: crop sides
    sh = img.height;
    sw = sh * targetR;
    sx = (img.width - sw) / 2;
  } else {
    // taller: crop top/bottom
    sw = img.width;
    sh = sw / targetR;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

export async function renderShareImage(opts: {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel: string;
  afterLabel: string;
  title?: string;
}) {
  const width = 1080;
  const height = 1350;
  const padding = 64;
  const gap = 26;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.fillStyle = "#0e0f12";
  ctx.fillRect(0, 0, width, height);

  // Background aura
  const grd = ctx.createRadialGradient(width * 0.25, height * 0.2, 40, width * 0.6, height * 0.4, width);
  grd.addColorStop(0, "#b7a387");
  grd.addColorStop(0.35, "#3d3b32");
  grd.addColorStop(1, "#0e0f12");
  ctx.globalAlpha = 0.42;
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;

  const cardX = padding;
  const cardY = padding + 72;
  const cardW = width - padding * 2;
  const cardH = height - padding * 2 - 72;

  // Card
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  roundRect(ctx, cardX, cardY, cardW, cardH, 44);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Title
  const title = opts.title ?? "AuraUp";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "700 54px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillText(title, padding, padding + 52);
  ctx.font = "500 30px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.fillText("Day 1 vs Day X", padding, padding + 92);

  const innerPad = 44;
  const innerX = cardX + innerPad;
  const innerY = cardY + innerPad;
  const innerW = cardW - innerPad * 2;
  const imageH = cardH - innerPad * 2 - 84;

  const paneW = (innerW - gap) / 2;
  const paneH = imageH;

  const before = await loadImageFromUrl(opts.beforeUrl);
  const after = await loadImageFromUrl(opts.afterUrl);

  // Image panes
  ctx.save();
  roundRect(ctx, innerX, innerY, paneW, paneH, 34);
  ctx.clip();
  drawCover(ctx, before, innerX, innerY, paneW, paneH);
  ctx.restore();

  ctx.save();
  roundRect(ctx, innerX + paneW + gap, innerY, paneW, paneH, 34);
  ctx.clip();
  drawCover(ctx, after, innerX + paneW + gap, innerY, paneW, paneH);
  ctx.restore();

  // Labels
  const labelY = innerY + paneH + 56;
  drawPill(ctx, innerX, labelY, paneW, 56, opts.beforeLabel);
  drawPill(ctx, innerX + paneW + gap, labelY, paneW, 56, opts.afterLabel);

  return canvas.toDataURL("image/png");
}

function drawPill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, text: string) {
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  roundRect(ctx, x, y, w, h, 999);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "700 28px 'Space Grotesk', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + w / 2, y + h / 2);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

