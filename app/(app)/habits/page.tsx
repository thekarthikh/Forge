'use client';

import { useState, useRef } from 'react';
import { useForge } from '@/lib/context';
import { getHabitConsistency30d, getHabit30DayCompletions } from '@/lib/store';
import { Habit, HabitFrequency } from '@/lib/types';
import { Plus, Trash2, Edit2, X, Check, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

// =============================================
// EMOJI PICKER (simple quick list)
// =============================================
const QUICK_EMOJIS = ['💪', '📚', '🧘', '🏃', '💧', '🥗', '😴', '✍️', '🎯', '🎸', '🌿', '🧠', '🚴', '🏋️', '🧹', '📝', '🎨', '☀️', '🍎', '🚶'];

// =============================================
// MINI HEATMAP
// =============================================
function MiniHeatmap({ habitId, completions }: { habitId: string; completions: import('@/lib/types').HabitCompletion[] }) {
  const days = getHabit30DayCompletions(habitId, completions);
  return (
    <div className="mini-heatmap" style={{ flexWrap: 'wrap', gap: 2 }}>
      {days.map((done, i) => (
        <div
          key={i}
          className="mini-heatmap-square"
          style={{
            background: done ? 'var(--accent-green)' : 'var(--bg-elevated)',
            border: done ? 'none' : '1px solid var(--border-subtle)',
            opacity: done ? 1 : 0.5,
          }}
          title={`Day ${i + 1}`}
        />
      ))}
    </div>
  );
}

// =============================================
// HABIT FORM (add / edit)
// =============================================
const FREQUENCY_OPTIONS: { value: HabitFrequency; label: string }[] = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays (Mon–Fri)' },
  { value: 'weekends', label: 'Weekends (Sat–Sun)' },
  { value: 'custom', label: 'Custom days' },
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface HabitFormProps {
  initial?: Partial<Habit>;
  onSave: (data: Omit<Habit, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function HabitForm({ initial, onSave, onCancel }: HabitFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '💪');
  const [reminderTime, setReminderTime] = useState(initial?.reminderTime ?? '08:00');
  const [frequency, setFrequency] = useState<HabitFrequency>(initial?.frequency ?? 'daily');
  const [customDays, setCustomDays] = useState<number[]>(initial?.customDays ?? [1, 2, 3, 4, 5]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const toggleDay = (day: number) => {
    setCustomDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      nameRef.current?.focus();
      return;
    }
    onSave({
      name: name.trim(),
      emoji,
      reminderTime,
      frequency,
      customDays: frequency === 'custom' ? customDays : undefined,
    });
  };

  return (
    <div className="forge-overlay" onClick={onCancel}>
      <div
        className="forge-sheet"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          right: 'auto',
          bottom: 'auto',
          maxWidth: 480,
          width: 'calc(100% - 32px)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-card)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
            {initial ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Emoji + Name */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-start' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setShowEmojiPicker(v => !v)}
              style={{
                width: 52,
                height: 44,
                fontSize: 22,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {emoji}
            </button>
            {showEmojiPicker && (
              <div style={{
                position: 'absolute',
                top: 52,
                left: 0,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: 10,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 4,
                width: 220,
                zIndex: 10,
                boxShadow: 'var(--shadow-card)',
              }}>
                {QUICK_EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => { setEmoji(e); setShowEmojiPicker(false); }}
                    style={{
                      background: e === emoji ? 'var(--accent-glow)' : 'none',
                      border: e === emoji ? '1px solid var(--accent-green)' : '1px solid transparent',
                      borderRadius: 6,
                      fontSize: 20,
                      padding: '4px 6px',
                      cursor: 'pointer',
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            ref={nameRef}
            autoFocus
            className="forge-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Habit name..."
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{ flex: 1 }}
          />
        </div>

        {/* Reminder time */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
            Reminder Time
          </label>
          <input
            type="time"
            className="forge-input"
            value={reminderTime}
            onChange={e => setReminderTime(e.target.value)}
            style={{ width: 'auto' }}
          />
        </div>

        {/* Frequency */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
            Frequency
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {FREQUENCY_OPTIONS.map(opt => (
              <label
                key={opt.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  background: frequency === opt.value ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                  border: `1px solid ${frequency === opt.value ? 'rgba(74,222,128,0.3)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  type="radio"
                  name="frequency"
                  value={opt.value}
                  checked={frequency === opt.value}
                  onChange={() => setFrequency(opt.value)}
                  style={{ display: 'none' }}
                />
                <div style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: `2px solid ${frequency === opt.value ? 'var(--accent-green)' : 'var(--border-default)'}`,
                  background: frequency === opt.value ? 'var(--accent-green)' : 'transparent',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {frequency === opt.value && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#080b0a' }} />}
                </div>
                <span style={{ fontSize: 14, color: frequency === opt.value ? 'var(--accent-green)' : 'var(--text-secondary)', fontWeight: frequency === opt.value ? 600 : 400 }}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>

          {/* Custom days picker */}
          {frequency === 'custom' && (
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {DAY_LABELS.map((d, i) => (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  style={{
                    width: 42,
                    height: 36,
                    borderRadius: 8,
                    background: customDays.includes(i) ? 'var(--accent-green)' : 'var(--bg-elevated)',
                    border: `1px solid ${customDays.includes(i) ? 'var(--accent-green)' : 'var(--border-default)'}`,
                    color: customDays.includes(i) ? '#080b0a' : 'var(--text-secondary)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="forge-btn forge-btn-ghost" onClick={onCancel} style={{ flex: 1 }}>
            Cancel
          </button>
          <button className="forge-btn forge-btn-primary" onClick={handleSubmit} style={{ flex: 2 }}>
            <Check size={16} />
            {initial ? 'Save Changes' : 'Add Habit'}
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================
// HABIT CARD
// =============================================
function HabitCard({
  habit,
  completions,
  onEdit,
  onDelete,
}: {
  habit: Habit;
  completions: import('@/lib/types').HabitCompletion[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const consistency = getHabitConsistency30d(habit.id, completions);
  const consistencyPct = Math.round((consistency / 30) * 100);

  const freqLabel = {
    daily: 'Every day',
    weekdays: 'Weekdays',
    weekends: 'Weekends',
    custom: habit.customDays?.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ') ?? 'Custom',
  }[habit.frequency];

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease',
      }}
    >
      {/* Main row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '16px 16px',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(v => !v)}
      >
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          flexShrink: 0,
        }}>
          {habit.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
            {habit.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>⏰ {habit.reminderTime}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>·</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{freqLabel}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>·</span>
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              color: consistencyPct >= 70 ? 'var(--accent-green)' : consistencyPct >= 40 ? 'var(--warning)' : 'var(--text-muted)',
            }}>
              {consistency}/30 days
            </span>
          </div>
        </div>

        <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{
          padding: '0 16px 16px',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 14,
          animation: 'fade-up 0.2s ease forwards',
        }}>
          {/* 30d consistency bar */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>30-Day Consistency</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: consistencyPct >= 70 ? 'var(--accent-green)' : 'var(--text-muted)' }}>{consistencyPct}%</span>
            </div>
            <div className="forge-progress">
              <div className="forge-progress-fill" style={{ width: `${consistencyPct}%` }} />
            </div>
          </div>

          {/* Mini heatmap */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Last 30 Days</div>
            <MiniHeatmap habitId={habit.id} completions={completions} />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="forge-btn forge-btn-ghost"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              style={{ flex: 1, fontSize: 13, padding: '8px 12px' }}
            >
              <Edit2 size={13} /> Edit
            </button>
            <button
              className="forge-btn forge-btn-danger"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              style={{ fontSize: 13, padding: '8px 12px' }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================
// HABITS PAGE
// =============================================
export default function HabitsPage() {
  const { store, handleAddHabit, handleUpdateHabit, handleDeleteHabit } = useForge();
  const [showAdd, setShowAdd] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const habits = store.habits;
  const isPro = store.profile.isPro;
  const atLimit = !isPro && habits.length >= 5;

  const handleSaveNew = (data: Omit<Habit, 'id' | 'createdAt'>) => {
    handleAddHabit(data);
    setShowAdd(false);
  };

  const handleSaveEdit = (data: Omit<Habit, 'id' | 'createdAt'>) => {
    if (!editingHabit) return;
    handleUpdateHabit(editingHabit.id, data);
    setEditingHabit(null);
  };

  const handleDelete = (id: string) => {
    handleDeleteHabit(id);
    setConfirmDelete(null);
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px' }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 4 }}>
            Habits
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {habits.length === 0
              ? 'Add your first habit below.'
              : `${habits.length} habit${habits.length !== 1 ? 's' : ''} · 10 pts each when completed`}
          </p>
        </div>

        <button
          className="forge-btn forge-btn-primary"
          onClick={() => atLimit ? null : setShowAdd(true)}
          style={{
            opacity: atLimit ? 0.5 : 1,
            cursor: atLimit ? 'not-allowed' : 'pointer',
          }}
          title={atLimit ? 'Upgrade to Pro to add more habits' : 'Add habit'}
        >
          <Plus size={16} /> Add Habit
        </button>
      </div>

      {/* Free tier limit warning */}
      {atLimit && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(251,191,36,0.08)',
          border: '1px solid rgba(251,191,36,0.2)',
          borderRadius: 10,
          marginBottom: 20,
          fontSize: 13,
          color: 'var(--warning)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span>⚡</span>
          <span>Free plan is limited to 5 habits. <a href="/upgrade" style={{ color: 'var(--accent-green)', fontWeight: 600, textDecoration: 'none' }}>Upgrade to Pro →</a></span>
        </div>
      )}

      {/* Stats row */}
      {habits.length > 0 && (
        <div className="animate-fade-up delay-100" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Total Habits', value: habits.length },
            { label: 'Habits Today', value: store.completions.filter(c => c.date === new Date().toISOString().slice(0, 10)).length },
            { label: 'Total Completions', value: store.completions.length },
          ].map(s => (
            <div key={s.label} style={{
              padding: '14px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--accent-green)', letterSpacing: '-0.5px' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Habit list */}
      <div className="animate-fade-up delay-200" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {habits.length === 0 ? (
          <div style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: 'var(--bg-surface)',
            borderRadius: 16,
            border: '1px dashed var(--border-default)',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Start building your first habit</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, maxWidth: 300, margin: '0 auto 20px' }}>
              Each completed habit adds 10 points to your daily square. Small actions, compounding results.
            </div>
            <button className="forge-btn forge-btn-primary" onClick={() => setShowAdd(true)}>
              <Plus size={16} /> Add Your First Habit
            </button>
          </div>
        ) : (
          habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              completions={store.completions}
              onEdit={() => setEditingHabit(habit)}
              onDelete={() => setConfirmDelete(habit.id)}
            />
          ))
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <HabitForm
          onSave={handleSaveNew}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {/* Edit form */}
      {editingHabit && (
        <HabitForm
          initial={editingHabit}
          onSave={handleSaveEdit}
          onCancel={() => setEditingHabit(null)}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="forge-overlay" onClick={() => setConfirmDelete(null)}>
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xl)',
              padding: 28,
              maxWidth: 360,
              width: 'calc(100% - 32px)',
              boxShadow: 'var(--shadow-card)',
              animation: 'fade-up 0.2s ease forwards',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 32, marginBottom: 12, textAlign: 'center' }}>🗑️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', marginBottom: 6 }}>
              Delete this habit?
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 24 }}>
              This will remove all completion history for this habit. This can't be undone.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="forge-btn forge-btn-ghost" onClick={() => setConfirmDelete(null)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button className="forge-btn forge-btn-danger" onClick={() => handleDelete(confirmDelete!)} style={{ flex: 1 }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
