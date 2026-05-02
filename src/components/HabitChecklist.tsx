import { useMemo, useState } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Input from "./ui/Input";
import type { HabitLog, UserHabit } from "../services/customHabits";

export default function HabitChecklist({
  habits,
  logs,
  onToggle,
  onAddHabit,
  disabled,
}: {
  habits: UserHabit[];
  logs: HabitLog[];
  onToggle: (habitId: string, completed: boolean) => void;
  onAddHabit: (name: string) => void;
  disabled?: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const completedById = useMemo(() => {
    const set = new Set(logs.filter((l) => l.completed).map((l) => l.habit_id));
    return set;
  }, [logs]);

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddHabit(trimmed);
    setName("");
    setAdding(false);
  }

  return (
    <div className="space-y-3">
      <Card className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Your habits</div>
          <div className="text-xs text-black/60">Add or tick them off for today.</div>
        </div>
        <Button variant="soft" onClick={() => setAdding((v) => !v)} disabled={disabled}>
          {adding ? "Close" : "Add"}
        </Button>
      </Card>

      {adding ? (
        <Card className="flex items-center gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Read 10 pages"
            maxLength={40}
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
          />
          <Button onClick={submit} disabled={disabled || !name.trim()}>
            Add
          </Button>
        </Card>
      ) : null}

      {habits.map((h) => {
        const done = completedById.has(h.id);
        return (
          <Card key={h.id} className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold">{h.name}</div>
              <div className="text-xs text-black/60">{done ? "Completed" : "Not yet"}</div>
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onToggle(h.id, !done)}
              className={[
                "relative h-9 w-14 rounded-full border transition",
                done ? "border-black bg-black" : "border-black/15 bg-white/70",
                disabled ? "opacity-60" : "hover:shadow-soft",
              ].join(" ")}
              aria-pressed={done}
              aria-label={`Toggle ${h.name}`}
            >
              <span
                className={[
                  "absolute top-1/2 h-7 w-7 -translate-y-1/2 rounded-full bg-white shadow transition",
                  done ? "left-6" : "left-1",
                ].join(" ")}
              />
            </button>
          </Card>
        );
      })}
    </div>
  );
}

