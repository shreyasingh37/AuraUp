import { getSupabase } from "./supabaseClient";

export type HabitRow = {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  workout: boolean;
  water: boolean;
  skincare: boolean;
};

export async function getOrCreateHabitsForDate(userId: string, date: string) {
  const supabase = getSupabase();
  const { data: existing, error: selErr } = await supabase
    .from("habits")
    .select("id,user_id,date,workout,water,skincare")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  if (selErr) throw selErr;
  if (existing) return existing as HabitRow;

  const { data: inserted, error: insErr } = await supabase
    .from("habits")
    .insert({ user_id: userId, date })
    .select("id,user_id,date,workout,water,skincare")
    .single();

  // Unique constraint race: if another insert won, re-select.
  if (insErr) {
    const { data: fallback, error: fbErr } = await supabase
      .from("habits")
      .select("id,user_id,date,workout,water,skincare")
      .eq("user_id", userId)
      .eq("date", date)
      .single();
    if (fbErr) throw insErr;
    return fallback as HabitRow;
  }

  return inserted as HabitRow;
}

export async function updateHabits(
  id: string,
  patch: Partial<Pick<HabitRow, "workout" | "water" | "skincare">>,
) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("habits")
    .update(patch)
    .eq("id", id)
    .select("id,user_id,date,workout,water,skincare")
    .single();
  if (error) throw error;
  return data as HabitRow;
}

export async function listHabits(userId: string, limit = 400) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("habits")
    .select("id,user_id,date,workout,water,skincare")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as HabitRow[];
}

export function dayIsComplete(row: HabitRow) {
  return Boolean(row.workout && row.water && row.skincare);
}

export function computeStreak(descHabits: HabitRow[], todayISO: string) {
  // Expects habits ordered by date DESC.
  const byDate = new Map(descHabits.map((h) => [h.date, h]));

  let streak = 0;
  let cursor = todayISO;
  const todayRow = byDate.get(cursor);
  // UX: if today isn't completed yet, show the streak up to yesterday.
  if (!todayRow || !dayIsComplete(todayRow)) cursor = shiftISODate(cursor, -1);
  while (true) {
    const row = byDate.get(cursor);
    if (!row || !dayIsComplete(row)) break;
    streak += 1;
    cursor = shiftISODate(cursor, -1);
  }
  return streak;
}

export function computeCompletionPercent(allHabits: HabitRow[]) {
  if (allHabits.length === 0) return 0;
  const totalSlots = allHabits.length * 3;
  const completed =
    allHabits.reduce((acc, h) => {
      return acc + (h.workout ? 1 : 0) + (h.water ? 1 : 0) + (h.skincare ? 1 : 0);
    }, 0) ?? 0;
  return Math.round((completed / totalSlots) * 100);
}

export function shiftISODate(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  dt.setDate(dt.getDate() + days);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
