import { useEffect, useMemo, useState } from "react";
import useAuth from "../services/auth/useAuth";
import { todayLocalISO } from "../services/date";
import Card from "../components/ui/Card";
import HabitChecklist from "../components/HabitChecklist";
import {
  computeStreak,
  getOrCreateHabitsForDate,
  listHabits,
  updateHabits,
  type HabitRow,
} from "../services/habits";

export default function HomePage() {
  const { user } = useAuth();
  const today = todayLocalISO();
  const [todayHabits, setTodayHabits] = useState<HabitRow | null>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const row = await getOrCreateHabitsForDate(user.id, today);
        const all = await listHabits(user.id, 400);
        const s = computeStreak(all, today);
        if (cancelled) return;
        setTodayHabits(row);
        setStreak(s);
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "Failed to load habits.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [user, today]);

  const checklistValue = useMemo(() => {
    return {
      workout: todayHabits?.workout ?? false,
      water: todayHabits?.water ?? false,
      skincare: todayHabits?.skincare ?? false,
    };
  }, [todayHabits]);

  async function onChecklistChange(next: typeof checklistValue) {
    if (!todayHabits) return;
    setSaving(true);
    const prev = todayHabits;
    setTodayHabits({ ...todayHabits, ...next });
    try {
      const updated = await updateHabits(todayHabits.id, next);
      setTodayHabits(updated);
      // Refresh streak quickly from last 400 days.
      if (user) {
        const all = await listHabits(user.id, 400);
        setStreak(computeStreak(all, today));
      }
    } catch (err: any) {
      setTodayHabits(prev);
      setError(err?.message ?? "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="h1 text-2xl">Today</div>
            <div className="mt-1 text-sm text-black/60">Small wins compound.</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-black/60">Streak</div>
            <div className="h1 text-2xl">{streak}d</div>
          </div>
        </div>
      </Card>

      {error ? (
        <Card className="border border-red-200 bg-red-50/60">
          <div className="text-sm font-semibold text-red-900">Something went wrong</div>
          <div className="mt-1 text-xs text-red-800">{error}</div>
        </Card>
      ) : null}

      {loading ? (
        <Card>
          <div className="text-sm text-black/60">Loading your habits…</div>
        </Card>
      ) : (
        <HabitChecklist value={checklistValue} onChange={onChecklistChange} disabled={saving} />
      )}

      <Card className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold">Glow rule</div>
          <div className="text-xs text-black/60">Consistency beats intensity.</div>
        </div>
        <div className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold">
          3 habits
        </div>
      </Card>
    </div>
  );
}

