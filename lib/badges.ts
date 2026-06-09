import { BadgeDefinition, EarnedBadge, BadgeCheckData, StreakData } from './types';
import { format, subDays } from 'date-fns';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_week',
    emoji: '🌱',
    name: 'First 7 Days',
    description: 'Completed your first week in Forge',
    check: ({ streak }) => streak.currentStreak >= 7 || streak.bestStreak >= 7,
  },
  {
    id: 'streak_7',
    emoji: '🔥',
    name: '7-Day Streak',
    description: 'Maintained a 7-day streak',
    check: ({ streak }) => streak.bestStreak >= 7,
  },
  {
    id: 'streak_30',
    emoji: '🔥🔥',
    name: '30-Day Streak',
    description: 'Maintained a 30-day streak — one full month',
    check: ({ streak }) => streak.bestStreak >= 30,
  },
  {
    id: 'streak_100',
    emoji: '🔥🔥🔥',
    name: '100-Day Streak',
    description: 'Maintained a 100-day streak — elite territory',
    check: ({ streak }) => streak.bestStreak >= 100,
  },
  {
    id: 'streak_365',
    emoji: '🔥🔥🔥🔥',
    name: '365-Day Streak',
    description: 'One full year — the rarest badge in Forge',
    check: ({ streak }) => streak.bestStreak >= 365,
  },
  {
    id: 'perfect_week',
    emoji: '💚',
    name: 'Perfect Week',
    description: 'Every square full for 7 consecutive days',
    check: ({ dailyScores }) => {
      let count = 0;
      const sorted = [...dailyScores].sort((a, b) => b.date.localeCompare(a.date));
      for (const d of sorted) {
        if (d.score >= 80) { count++; if (count >= 7) return true; }
        else count = 0;
      }
      return false;
    },
  },
  {
    id: 'perfect_month',
    emoji: '💚💚',
    name: 'Perfect Month',
    description: 'Every square full for 30 consecutive days',
    check: ({ dailyScores }) => {
      let count = 0;
      const sorted = [...dailyScores].sort((a, b) => b.date.localeCompare(a.date));
      for (const d of sorted) {
        if (d.score >= 80) { count++; if (count >= 30) return true; }
        else count = 0;
      }
      return false;
    },
  },
  {
    id: 'days_100',
    emoji: '📅',
    name: '100 Days Tracked',
    description: 'Used Forge for 100 days',
    check: ({ streak }) => streak.totalDaysTracked >= 100,
  },
  {
    id: 'days_365',
    emoji: '📅📅',
    name: '365 Days Tracked',
    description: 'One full year in Forge',
    check: ({ streak }) => streak.totalDaysTracked >= 365,
  },
  {
    id: 'morning_champion',
    emoji: '🌅',
    name: 'Morning Champion',
    description: 'Morning habits completed 30 days in a row',
    check: ({ streak }) => streak.consistency30d >= 25,
  },
];

export function checkAndAwardBadges(
  data: BadgeCheckData,
  earnedBadges: EarnedBadge[]
): EarnedBadge[] {
  const newBadges: EarnedBadge[] = [...earnedBadges];
  const earnedIds = new Set(earnedBadges.map(b => b.badgeId));

  for (const badge of BADGE_DEFINITIONS) {
    if (!earnedIds.has(badge.id) && badge.check(data)) {
      newBadges.push({ badgeId: badge.id, earnedAt: new Date().toISOString() });
    }
  }

  return newBadges;
}
