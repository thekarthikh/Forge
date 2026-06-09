import { SquareLevel, DailyScore } from './types';

// =============================================
// SCORING ENGINE
// Priority: 20pts each, cap 60
// Habit: 10pts each, no cap
// Task: 5pts each, cap 40
// =============================================

export const POINTS = {
  priority: 20,
  habit: 10,
  task: 5,
  priorityCap: 60,
  taskCap: 40,
} as const;

export const STREAK_THRESHOLD = 30; // min pts to count for streak

export function calculateDailyScore(
  prioritiesCompleted: number,
  habitsCompleted: number,
  tasksCompleted: number
): number {
  const priorityPts = Math.min(prioritiesCompleted * POINTS.priority, POINTS.priorityCap);
  const habitPts = habitsCompleted * POINTS.habit;
  const taskPts = Math.min(tasksCompleted * POINTS.task, POINTS.taskCap);
  return priorityPts + habitPts + taskPts;
}

export function scoreToLevel(score: number): SquareLevel {
  if (score === 0) return 'empty';
  if (score <= 30) return 'pale';
  if (score <= 60) return 'light';
  if (score <= 80) return 'medium';
  if (score <= 100) return 'strong';
  if (score <= 130) return 'deep';
  return 'max';
}

export function levelToClass(level: SquareLevel): string {
  const map: Record<SquareLevel, string> = {
    empty: 'square-empty',
    pale: 'square-pale',
    light: 'square-light',
    medium: 'square-medium',
    strong: 'square-strong',
    deep: 'square-deep',
    max: 'square-max',
  };
  return map[level];
}

export function levelToColor(level: SquareLevel): string {
  const map: Record<SquareLevel, string> = {
    empty: '#141a16',
    pale: '#1a3528',
    light: '#1e5c3a',
    medium: '#2d8a56',
    strong: '#3ab86e',
    deep: '#4ade80',
    max: '#6ee7a0',
  };
  return map[level];
}

export function scoreToPercent(score: number): number {
  return Math.min(Math.round((score / 100) * 100), 100);
}

export function getScoreLabel(score: number): string {
  if (score === 0) return "Your square is empty. Start with one habit.";
  if (score < 30) return `Your square is ${scoreToPercent(score)}% full. Almost there — keep going.`;
  if (score < 60) return `Your square is ${scoreToPercent(score)}% full. Keep going.`;
  if (score < 80) return `Your square is ${scoreToPercent(score)}% full. Strong day.`;
  if (score < 100) return `Your square is ${scoreToPercent(score)}% full. Almost fully forged.`;
  return `Your square is fully forged. Outstanding.`;
}

export function buildDailyScore(
  date: string,
  prioritiesCompleted: number,
  habitsCompleted: number,
  tasksCompleted: number
): DailyScore {
  const score = calculateDailyScore(prioritiesCompleted, habitsCompleted, tasksCompleted);
  return {
    date,
    score,
    level: scoreToLevel(score),
    prioritiesCompleted,
    habitsCompleted,
    tasksCompleted,
  };
}
