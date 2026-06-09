// =============================================
// FORGE — lib/store.ts
// Pure utility functions — no localStorage, no Supabase.
// All functions accept data from the React store state.
// =============================================

import { HabitCompletion, Priority, Task } from './types';
import { todayStr } from './dates';
import { format, subDays } from 'date-fns';

// =============================================
// HABIT UTILITIES
// =============================================

export function isHabitCompletedToday(habitId: string, completions: HabitCompletion[]): boolean {
  const today = todayStr();
  return completions.some(c => c.habitId === habitId && c.date === today);
}

export function getHabitStreak(habitId: string, completions: HabitCompletion[]): number {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    const done = completions.some(c => c.habitId === habitId && c.date === date);
    if (done) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export function getHabit30DayCompletions(habitId: string, completions: HabitCompletion[]): boolean[] {
  const today = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const date = format(subDays(today, 29 - i), 'yyyy-MM-dd');
    return completions.some(c => c.habitId === habitId && c.date === date);
  });
}

export function getHabitConsistency30d(habitId: string, completions: HabitCompletion[]): number {
  return getHabit30DayCompletions(habitId, completions).filter(Boolean).length;
}

// =============================================
// PRIORITY UTILITIES
// =============================================

export function getTodayPriorities(priorities: Priority[]): Priority[] {
  const today = todayStr();
  const existing = priorities.filter(p => p.date === today).sort((a, b) => a.order - b.order);
  return [0, 1, 2].map(order =>
    existing.find(p => p.order === order) ?? {
      id: `pri-${today}-${order}`,
      date: today,
      title: '',
      completed: false,
      order,
    }
  );
}
