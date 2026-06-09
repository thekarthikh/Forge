'use client';

import { useState, useEffect, useRef } from 'react';
import { useForge } from '@/lib/context';
import { getGreeting, todayStr } from '@/lib/dates';
import { scoreToPercent, getScoreLabel, levelToColor, STREAK_THRESHOLD } from '@/lib/scoring';
import { isHabitCompletedToday, getHabitStreak, getTodayPriorities } from '@/lib/store';
import { format } from 'date-fns';
import { Plus, Check, Calendar, ChevronRight, Flame, Target, Trash2, ArrowRight } from 'lucide-react';
import { Priority, Task } from '@/lib/types';
import clsx from 'clsx';

// =============================================
// TODAY SQUARE
// =============================================
function TodaySquare({ score, level }: { score: number; level: string }) {
  const pct = scoreToPercent(score);
  const color = levelToColor(level as any);
  const label = getScoreLabel(score);
  const isActive = score > 0;

  return (
    <div style={{ textAlign: 'center', marginBottom: 32 }}>
      {/* The Square */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div
          className={`today-square-wrapper ${isActive ? 'active' : ''}`}
          style={{
            width: 120,
            height: 120,
            borderRadius: 16,
            background: color,
            border: `2px solid ${isActive ? 'rgba(74,222,128,0.4)' : 'var(--border-subtle)'}`,
            transition: 'background 0.6s cubic-bezier(0.4,0,0.2,1), border-color 0.6s ease, box-shadow 0.6s ease',
            boxShadow: isActive ? `0 0 40px ${color}40, 0 0 80px ${color}20` : 'none',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {pct >= 100 && (
            <div style={{ fontSize: 40 }} className="animate-float">⚡</div>
          )}
          {pct > 0 && pct < 100 && (
            <div style={{
              fontSize: 22,
              fontWeight: 900,
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}>{pct}%</div>
          )}
          {pct === 0 && (
            <div style={{ fontSize: 32, opacity: 0.3 }}>◻</div>
          )}
        </div>
      </div>

      {/* Score label */}
      <p style={{
        fontSize: 14,
        color: isActive ? 'var(--text-secondary)' : 'var(--text-muted)',
        maxWidth: 280,
        margin: '0 auto',
        lineHeight: 1.5,
      }}>
        {label}
      </p>

      {/* Mini progress bar */}
      <div style={{ maxWidth: 200, margin: '12px auto 0' }}>
        <div className="forge-progress">
          <div className="forge-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>0</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{score} pts</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>100+</span>
        </div>
      </div>
    </div>
  );
}

// =============================================
// TOP 3 PRIORITIES
// =============================================
function TopThreePriorities() {
  const { handleSetPriorityTitle, handleTogglePriority, store } = useForge();
  const today = todayStr();
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<string[]>(['', '', '']);

  const priorities = getTodayPriorities(store.priorities);

  useEffect(() => {
    setDrafts(priorities.map(p => p.title));
  }, [store.priorities.length]);

  const handleBlur = (order: number) => {
    handleSetPriorityTitle(today, order, drafts[order]);
    setEditingIdx(null);
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Target size={16} color="var(--accent-green)" />
        <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Top 3 Priorities
        </h2>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>20 pts each</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {priorities.map((p, idx) => (
          <div key={p.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            background: 'var(--bg-surface)',
            borderRadius: 10,
            border: `1px solid ${p.completed ? 'rgba(74,222,128,0.25)' : editingIdx === idx ? 'var(--border-strong)' : 'var(--border-subtle)'}`,
            transition: 'border-color 0.2s ease',
          }}>
            {/* Number badge */}
            <div style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: p.completed ? 'var(--accent-green)' : 'var(--bg-elevated)',
              border: `1px solid ${p.completed ? 'var(--accent-green)' : 'var(--border-default)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: p.completed ? '#080b0a' : 'var(--text-muted)',
              flexShrink: 0,
              cursor: p.title ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
            }} onClick={() => p.title && handleTogglePriority(today, idx)}>
              {p.completed ? <Check size={12} strokeWidth={3} /> : idx + 1}
            </div>

            {/* Input or text */}
            {editingIdx === idx ? (
              <input
                autoFocus
                className="forge-input"
                value={drafts[idx]}
                placeholder={`Priority ${idx + 1}...`}
                onChange={e => {
                  const newDrafts = [...drafts];
                  newDrafts[idx] = e.target.value;
                  setDrafts(newDrafts);
                }}
                onBlur={() => handleBlur(idx)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleBlur(idx);
                  if (e.key === 'Escape') setEditingIdx(null);
                }}
                style={{ padding: '4px 8px', fontSize: 14, height: 32 }}
              />
            ) : (
              <div
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: p.title ? (p.completed ? 'var(--text-muted)' : 'var(--text-primary)') : 'var(--text-muted)',
                  textDecoration: p.completed ? 'line-through' : 'none',
                  cursor: 'text',
                  minHeight: 20,
                  fontStyle: p.title ? 'normal' : 'italic',
                }}
                onClick={() => setEditingIdx(idx)}
              >
                {p.title || `Tap to set priority ${idx + 1}...`}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================
// HABIT LIST
// =============================================
function HabitList() {
  const { store, handleToggleHabit } = useForge();
  const [completing, setCompleting] = useState<string | null>(null);

  const habitsWithStatus = store.habits.map(h => ({
    habit: h,
    completed: isHabitCompletedToday(h.id, store.completions),
    streak: getHabitStreak(h.id, store.completions),
  })).sort((a, b) => {
    // Completed last, then by reminder time
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.habit.reminderTime.localeCompare(b.habit.reminderTime);
  });

  const handleComplete = (habitId: string) => {
    setCompleting(habitId);
    handleToggleHabit(habitId);
    setTimeout(() => setCompleting(null), 400);
  };

  if (store.habits.length === 0) {
    return (
      <div style={{ marginBottom: 32 }}>
        <SectionHeader title="Habits" subtitle="10 pts each" icon="💚" />
        <div style={{ padding: 20, textAlign: 'center', background: 'var(--bg-surface)', borderRadius: 10, border: '1px dashed var(--border-default)' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🌱</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No habits yet. Add one in the Habits tab.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <SectionHeader title="Habits" subtitle="10 pts each" icon="💚" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {habitsWithStatus.map(({ habit, completed, streak }) => (
          <div
            key={habit.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              background: completed ? 'rgba(74,222,128,0.05)' : 'var(--bg-surface)',
              borderRadius: 10,
              border: `1px solid ${completed ? 'rgba(74,222,128,0.2)' : 'var(--border-subtle)'}`,
              transition: 'all 0.3s ease',
              opacity: completed ? 0.75 : 1,
            }}
          >
            <div style={{ fontSize: 20, flexShrink: 0 }}>{habit.emoji}</div>

            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 14,
                fontWeight: 500,
                color: completed ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: completed ? 'line-through' : 'none',
              }}>{habit.name}</div>
              {streak > 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 1 }}>
                  <Flame size={10} color="#f97316" />
                  {streak} day streak
                </div>
              )}
            </div>

            <button
              className={`forge-checkbox ${completed ? 'checked' : ''} ${completing === habit.id ? 'animate-checkmark-pop' : ''}`}
              onClick={() => handleComplete(habit.id)}
              aria-label={`${completed ? 'Uncheck' : 'Complete'} ${habit.name}`}
            >
              {completed && <Check size={13} strokeWidth={3} color="#080b0a" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================
// TASK LIST
// =============================================
function TaskList() {
  const { store, handleAddTask, handleCompleteTask, handleDeleteTask, handleRescheduleTask } = useForge();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const today = todayStr();
  const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

  const todayTasks = store.tasks.filter(t => !t.completed && (t.dueDate === today || !t.dueDate));
  const overdueTasks = store.tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today);
  const completedToday = store.tasks.filter(t => t.completed && t.completedAt?.startsWith(today));

  const handleAdd = () => {
    if (!newTaskTitle.trim()) return;
    handleAddTask({ title: newTaskTitle.trim(), dueDate: today });
    setNewTaskTitle('');
    inputRef.current?.focus();
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <SectionHeader title="Tasks" subtitle="5 pts each" icon="✅" />

      {/* Quick capture */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          ref={inputRef}
          className="forge-input"
          value={newTaskTitle}
          onChange={e => setNewTaskTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Add a task and press Enter..."
          style={{ flex: 1 }}
          id="task-quick-capture"
        />
        <button
          className="forge-btn forge-btn-primary"
          onClick={handleAdd}
          style={{ padding: '10px 14px', flexShrink: 0 }}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Overdue tasks */}
      {overdueTasks.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--warning)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Overdue
          </div>
          {overdueTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              overdue
              onComplete={() => handleCompleteTask(task.id)}
              onDelete={() => handleDeleteTask(task.id)}
              onReschedule={() => handleRescheduleTask(task.id, today)}
            />
          ))}
        </div>
      )}

      {/* Today's tasks */}
      {todayTasks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {todayTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={() => handleCompleteTask(task.id)}
              onDelete={() => handleDeleteTask(task.id)}
              onReschedule={() => handleRescheduleTask(task.id, tomorrow)}
            />
          ))}
        </div>
      )}

      {/* Completed today */}
      {completedToday.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Done today ✓ {completedToday.length}
          </div>
          {completedToday.slice(0, 3).map(task => (
            <div key={task.id} style={{
              padding: '8px 12px',
              fontSize: 13,
              color: 'var(--text-muted)',
              textDecoration: 'line-through',
              opacity: 0.6,
            }}>{task.title}</div>
          ))}
          {completedToday.length > 3 && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '4px 12px' }}>
              +{completedToday.length - 3} more completed
            </div>
          )}
        </div>
      )}

      {todayTasks.length === 0 && overdueTasks.length === 0 && completedToday.length === 0 && (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          No tasks for today. Add one above.
        </div>
      )}
    </div>
  );
}

function TaskItem({ task, overdue, onComplete, onDelete, onReschedule }: {
  task: Task;
  overdue?: boolean;
  onComplete: () => void;
  onDelete: () => void;
  onReschedule: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        background: overdue ? 'rgba(251,191,36,0.04)' : 'var(--bg-surface)',
        borderRadius: 10,
        border: `1px solid ${overdue ? 'rgba(251,191,36,0.15)' : 'var(--border-subtle)'}`,
        marginBottom: 6,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <button
        className="forge-checkbox"
        onClick={onComplete}
        aria-label={`Complete ${task.title}`}
        style={{ flexShrink: 0 }}
      />
      <span
        style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)' }}
        onClick={() => setShowActions(!showActions)}
      >
        {task.title}
      </span>
      {showActions && (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={onReschedule}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
            title="Move to tomorrow"
          >
            <ArrowRight size={14} />
          </button>
          <button
            onClick={onDelete}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 4 }}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================
// SECTION HEADER
// =============================================
function SectionHeader({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {title}
      </h2>
      {subtitle && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{subtitle}</span>}
    </div>
  );
}

// =============================================
// TODAY PAGE
// =============================================
export default function TodayPage() {
  const { todayScore, streak, store } = useForge();
  const [greeting, setGreeting] = useState('');
  const today = todayStr();
  const displayDate = format(new Date(), 'EEEE, MMMM d');

  useEffect(() => {
    setGreeting(getGreeting(store.profile.name));
    // Update greeting every minute
    const interval = setInterval(() => setGreeting(getGreeting(store.profile.name)), 60000);
    return () => clearInterval(interval);
  }, [store.profile.name]);

  // Day-20 upsell trigger
  const show20DayUpsell = !store.profile.isPro && streak.totalDaysTracked === 20;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px' }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
          {displayDate}
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {greeting}
        </h1>
      </div>

      {/* Day 20 upsell */}
      {show20DayUpsell && (
        <div style={{
          padding: '14px 16px',
          background: 'linear-gradient(135deg, rgba(74,222,128,0.12), rgba(74,222,128,0.06))',
          border: '1px solid rgba(74,222,128,0.3)',
          borderRadius: 12,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{ fontSize: 24 }}>🏆</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              You've forged 20 days. Your history lives here.
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              Don't lose it. Go Pro and protect your streak.
            </div>
          </div>
          <a href="/upgrade" style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-green)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Go Pro →
          </a>
        </div>
      )}

      {/* Today Square */}
      <div className="animate-fade-up delay-100">
        <TodaySquare score={todayScore.score} level={todayScore.level} />
      </div>

      {/* Streak pill */}
      {streak.currentStreak > 0 && (
        <div className="animate-fade-up delay-200" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          marginBottom: 32,
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 16px',
            background: 'rgba(74,222,128,0.08)',
            border: '1px solid rgba(74,222,128,0.2)',
            borderRadius: 9999,
            fontSize: 13,
            fontWeight: 600,
          }}>
            <Flame size={14} color="#f97316" />
            <span style={{ color: 'var(--accent-green)' }}>{streak.currentStreak} day streak</span>
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 9999,
            fontSize: 13,
            color: 'var(--text-secondary)',
          }}>
            {streak.consistency30d}/30 this month
          </div>
        </div>
      )}

      {/* Top 3 Priorities */}
      <div className="animate-fade-up delay-200">
        <TopThreePriorities />
      </div>

      {/* Habits */}
      <div className="animate-fade-up delay-300">
        <HabitList />
      </div>

      {/* Tasks */}
      <div className="animate-fade-up delay-400">
        <TaskList />
      </div>
    </div>
  );
}
