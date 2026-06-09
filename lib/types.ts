// =============================================
// FORGE — TYPE DEFINITIONS
// =============================================

export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom';

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  reminderTime: string; // "HH:MM"
  frequency: HabitFrequency;
  customDays?: number[]; // 0=Sun, 1=Mon, ...
  createdAt: string; // ISO
  color?: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // "YYYY-MM-DD"
  completedAt: string; // ISO
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string; // "YYYY-MM-DD"
  completedAt?: string; // ISO
  recurring?: 'daily' | 'weekly' | 'monthly' | null;
  tags?: string[];
  notes?: string;
  createdAt: string;
}

export interface Priority {
  id: string;
  date: string; // "YYYY-MM-DD"
  title: string;
  completed: boolean;
  completedAt?: string;
  order: number; // 0, 1, 2
}

export type SquareLevel = 'empty' | 'pale' | 'light' | 'medium' | 'strong' | 'deep' | 'max';

export interface DailyScore {
  date: string; // "YYYY-MM-DD"
  score: number;
  level: SquareLevel;
  prioritiesCompleted: number;
  habitsCompleted: number;
  tasksCompleted: number;
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  consistency30d: number; // days above 30pts in last 30 days
  lastActivityDate: string;
  totalDaysTracked: number;
  totalHabitsCompleted: number;
  totalTasksCompleted: number;
}

export interface BadgeDefinition {
  id: string;
  emoji: string;
  name: string;
  description: string;
  check: (data: BadgeCheckData) => boolean;
}

export interface EarnedBadge {
  badgeId: string;
  earnedAt: string;
}

export interface BadgeCheckData {
  streak: StreakData;
  dailyScores: DailyScore[];
  habits: Habit[];
  completions: HabitCompletion[];
}

export interface UserProfile {
  name: string;
  goal: 'fitness' | 'work' | 'study' | 'personal' | '';
  createdAt: string;
  isPro: boolean;
  proExpiresAt?: string;
}

export interface ForgeStore {
  profile: UserProfile;
  habits: Habit[];
  completions: HabitCompletion[];
  tasks: Task[];
  priorities: Priority[];
  dailyScores: DailyScore[];
  earnedBadges: EarnedBadge[];
}
