import { useEffect, useMemo, useState } from "react";
import useAuth from "../services/auth/useAuth";
import { todayLocalISO } from "../services/date";
import Card from "../components/ui/Card";
import HabitChecklist from "../components/HabitChecklist";
import {
  addUserHabit,
  computeStreakFromLogs,
  ensureDefaultHabits,
  listLogsForDate,
  listUserHabits,
  upsertLog,
  type HabitLog,
  type UserHabit,
  listLogs,
} from "../services/customHabits";

export default function HomePage() {
  const { user } = useAuth();
  const today = todayLocalISO();
  const [habits, setHabits] = useState<UserHabit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
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
        const hs = await ensureDefaultHabits(user.id);
        const todayLogs = await listLogsForDate(user.id, today);
        const allLogs = await listLogs(user.id, 1200);
        const s = computeStreakFromLogs(hs, allLogs, today);
        if (cancelled) return;
        setHabits(hs);
        setLogs(todayLogs);
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

  const habitCount = useMemo(() => habits.length, [habits]);

  async function onToggle(habitId: string, completed: boolean) {
    if (!user) return;
    setSaving(true);
    setError(null);
    const prev = logs;
    const optimistic = (() => {
      const idx = logs.findIndex((l) => l.habit_id === habitId);
      if (idx === -1) return [...logs, { id: "optimistic", user_id: user.id, habit_id: habitId, date: today, completed }];
      const next = [...logs];
      next[idx] = { ...next[idx], completed };
      return next;
    })();
    setLogs(optimistic);
    try {
      await upsertLog(user.id, habitId, today, completed);
      const freshToday = await listLogsForDate(user.id, today);
      setLogs(freshToday);
      const all = await listLogs(user.id, 1200);
      setStreak(computeStreakFromLogs(habits, all, today));
    } catch (err: any) {
      setLogs(prev);
      setError(err?.message ?? "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function onAddHabit(name: string) {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      await addUserHabit(user.id, name);
      const hs = await listUserHabits(user.id);
      setHabits(hs);
      const all = await listLogs(user.id, 1200);
      setStreak(computeStreakFromLogs(hs, all, today));
    } catch (err: any) {
      setError(err?.message ?? "Failed to add habit.");
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
            <div className="flex items-center justify-end gap-2">
              <span
                className="grid h-8 w-8 place-items-center rounded-full bg-black text-white shadow-soft"
                aria-hidden="true"
                title="Streak"
              >
                {/* flame icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M13.6 2.6c.3 3-1 4.6-2.4 6.1-1.3 1.4-2.7 2.9-2.6 5.7.1 2.8 2.2 4.8 5 4.8 2.7 0 5-2.1 5-5 0-2.1-1-3.4-2-4.8-.9-1.2-1.9-2.4-2-4.8Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.3 13.1c-.8 1.2-1.3 2.4-1.3 3.8 0 2.9 2.3 5.1 5 5.1 2.7 0 5-2.2 5-5.1 0-1.3-.4-2.4-1.2-3.4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <div className="text-right">
                <div className="h1 text-2xl leading-none">Day {streak}</div>
                <div className="text-[11px] text-black/60 leading-none">current streak</div>
              </div>
            </div>
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
        <HabitChecklist
          habits={habits}
          logs={logs}
          onToggle={onToggle}
          onAddHabit={onAddHabit}
          disabled={saving}
        />
      )}

      <Card className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold">Glow rule</div>
          <div className="text-xs text-black/60">Consistency beats intensity.</div>
        </div>
        <div className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold">
          {habitCount} habits
        </div>
      </Card>
    </div>
  );
}
