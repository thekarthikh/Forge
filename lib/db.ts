// =============================================
// FORGE — lib/db.ts
// All Supabase I/O. Called from context only.
// =============================================

import { createClient } from '@/lib/supabase/client';
import { buildDailyScore } from '@/lib/scoring';
import { todayStr } from '@/lib/dates';
import {
  ForgeStore, Habit, HabitCompletion, Task, Priority,
  DailyScore, EarnedBadge, UserProfile, HabitFrequency,
} from '@/lib/types';
import { format, subDays } from 'date-fns';

// =============================================
// ROW → TYPE MAPPERS
// =============================================

function mapProfile(r: any): UserProfile {
  return {
    name: r.name ?? '',
    goal: r.goal ?? '',
    createdAt: r.created_at,
    isPro: r.is_pro ?? false,
    proExpiresAt: r.pro_expires_at ?? undefined,
  };
}

function mapHabit(r: any): Habit {
  return {
    id: r.id,
    name: r.name,
    emoji: r.emoji,
    reminderTime: r.reminder_time,
    frequency: r.frequency as HabitFrequency,
    customDays: r.custom_days ?? undefined,
    color: r.color ?? undefined,
    createdAt: r.created_at,
  };
}

function mapCompletion(r: any): HabitCompletion {
  return {
    id: r.id,
    habitId: r.habit_id,
    date: r.date,
    completedAt: r.completed_at,
  };
}

function mapTask(r: any): Task {
  return {
    id: r.id,
    title: r.title,
    completed: r.completed,
    dueDate: r.due_date ?? undefined,
    completedAt: r.completed_at ?? undefined,
    recurring: r.recurring ?? undefined,
    tags: r.tags ?? undefined,
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
  };
}

function mapPriority(r: any): Priority {
  return {
    id: r.id,
    date: r.date,
    title: r.title,
    completed: r.completed,
    completedAt: r.completed_at ?? undefined,
    order: r.order,
  };
}

function mapScore(r: any): DailyScore {
  return {
    date: r.date,
    score: r.score,
    level: r.level,
    prioritiesCompleted: r.priorities_completed,
    habitsCompleted: r.habits_completed,
    tasksCompleted: r.tasks_completed,
  };
}

function emptyProfile(): UserProfile {
  return { name: '', goal: '', createdAt: new Date().toISOString(), isPro: false };
}

// =============================================
// FETCH ALL USER DATA
// =============================================

export async function fetchUserData(userId: string): Promise<ForgeStore> {
  const supabase = createClient();

  const [
    { data: profileData },
    { data: habitsData },
    { data: completionsData },
    { data: tasksData },
    { data: prioritiesData },
    { data: scoresData },
    { data: badgesData },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', userId).single(),
    supabase.from('habits').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('habit_completions').select('*').eq('user_id', userId),
    supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('priorities').select('*').eq('user_id', userId),
    supabase.from('daily_scores').select('*').eq('user_id', userId).order('date'),
    supabase.from('earned_badges').select('*').eq('user_id', userId),
  ]);

  return {
    profile: profileData ? mapProfile(profileData) : emptyProfile(),
    habits: (habitsData ?? []).map(mapHabit),
    completions: (completionsData ?? []).map(mapCompletion),
    tasks: (tasksData ?? []).map(mapTask),
    priorities: (prioritiesData ?? []).map(mapPriority),
    dailyScores: (scoresData ?? []).map(mapScore),
    earnedBadges: (badgesData ?? []).map((r: any) => ({ badgeId: r.badge_id, earnedAt: r.earned_at }) as EarnedBadge),
  };
}

// =============================================
// DAILY SCORE RECALC
// =============================================

async function recalcDailyScore(userId: string, date: string): Promise<void> {
  const supabase = createClient();

  const [
    { data: completions },
    { data: tasks },
    { data: priorities },
  ] = await Promise.all([
    supabase.from('habit_completions').select('id').eq('user_id', userId).eq('date', date),
    supabase.from('tasks').select('id').eq('user_id', userId).eq('completed', true).like('completed_at', `${date}%`),
    supabase.from('priorities').select('id').eq('user_id', userId).eq('date', date).eq('completed', true),
  ]);

  const newScore = buildDailyScore(
    date,
    priorities?.length ?? 0,
    completions?.length ?? 0,
    tasks?.length ?? 0,
  );

  await supabase.from('daily_scores').upsert({
    user_id: userId,
    date,
    score: newScore.score,
    level: newScore.level,
    priorities_completed: newScore.prioritiesCompleted,
    habits_completed: newScore.habitsCompleted,
    tasks_completed: newScore.tasksCompleted,
  }, { onConflict: 'user_id,date' });
}

// =============================================
// PROFILE
// =============================================

export async function dbUpdateProfile(userId: string, update: Partial<UserProfile>): Promise<void> {
  const supabase = createClient();
  await supabase.from('profiles').upsert({
    user_id: userId,
    name: update.name,
    goal: update.goal,
    is_pro: update.isPro,
    pro_expires_at: update.proExpiresAt,
  }, { onConflict: 'user_id' });
}

// =============================================
// HABITS
// =============================================

export async function dbAddHabit(userId: string, habit: Omit<Habit, 'id' | 'createdAt'>): Promise<void> {
  const supabase = createClient();
  await supabase.from('habits').insert({
    user_id: userId,
    name: habit.name,
    emoji: habit.emoji,
    reminder_time: habit.reminderTime,
    frequency: habit.frequency,
    custom_days: habit.customDays ?? null,
    color: habit.color ?? null,
  });
}

export async function dbUpdateHabit(userId: string, habitId: string, update: Partial<Habit>): Promise<void> {
  const supabase = createClient();
  await supabase.from('habits').update({
    name: update.name,
    emoji: update.emoji,
    reminder_time: update.reminderTime,
    frequency: update.frequency,
    custom_days: update.customDays ?? null,
    color: update.color ?? null,
  }).eq('id', habitId).eq('user_id', userId);
}

export async function dbDeleteHabit(userId: string, habitId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('habits').delete().eq('id', habitId).eq('user_id', userId);
}

export async function dbToggleHabitCompletion(userId: string, habitId: string): Promise<void> {
  const supabase = createClient();
  const today = todayStr();

  const { data: existing } = await supabase
    .from('habit_completions')
    .select('id')
    .eq('habit_id', habitId)
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (existing) {
    await supabase.from('habit_completions').delete().eq('id', existing.id);
  } else {
    await supabase.from('habit_completions').insert({
      user_id: userId,
      habit_id: habitId,
      date: today,
    });
  }

  await recalcDailyScore(userId, today);
}

// =============================================
// TASKS
// =============================================

export async function dbAddTask(userId: string, task: Omit<Task, 'id' | 'createdAt' | 'completed'>): Promise<void> {
  const supabase = createClient();
  await supabase.from('tasks').insert({
    user_id: userId,
    title: task.title,
    due_date: task.dueDate ?? null,
    notes: task.notes ?? null,
    tags: task.tags ?? null,
    recurring: task.recurring ?? null,
  });
}

export async function dbCompleteTask(userId: string, taskId: string): Promise<void> {
  const supabase = createClient();
  const now = new Date().toISOString();
  const today = todayStr();
  await supabase.from('tasks')
    .update({ completed: true, completed_at: now })
    .eq('id', taskId).eq('user_id', userId);
  await recalcDailyScore(userId, today);
}

export async function dbUncompleteTask(userId: string, taskId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('tasks')
    .update({ completed: false, completed_at: null })
    .eq('id', taskId).eq('user_id', userId);
  await recalcDailyScore(userId, todayStr());
}

export async function dbDeleteTask(userId: string, taskId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', userId);
}

export async function dbRescheduleTask(userId: string, taskId: string, newDate: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('tasks').update({ due_date: newDate }).eq('id', taskId).eq('user_id', userId);
}

export async function dbUpdateTask(userId: string, taskId: string, update: Partial<Task>): Promise<void> {
  const supabase = createClient();
  await supabase.from('tasks').update({
    title: update.title,
    due_date: update.dueDate ?? null,
    notes: update.notes ?? null,
    tags: update.tags ?? null,
    recurring: update.recurring ?? null,
  }).eq('id', taskId).eq('user_id', userId);
}

// =============================================
// PRIORITIES
// =============================================

export async function dbSetPriorityTitle(userId: string, date: string, order: number, title: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('priorities').upsert({
    user_id: userId,
    date,
    title,
    completed: false,
    order,
  }, { onConflict: 'user_id,date,order' });
}

export async function dbTogglePriority(userId: string, date: string, order: number): Promise<void> {
  const supabase = createClient();

  const { data: existing } = await supabase
    .from('priorities')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .eq('order', order)
    .single();

  if (!existing || !existing.title) return;

  const newCompleted = !existing.completed;
  await supabase.from('priorities').update({
    completed: newCompleted,
    completed_at: newCompleted ? new Date().toISOString() : null,
  }).eq('id', existing.id);

  await recalcDailyScore(userId, date);
}

// =============================================
// RESET ALL DATA
// =============================================

export async function dbResetAllData(userId: string): Promise<void> {
  const supabase = createClient();
  await Promise.all([
    supabase.from('habit_completions').delete().eq('user_id', userId),
    supabase.from('tasks').delete().eq('user_id', userId),
    supabase.from('priorities').delete().eq('user_id', userId),
    supabase.from('daily_scores').delete().eq('user_id', userId),
    supabase.from('earned_badges').delete().eq('user_id', userId),
  ]);
  await supabase.from('habits').delete().eq('user_id', userId);
  await supabase.from('profiles').update({ name: '', goal: '', is_pro: false }).eq('user_id', userId);
}
