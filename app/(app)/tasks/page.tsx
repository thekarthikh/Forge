'use client';

import { useState, useRef } from 'react';
import { useForge } from '@/lib/context';
import { Task } from '@/lib/types';
import { format } from 'date-fns';
import { todayStr } from '@/lib/dates';
import { Plus, Trash2, Check, ArrowRight, Calendar, Tag, FileText, X, ChevronDown, Filter } from 'lucide-react';

// =============================================
// TASK FORM (add / edit sheet)
// =============================================
const TAG_PRESETS = ['work', 'personal', 'health', 'learning', 'finance', 'home'];

interface TaskFormProps {
  initial?: Partial<Task>;
  onSave: (data: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  onCancel: () => void;
}

function TaskForm({ initial, onSave, onCancel }: TaskFormProps) {
  const today = todayStr();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? today);
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [recurring, setRecurring] = useState<'daily' | 'weekly' | 'monthly' | null>(initial?.recurring ?? null);
  const titleRef = useRef<HTMLInputElement>(null);

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      titleRef.current?.focus();
      return;
    }
    onSave({ title: title.trim(), dueDate, notes: notes.trim() || undefined, tags: tags.length ? tags : undefined, recurring });
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
          maxWidth: 520,
          width: 'calc(100% - 32px)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-card)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
            {initial ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Title */}
        <input
          ref={titleRef}
          autoFocus
          className="forge-input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{ marginBottom: 14, fontSize: 15 }}
        />

        {/* Due date */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
            <Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />
            Due Date
          </label>
          <input
            type="date"
            className="forge-input"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            style={{ width: 'auto' }}
          />
        </div>

        {/* Recurring */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
            Recurring
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            {([null, 'daily', 'weekly', 'monthly'] as const).map(r => (
              <button
                key={String(r)}
                onClick={() => setRecurring(r)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${recurring === r ? 'var(--accent-green)' : 'var(--border-default)'}`,
                  background: recurring === r ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                  color: recurring === r ? 'var(--accent-green)' : 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: recurring === r ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {r === null ? 'None' : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
            <Tag size={11} style={{ display: 'inline', marginRight: 4 }} />
            Tags
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {TAG_PRESETS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${tags.includes(tag) ? 'rgba(74,222,128,0.4)' : 'var(--border-subtle)'}`,
                  background: tags.includes(tag) ? 'rgba(74,222,128,0.12)' : 'var(--bg-elevated)',
                  color: tags.includes(tag) ? 'var(--accent-green)' : 'var(--text-muted)',
                  fontSize: 12,
                  fontWeight: tags.includes(tag) ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
            <FileText size={11} style={{ display: 'inline', marginRight: 4 }} />
            Notes (optional)
          </label>
          <textarea
            className="forge-input"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add details..."
            rows={3}
            style={{ resize: 'vertical', minHeight: 72 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="forge-btn forge-btn-ghost" onClick={onCancel} style={{ flex: 1 }}>
            Cancel
          </button>
          <button className="forge-btn forge-btn-primary" onClick={handleSubmit} style={{ flex: 2 }}>
            <Check size={16} />
            {initial ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================
// TASK ROW
// =============================================
function TaskRow({
  task,
  onComplete,
  onUncomplete,
  onDelete,
  onReschedule,
  onEdit,
  overdue,
}: {
  task: Task;
  onComplete: () => void;
  onUncomplete: () => void;
  onDelete: () => void;
  onReschedule: () => void;
  onEdit: () => void;
  overdue?: boolean;
}) {
  const [showActions, setShowActions] = useState(false);
  const today = todayStr();
  const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      padding: '12px 14px',
      background: task.completed ? 'transparent' : overdue ? 'rgba(251,191,36,0.04)' : 'var(--bg-surface)',
      borderRadius: 10,
      border: `1px solid ${task.completed ? 'var(--border-subtle)' : overdue ? 'rgba(251,191,36,0.2)' : 'var(--border-subtle)'}`,
      transition: 'all 0.2s ease',
      opacity: task.completed ? 0.55 : 1,
    }}>
      <button
        className={`forge-checkbox ${task.completed ? 'checked' : ''}`}
        style={{ marginTop: 1, flexShrink: 0 }}
        onClick={task.completed ? onUncomplete : onComplete}
        aria-label={`${task.completed ? 'Uncheck' : 'Complete'} ${task.title}`}
      >
        {task.completed && <Check size={12} strokeWidth={3} color="#080b0a" />}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          onClick={() => !task.completed && setShowActions(v => !v)}
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
            textDecoration: task.completed ? 'line-through' : 'none',
            cursor: task.completed ? 'default' : 'pointer',
            marginBottom: task.notes || task.tags?.length ? 4 : 0,
            wordBreak: 'break-word',
          }}
        >
          {task.title}
        </div>

        {task.notes && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{task.notes}</div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {task.dueDate && task.dueDate !== today && (
            <span style={{
              fontSize: 11,
              color: overdue ? 'var(--warning)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}>
              <Calendar size={10} />
              {format(new Date(task.dueDate + 'T00:00:00'), 'MMM d')}
            </span>
          )}
          {task.recurring && (
            <span style={{ fontSize: 11, color: 'var(--accent-green)', background: 'rgba(74,222,128,0.08)', padding: '1px 6px', borderRadius: 4 }}>
              ↻ {task.recurring}
            </span>
          )}
          {task.tags?.map(tag => (
            <span key={tag} style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              background: 'var(--bg-elevated)',
              padding: '1px 7px',
              borderRadius: 4,
              border: '1px solid var(--border-subtle)',
            }}>
              {tag}
            </span>
          ))}
        </div>

        {showActions && !task.completed && (
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => { onEdit(); setShowActions(false); }}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 6, color: 'var(--text-secondary)', padding: '4px 10px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              ✏️ Edit
            </button>
            <button
              onClick={onReschedule}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 6, color: 'var(--text-secondary)', padding: '4px 10px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <ArrowRight size={11} /> Tomorrow
            </button>
            <button
              onClick={onDelete}
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 6, color: 'var(--danger)', padding: '4px 10px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Trash2 size={11} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================
// TASKS PAGE
// =============================================
type FilterTab = 'today' | 'all' | 'completed';

export default function TasksPage() {
  const { store, handleAddTask, handleCompleteTask, handleUncompleteTask, handleDeleteTask, handleRescheduleTask, handleUpdateTask } = useForge();
  const [showAdd, setShowAdd] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<FilterTab>('today');
  const [quickTitle, setQuickTitle] = useState('');
  const quickRef = useRef<HTMLInputElement>(null);

  const today = todayStr();
  const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

  const todayTasks = store.tasks.filter(t => !t.completed && (t.dueDate === today || !t.dueDate));
  const overdueTasks = store.tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today);
  const upcomingTasks = store.tasks.filter(t => !t.completed && t.dueDate && t.dueDate > today);
  const completedTasks = store.tasks.filter(t => t.completed);
  const allActiveTasks = store.tasks.filter(t => !t.completed);

  const handleQuickAdd = () => {
    if (!quickTitle.trim()) return;
    handleAddTask({ title: quickTitle.trim(), dueDate: today });
    setQuickTitle('');
    quickRef.current?.focus();
  };

  const handleSaveEdit = (data: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    if (!editingTask) return;
    handleUpdateTask(editingTask.id, data);
    setEditingTask(null);
  };

  const taskSection = (title: string, tasks: Task[], isOverdue = false, isCompleted = false) => (
    tasks.length > 0 && (
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: isOverdue ? 'var(--warning)' : isCompleted ? 'var(--text-muted)' : 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          {title} · {tasks.length}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {tasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              overdue={isOverdue}
              onComplete={() => handleCompleteTask(task.id)}
              onUncomplete={() => handleUncompleteTask(task.id)}
              onDelete={() => handleDeleteTask(task.id)}
              onReschedule={() => handleRescheduleTask(task.id, tomorrow)}
              onEdit={() => setEditingTask(task)}
            />
          ))}
        </div>
      </div>
    )
  );

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px' }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 4 }}>
            Tasks
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {allActiveTasks.length === 0 ? 'No tasks pending.' : `${allActiveTasks.length} active · 5 pts each when completed`}
          </p>
        </div>
        <button className="forge-btn forge-btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Quick capture */}
      <div className="animate-fade-up delay-100" style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          ref={quickRef}
          className="forge-input"
          value={quickTitle}
          onChange={e => setQuickTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleQuickAdd()}
          placeholder="Quick capture — press Enter to add for today..."
          id="tasks-quick-capture"
        />
        <button
          className="forge-btn forge-btn-primary"
          onClick={handleQuickAdd}
          style={{ padding: '10px 14px', flexShrink: 0 }}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Stats */}
      {store.tasks.length > 0 && (
        <div className="animate-fade-up delay-100" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Due Today', value: todayTasks.length + overdueTasks.length, warn: overdueTasks.length > 0 },
            { label: 'Upcoming', value: upcomingTasks.length, warn: false },
            { label: 'Completed', value: completedTasks.length, warn: false },
          ].map(s => (
            <div key={s.label} style={{
              padding: '12px',
              background: 'var(--bg-surface)',
              border: `1px solid ${s.warn ? 'rgba(251,191,36,0.2)' : 'var(--border-subtle)'}`,
              borderRadius: 10,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.warn ? 'var(--warning)' : 'var(--accent-green)', letterSpacing: '-0.5px' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="animate-fade-up delay-200" style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {(['today', 'all', 'completed'] as FilterTab[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${filter === f ? 'rgba(74,222,128,0.3)' : 'var(--border-subtle)'}`,
              background: filter === f ? 'var(--accent-glow)' : 'var(--bg-surface)',
              color: filter === f ? 'var(--accent-green)' : 'var(--text-muted)',
              fontSize: 13,
              fontWeight: filter === f ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textTransform: 'capitalize',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task sections */}
      <div className="animate-fade-up delay-200">
        {filter === 'today' && (
          <>
            {taskSection('Overdue', overdueTasks, true)}
            {taskSection('Today', todayTasks)}
            {todayTasks.length === 0 && overdueTasks.length === 0 && (
              <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, background: 'var(--bg-surface)', borderRadius: 12, border: '1px dashed var(--border-default)' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                All caught up! No tasks due today.
              </div>
            )}
          </>
        )}

        {filter === 'all' && (
          <>
            {taskSection('Overdue', overdueTasks, true)}
            {taskSection('Today', todayTasks)}
            {taskSection('Upcoming', upcomingTasks)}
            {allActiveTasks.length === 0 && (
              <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, background: 'var(--bg-surface)', borderRadius: 12, border: '1px dashed var(--border-default)' }}>
                No tasks. Add one above.
              </div>
            )}
          </>
        )}

        {filter === 'completed' && (
          <>
            {taskSection('Completed', completedTasks, false, true)}
            {completedTasks.length === 0 && (
              <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, background: 'var(--bg-surface)', borderRadius: 12, border: '1px dashed var(--border-default)' }}>
                No completed tasks yet.
              </div>
            )}
          </>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <TaskForm
          onSave={(data) => { handleAddTask(data); setShowAdd(false); }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {/* Edit modal */}
      {editingTask && (
        <TaskForm
          initial={editingTask}
          onSave={handleSaveEdit}
          onCancel={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
