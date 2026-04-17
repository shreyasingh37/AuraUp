import Card from "./ui/Card";

export type HabitKey = "workout" | "water" | "skincare";

export default function HabitChecklist({
  value,
  onChange,
  disabled,
}: {
  value: Record<HabitKey, boolean>;
  onChange: (next: Record<HabitKey, boolean>) => void;
  disabled?: boolean;
}) {
  const items: { key: HabitKey; title: string; hint: string }[] = [
    { key: "workout", title: "Workout", hint: "Move your body" },
    { key: "water", title: "Water", hint: "Hydrate + glow" },
    { key: "skincare", title: "Skincare", hint: "Gentle + consistent" },
  ];

  return (
    <div className="space-y-3">
      {items.map((it) => (
        <Card key={it.key} className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold">{it.title}</div>
            <div className="text-xs text-black/60">{it.hint}</div>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange({ ...value, [it.key]: !value[it.key] })}
            className={[
              "relative h-9 w-14 rounded-full border transition",
              value[it.key] ? "border-black bg-black" : "border-black/15 bg-white/70",
              disabled ? "opacity-60" : "hover:shadow-soft",
            ].join(" ")}
            aria-pressed={value[it.key]}
            aria-label={`Toggle ${it.title}`}
          >
            <span
              className={[
                "absolute top-1/2 h-7 w-7 -translate-y-1/2 rounded-full bg-white shadow transition",
                value[it.key] ? "left-6" : "left-1",
              ].join(" ")}
            />
          </button>
        </Card>
      ))}
    </div>
  );
}

