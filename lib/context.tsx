'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { ForgeStore, DailyScore, Habit, Task, Priority } from '@/lib/types';
import { calculateStreak } from '@/lib/dates';
import { StreakData } from '@/lib/types';
import {
  fetchUserData,
  dbUpdateProfile, dbAddHabit, dbUpdateHabit, dbDeleteHabit, dbToggleHabitCompletion,
  dbAddTask, dbCompleteTask, dbUncompleteTask, dbDeleteTask, dbRescheduleTask, dbUpdateTask,
  dbSetPriorityTitle, dbTogglePriority, dbResetAllData,
} from '@/lib/db';

// =============================================
// CONTEXT TYPE
// =============================================

interface ForgeContextType {
  store: ForgeStore;
  streak: StreakData;
  todayScore: DailyScore;
  user: User | null;
  isLoading: boolean;
  // Auth
  signOut: () => Promise<void>;
  // Habits
  handleToggleHabit: (habitId: string) => void;
  handleAddHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  handleDeleteHabit: (habitId: string) => void;
  handleUpdateHabit: (habitId: string, update: Partial<Habit>) => void;
  // Tasks
  handleAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  handleCompleteTask: (taskId: string) => void;
  handleUncompleteTask: (taskId: string) => void;
  handleDeleteTask: (taskId: string) => void;
  handleRescheduleTask: (taskId: string, date: string) => void;
  handleUpdateTask: (taskId: string, update: Partial<Task>) => void;
  // Priorities
  handleSetPriorityTitle: (date: string, order: number, title: string) => void;
  handleTogglePriority: (date: string, order: number) => void;
  // Profile
  handleUpdateProfile: (update: Partial<ForgeStore['profile']>) => void;
  // Danger zone
  handleResetAllData: () => Promise<void>;
}

// =============================================
// EMPTY STORE
// =============================================

function emptyStore(): ForgeStore {
  return {
    profile: { name: '', goal: '', createdAt: new Date().toISOString(), isPro: false },
    habits: [], completions: [], tasks: [], priorities: [], dailyScores: [], earnedBadges: [],
  };
}

const ForgeContext = createContext<ForgeContextType | null>(null);

// =============================================
// PROVIDER
// =============================================

export function ForgeProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<ForgeStore>(emptyStore());
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async (uid: string) => {
    const data = await fetchUserData(uid);
    setStore(data);
  }, []);

  // Bootstrap auth + initial data load
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        await refresh(u.id);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        await refresh(u.id);
      } else {
        setStore(emptyStore());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fire-and-forget wrapper: calls DB fn, then re-fetches store
  const run = (fn: () => Promise<void>) => {
    if (!user) return;
    fn().then(() => refresh(user.id));
  };

  const streak = calculateStreak(store.dailyScores);
  const todayScore = store.dailyScores.find(d => d.date === new Date().toISOString().slice(0, 10))
    ?? { date: new Date().toISOString().slice(0, 10), score: 0, level: 'empty' as const, prioritiesCompleted: 0, habitsCompleted: 0, tasksCompleted: 0 };

  const userId = user?.id ?? '';

  return (
    <ForgeContext.Provider value={{
      store, streak, todayScore, user, isLoading,

      signOut: async () => { await supabase.auth.signOut(); },

      handleToggleHabit:     (id)       => run(() => dbToggleHabitCompletion(userId, id)),
      handleAddHabit:        (h)        => run(() => dbAddHabit(userId, h)),
      handleDeleteHabit:     (id)       => run(() => dbDeleteHabit(userId, id)),
      handleUpdateHabit:     (id, u)    => run(() => dbUpdateHabit(userId, id, u)),

      handleAddTask:         (t)        => run(() => dbAddTask(userId, t)),
      handleCompleteTask:    (id)       => run(() => dbCompleteTask(userId, id)),
      handleUncompleteTask:  (id)       => run(() => dbUncompleteTask(userId, id)),
      handleDeleteTask:      (id)       => run(() => dbDeleteTask(userId, id)),
      handleRescheduleTask:  (id, d)    => run(() => dbRescheduleTask(userId, id, d)),
      handleUpdateTask:      (id, u)    => run(() => dbUpdateTask(userId, id, u)),

      handleSetPriorityTitle: (d, o, t) => run(() => dbSetPriorityTitle(userId, d, o, t)),
      handleTogglePriority:  (d, o)    => run(() => dbTogglePriority(userId, d, o)),

      handleUpdateProfile:   (u)        => run(() => dbUpdateProfile(userId, u)),

      handleResetAllData: async () => {
        if (!user) return;
        await dbResetAllData(user.id);
        await refresh(user.id);
      },
    }}>
      {children}
    </ForgeContext.Provider>
  );
}

export function useForge() {
  const ctx = useContext(ForgeContext);
  if (!ctx) throw new Error('useForge must be inside ForgeProvider');
  return ctx;
}
