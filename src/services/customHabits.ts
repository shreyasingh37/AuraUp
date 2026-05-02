import { getSupabase } from "./supabaseClient";

export type UserHabit = {
  id: string;
  user_id: string;
  name: string;
  active: boolean;
  sort_order: number;
};

export type HabitLog = {
  id: string;
  user_id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
};

export async function listUserHabits(userId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("user_habits")
    .select("id,user_id,name,active,sort_order")
    .eq("user_id", userId)
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as UserHabit[];
}

export async function ensureDefaultHabits(userId: string) {
  const current = await listUserHabits(userId);
  if (current.length > 0) return current;

  const supabase = getSupabase();
  const defaults = [
    { user_id: userId, name: "Workout", sort_order: 10 },
    { user_id: userId, name: "Water", sort_order: 20 },
    { user_id: userId, name: "Skincare", sort_order: 30 },
  ];
  const { data, error } = await supabase
    .from("user_habits")
    .insert(defaults)
    .select("id,user_id,name,active,sort_order");
  if (error) throw error;
  return (data ?? []) as UserHabit[];
}

export async function addUserHabit(userId: string, name: string) {
  const supabase = getSupabase();
  const trimmed = name.trim();
  const { data, error } = await supabase
    .from("user_habits")
    .insert({ user_id: userId, name: trimmed, sort_order: 100 })
    .select("id,user_id,name,active,sort_order")
    .single();
  if (error) throw error;
  return data as UserHabit;
}

export async function listLogsForDate(userId: string, date: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("habit_logs")
    .select("id,user_id,habit_id,date,completed")
    .eq("user_id", userId)
    .eq("date", date);
  if (error) throw error;
  return (data ?? []) as HabitLog[];
}

export async function upsertLog(userId: string, habitId: string, date: string, completed: boolean) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("habit_logs")
    .upsert(
      { user_id: userId, habit_id: habitId, date, completed },
      { onConflict: "habit_id,date" },
    )
    .select("id,user_id,habit_id,date,completed")
    .single();
  if (error) throw error;
  return data as HabitLog;
}

export async function listLogs(userId: string, limit = 1200) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("habit_logs")
    .select("id,user_id,habit_id,date,completed")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as HabitLog[];
}

export function computeDailyCompletionPercent(habits: UserHabit[], logs: HabitLog[], date: string) {
  const active = habits.filter((h) => h.active);
  if (active.length === 0) return 0;
  const done = new Set(logs.filter((l) => l.date === date && l.completed).map((l) => l.habit_id));
  const completedCount = active.reduce((acc, h) => acc + (done.has(h.id) ? 1 : 0), 0);
  return Math.round((completedCount / active.length) * 100);
}

export function computeOverallCompletionPercent(habits: UserHabit[], logs: HabitLog[]) {
  const active = habits.filter((h) => h.active);
  if (active.length === 0) return 0;
  const activeIds = new Set(active.map((h) => h.id));
  const relevant = logs.filter((l) => activeIds.has(l.habit_id));
  if (relevant.length === 0) return 0;
  const completed = relevant.reduce((acc, l) => acc + (l.completed ? 1 : 0), 0);
  return Math.round((completed / relevant.length) * 100);
}

export function computeStreakFromLogs(habits: UserHabit[], logs: HabitLog[], todayISO: string) {
  const active = habits.filter((h) => h.active);
  if (active.length === 0) return 0;
  const activeIds = new Set(active.map((h) => h.id));

  const byDate = new Map<string, Set<string>>();
  for (const l of logs) {
    if (!l.completed) continue;
    if (!activeIds.has(l.habit_id)) continue;
    const set = byDate.get(l.date) ?? new Set<string>();
    set.add(l.habit_id);
    byDate.set(l.date, set);
  }

  // Streak shows completed days up to yesterday if today isn't complete yet.
  let cursor = todayISO;
  if (!isDateComplete(byDate.get(cursor), activeIds)) {
    cursor = shiftISODate(cursor, -1);
  }

  let streak = 0;
  while (true) {
    if (!isDateComplete(byDate.get(cursor), activeIds)) break;
    streak += 1;
    cursor = shiftISODate(cursor, -1);
  }
  return streak;
}

function isDateComplete(done: Set<string> | undefined, activeIds: Set<string>) {
  if (!done) return false;
  for (const id of activeIds) if (!done.has(id)) return false;
  return true;
}

function shiftISODate(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  dt.setDate(dt.getDate() + days);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

