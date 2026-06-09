import { format, subDays, parseISO, isToday, differenceInCalendarDays } from 'date-fns';
import { DailyScore, StreakData } from './types';
import { STREAK_THRESHOLD } from './scoring';

export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDisplayDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMMM d, yyyy');
}

export function getGreeting(name?: string): string {
  const hour = new Date().getHours();
  const firstName = name?.split(' ')[0] || '';
  const salute = firstName ? `, ${firstName}` : '';
  if (hour < 12) return `Good morning${salute}. Ready to forge today?`;
  if (hour < 17) return `Good afternoon${salute}. Your square is waiting.`;
  return `Good evening${salute}. Don't leave today's square empty.`;
}

export function calculateStreak(dailyScores: DailyScore[]): StreakData {
  const scoreMap = new Map(dailyScores.map(d => [d.date, d]));
  const today = new Date();

  let currentStreak = 0;
  let bestStreak = 0;
  let runningStreak = 0;
  let lastActivityDate = '';
  let totalDaysTracked = 0;
  let totalHabitsCompleted = 0;
  let totalTasksCompleted = 0;

  // Sort all known dates
  const sortedDates = [...dailyScores]
    .sort((a, b) => a.date.localeCompare(b.date));

  // Count totals
  for (const d of sortedDates) {
    if (d.score > 0) totalDaysTracked++;
    totalHabitsCompleted += d.habitsCompleted;
    totalTasksCompleted += d.tasksCompleted;
    if (d.score >= STREAK_THRESHOLD) {
      if (!lastActivityDate || d.date > lastActivityDate) {
        lastActivityDate = d.date;
      }
    }
  }

  // Calculate current streak going backwards from today
  let checkDate = today;
  let i = 0;
  while (i < 400) {
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    const dayData = scoreMap.get(dateStr);
    const score = dayData?.score ?? 0;

    if (score >= STREAK_THRESHOLD) {
      currentStreak++;
    } else {
      // Allow today to be still in progress
      if (i === 0) {
        // today hasn't ended yet
      } else {
        break;
      }
    }
    checkDate = subDays(checkDate, 1);
    i++;
  }

  // Calculate best streak
  let tempStreak = 0;
  for (const d of sortedDates) {
    if (d.score >= STREAK_THRESHOLD) {
      tempStreak++;
      if (tempStreak > bestStreak) bestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }
  if (bestStreak < currentStreak) bestStreak = currentStreak;

  // 30-day consistency
  let consistency30d = 0;
  for (let j = 0; j < 30; j++) {
    const d = format(subDays(today, j), 'yyyy-MM-dd');
    const score = scoreMap.get(d)?.score ?? 0;
    if (score >= STREAK_THRESHOLD) consistency30d++;
  }

  return {
    currentStreak,
    bestStreak,
    consistency30d,
    lastActivityDate: lastActivityDate || todayStr(),
    totalDaysTracked,
    totalHabitsCompleted,
    totalTasksCompleted,
  };
}

export function get365DayRange(): string[] {
  const today = new Date();
  const dates: string[] = [];
  for (let i = 364; i >= 0; i--) {
    dates.push(format(subDays(today, i), 'yyyy-MM-dd'));
  }
  return dates;
}

export function getHabit30DayRange(): string[] {
  const today = new Date();
  const dates: string[] = [];
  for (let i = 29; i >= 0; i--) {
    dates.push(format(subDays(today, i), 'yyyy-MM-dd'));
  }
  return dates;
}

export function groupDatesIntoWeeks(dates: string[]): string[][] {
  // Pad start so week starts on Sunday
  const firstDate = parseISO(dates[0]);
  const dayOfWeek = firstDate.getDay(); // 0=Sun
  const padded: (string | null)[] = [
    ...Array(dayOfWeek).fill(null),
    ...dates,
  ];
  const weeks: string[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(
      padded.slice(i, i + 7).map(d => d ?? '') as string[]
    );
  }
  return weeks;
}

export function getMonthLabels(dates: string[]): { month: string; col: number }[] {
  const labels: { month: string; col: number }[] = [];
  let lastMonth = '';
  const firstDayOfWeek = parseISO(dates[0]).getDay();

  dates.forEach((date, idx) => {
    if (!date) return;
    const month = format(parseISO(date), 'MMM');
    const col = Math.floor((idx + firstDayOfWeek) / 7);
    if (month !== lastMonth) {
      labels.push({ month, col });
      lastMonth = month;
    }
  });
  return labels;
}
