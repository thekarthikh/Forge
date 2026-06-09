'use client';

import { useState, useMemo } from 'react';
import { useForge } from '@/lib/context';
import { get365DayRange, groupDatesIntoWeeks, getMonthLabels, calculateStreak } from '@/lib/dates';
import { levelToColor, levelToClass, scoreToLevel } from '@/lib/scoring';
import { format, parseISO } from 'date-fns';
import { Flame, Trophy, TrendingUp, Calendar, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import { DailyScore, SquareLevel } from '@/lib/types';

// =============================================
// FORGE MAP GRID
// =============================================
function ForgeMapGrid({
  dailyScores,
  onSelectDay,
  selectedDay,
}: {
  dailyScores: DailyScore[];
  onSelectDay: (date: string) => void;
  selectedDay: string | null;
}) {
  const scoreMap = useMemo(
    () => new Map(dailyScores.map(d => [d.date, d])),
    [dailyScores]
  );
  const dates = get365DayRange();
  const weeks = groupDatesIntoWeeks(dates);
  const monthLabels = getMonthLabels(dates);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
      {/* Month labels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${weeks.length}, 14px)`,
        gap: 3,
        marginBottom: 4,
        marginLeft: 0,
        position: 'relative',
        height: 16,
      }}>
        {monthLabels.map(({ month, col }) => (
          <div
            key={`${month}-${col}`}
            style={{
              position: 'absolute',
              left: col * 17,
              fontSize: 10,
              color: 'var(--text-muted)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            {month}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display: 'flex',
        gap: 3,
        alignItems: 'flex-start',
      }}>
        {/* Day labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginRight: 4 }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} style={{
              width: 10,
              height: 14,
              fontSize: 9,
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>{i % 2 === 1 ? d : ''}</div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {week.map((date, di) => {
              if (!date) {
                return <div key={di} style={{ width: 14, height: 14 }} />;
              }
              const dayData = scoreMap.get(date);
              const level = dayData?.level ?? 'empty';
              const isSelected = date === selectedDay;
              const isToday = date === new Date().toISOString().slice(0, 10);

              return (
                <div
                  key={date}
                  onClick={() => onSelectDay(date)}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    background: levelToColor(level),
                    cursor: 'pointer',
                    border: isSelected
                      ? '1.5px solid var(--accent-green)'
                      : isToday
                      ? '1.5px solid rgba(74,222,128,0.5)'
                      : '1px solid rgba(255,255,255,0.04)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    boxShadow: isSelected ? '0 0 8px rgba(74,222,128,0.5)' : 'none',
                  }}
                  onMouseEnter={e => {
                    (e.target as HTMLElement).style.transform = 'scale(1.4)';
                    (e.target as HTMLElement).style.zIndex = '10';
                    (e.target as HTMLElement).style.position = 'relative';
                  }}
                  onMouseLeave={e => {
                    (e.target as HTMLElement).style.transform = 'scale(1)';
                    (e.target as HTMLElement).style.zIndex = '';
                    (e.target as HTMLElement).style.position = '';
                  }}
                  title={`${date}: ${dayData?.score ?? 0} pts`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10 }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Less</span>
        {(['empty', 'pale', 'light', 'medium', 'strong', 'deep', 'max'] as SquareLevel[]).map(level => (
          <div key={level} style={{
            width: 12,
            height: 12,
            borderRadius: 3,
            background: levelToColor(level),
            border: '1px solid rgba(255,255,255,0.04)',
          }} />
        ))}
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>More</span>
      </div>
    </div>
  );
}

// =============================================
// DAY DETAIL PANEL
// =============================================
function DayDetail({ date, dailyScores }: { date: string; dailyScores: DailyScore[] }) {
  const dayData = dailyScores.find(d => d.date === date);
  const displayDate = format(parseISO(date), 'EEEE, MMMM d, yyyy');

  return (
    <div style={{
      padding: '16px',
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-default)',
      borderRadius: 12,
      marginTop: 16,
      animation: 'fade-up 0.3s ease forwards',
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
        {displayDate}
      </div>
      {dayData ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
          <StatMini label="Score" value={`${dayData.score}`} unit="pts" color="var(--accent-green)" />
          <StatMini label="Priorities" value={`${dayData.prioritiesCompleted}`} unit="/3" />
          <StatMini label="Habits" value={`${dayData.habitsCompleted}`} unit="done" />
          <StatMini label="Tasks" value={`${dayData.tasksCompleted}`} unit="done" />
        </div>
      ) : (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 12 }}>
          No data for this day.
        </div>
      )}
    </div>
  );
}

function StatMini({ label, value, unit, color }: { label: string; value: string; unit: string; color?: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: color ?? 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{unit}</div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

// =============================================
// FORGE MAP PAGE
// =============================================
export default function ForgeMapPage() {
  const { store, streak } = useForge();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const allScores = store.dailyScores;
  const totalSquaresFilled = allScores.filter(d => d.score > 0).length;
  const perfectDays = allScores.filter(d => d.score >= 100).length;

  // Best month
  const monthCounts: Record<string, number> = {};
  allScores.forEach(d => {
    if (d.score > 30) {
      const month = d.date.slice(0, 7);
      monthCounts[month] = (monthCounts[month] ?? 0) + 1;
    }
  });
  const bestMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0];
  const bestMonthLabel = bestMonth ? format(parseISO(bestMonth[0] + '-01'), 'MMM yyyy') : '—';

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 20px' }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 4 }}>
          Forge Map
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Every square is a day. Every shade of green is proof of who you're becoming.
        </p>
      </div>

      {/* Streak hero */}
      <div className="animate-fade-up delay-100" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: 12,
        marginBottom: 32,
      }}>
        <StatCard
          icon={<span className="streak-fire">🔥</span>}
          label="Current Streak"
          value={streak.currentStreak}
          unit="days"
          highlight
        />
        <StatCard
          icon={<Trophy size={20} color="var(--warning)" />}
          label="Personal Best"
          value={streak.bestStreak}
          unit="days"
        />
        <StatCard
          icon={<TrendingUp size={20} color="var(--accent-green)" />}
          label="This Month"
          value={streak.consistency30d}
          unit="/ 30 days"
        />
        <StatCard
          icon={<BarChart2 size={20} color="var(--accent-green)" />}
          label="Total Days"
          value={streak.totalDaysTracked}
          unit="tracked"
        />
      </div>

      {/* The Map */}
      <div className="animate-fade-up delay-200 forge-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
          365-Day Consistency Map
        </div>
        <ForgeMapGrid
          dailyScores={allScores}
          onSelectDay={day => setSelectedDay(day === selectedDay ? null : day)}
          selectedDay={selectedDay}
        />
        {selectedDay && (
          <DayDetail date={selectedDay} dailyScores={allScores} />
        )}
      </div>

      {/* Yearly stats */}
      <div className="animate-fade-up delay-300" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
        marginBottom: 24,
      }}>
        <DetailCard label="Total Squares Filled" value={totalSquaresFilled} emoji="🟩" />
        <DetailCard label="Perfect Days (100+pts)" value={perfectDays} emoji="⚡" />
        <DetailCard label="Habits Completed" value={streak.totalHabitsCompleted} emoji="💚" />
        <DetailCard label="Tasks Completed" value={streak.totalTasksCompleted} emoji="✅" />
        <DetailCard label="Best Month" value={bestMonthLabel} emoji="📅" isText />
        <DetailCard label="Total Habits" value={store.habits.length} emoji="🎯" />
      </div>
    </div>
  );
}

function StatCard({
  icon, label, value, unit, highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <div style={{
      padding: '16px',
      background: highlight ? 'rgba(74,222,128,0.08)' : 'var(--bg-surface)',
      border: `1px solid ${highlight ? 'rgba(74,222,128,0.25)' : 'var(--border-subtle)'}`,
      borderRadius: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      boxShadow: highlight ? 'var(--shadow-green)' : 'none',
    }}>
      <div>{icon}</div>
      <div>
        <div style={{
          fontSize: 28,
          fontWeight: 900,
          color: highlight ? 'var(--accent-green)' : 'var(--text-primary)',
          lineHeight: 1,
          letterSpacing: '-0.5px',
        }}>{value.toLocaleString()}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{unit}</div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function DetailCard({ label, value, emoji, isText }: { label: string; value: number | string; emoji: string; isText?: boolean }) {
  return (
    <div style={{
      padding: '14px 16px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 10,
    }}>
      <div style={{ fontSize: 20, marginBottom: 6 }}>{emoji}</div>
      <div style={{
        fontSize: isText ? 16 : 22,
        fontWeight: 800,
        color: 'var(--text-primary)',
        letterSpacing: '-0.3px',
        lineHeight: 1.2,
      }}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
    </div>
  );
}
