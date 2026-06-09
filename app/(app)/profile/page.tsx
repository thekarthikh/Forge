'use client';

import { useState } from 'react';
import { useForge } from '@/lib/context';
import { BADGE_DEFINITIONS } from '@/lib/badges';
import { format, parseISO } from 'date-fns';
import { Trophy, Check } from 'lucide-react';

// =============================================
// GOAL OPTIONS
// =============================================
const GOAL_OPTIONS: { value: 'fitness' | 'work' | 'study' | 'personal'; label: string; emoji: string }[] = [
  { value: 'fitness', label: 'Fitness', emoji: '💪' },
  { value: 'work', label: 'Work & Career', emoji: '💼' },
  { value: 'study', label: 'Learning & Study', emoji: '📚' },
  { value: 'personal', label: 'Personal Growth', emoji: '🌱' },
];

// =============================================
// BADGE GRID
// =============================================
function BadgeGrid() {
  const { store, streak } = useForge();
  const earnedIds = new Set(store.earnedBadges.map(b => b.badgeId));
  const badgeCheckData = {
    streak,
    dailyScores: store.dailyScores,
    habits: store.habits,
    completions: store.completions,
  };

  // Re-evaluate which badges are earned (live check)
  const liveEarned = new Set(
    BADGE_DEFINITIONS.filter(b => b.check(badgeCheckData)).map(b => b.id)
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
      {BADGE_DEFINITIONS.map(badge => {
        const earned = liveEarned.has(badge.id);
        return (
          <div
            key={badge.id}
            style={{
              padding: '14px 12px',
              background: earned ? 'rgba(74,222,128,0.06)' : 'var(--bg-elevated)',
              border: `1px solid ${earned ? 'rgba(74,222,128,0.25)' : 'var(--border-subtle)'}`,
              borderRadius: 12,
              textAlign: 'center',
              opacity: earned ? 1 : 0.45,
              transition: 'all 0.2s ease',
              position: 'relative',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>{badge.emoji}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: earned ? 'var(--text-primary)' : 'var(--text-muted)', marginBottom: 3 }}>
              {badge.name}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {badge.description}
            </div>
            {earned && (
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'var(--accent-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Check size={10} strokeWidth={3} color="#080b0a" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// =============================================
// STAT CARD
// =============================================
function StatCard({ icon, label, value, unit }: { icon: string; label: string; value: number | string; unit?: string }) {
  return (
    <div style={{
      padding: '16px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}>
      <div style={{ fontSize: 20 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1 }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {unit && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{unit}</div>}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// =============================================
// PROFILE PAGE
// =============================================
export default function ProfilePage() {
  const { store, streak, handleUpdateProfile, handleResetAllData } = useForge();
  const profile = store.profile;

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(profile.name);
  const [draftGoal, setDraftGoal] = useState<'fitness' | 'work' | 'study' | 'personal' | ''>(profile.goal);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const earnedBadgeCount = BADGE_DEFINITIONS.filter(b =>
    b.check({ streak, dailyScores: store.dailyScores, habits: store.habits, completions: store.completions })
  ).length;

  const handleSaveProfile = () => {
    handleUpdateProfile({ name: draftName.trim(), goal: draftGoal as any });
    setEditing(false);
  };

  const handleReset = async () => {
    await handleResetAllData();
    setShowResetConfirm(false);
  };

  const memberSince = profile.createdAt
    ? format(parseISO(profile.createdAt), 'MMMM yyyy')
    : '—';

  const goalInfo = GOAL_OPTIONS.find(g => g.value === profile.goal);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px' }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 4 }}>
          Profile
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Your identity. Your forge.
        </p>
      </div>

      {/* Profile card */}
      <div className="animate-fade-up delay-100 forge-card" style={{ padding: 24, marginBottom: 20 }}>
        {!editing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {/* Avatar */}
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(74,222,128,0.2), rgba(74,222,128,0.05))',
              border: '2px solid rgba(74,222,128,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              flexShrink: 0,
            }}>
              {goalInfo?.emoji ?? '⚡'}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
                {profile.name || 'Anonymous Forger'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {goalInfo && (
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--accent-green)',
                    background: 'rgba(74,222,128,0.08)',
                    border: '1px solid rgba(74,222,128,0.2)',
                    padding: '2px 10px',
                    borderRadius: 'var(--radius-full)',
                  }}>
                    {goalInfo.label}
                  </span>
                )}
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Member since {memberSince}</span>
              </div>
              {profile.isPro && (
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-green)' }}>⚡ Forge Pro</span>
                  {profile.proExpiresAt && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      · expires {format(parseISO(profile.proExpiresAt), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              className="forge-btn forge-btn-ghost"
              onClick={() => { setDraftName(profile.name); setDraftGoal(profile.goal); setEditing(true); }}
              style={{ padding: '8px 16px', fontSize: 13, flexShrink: 0 }}
            >
              Edit
            </button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                Your Name
              </label>
              <input
                autoFocus
                className="forge-input"
                value={draftName}
                onChange={e => setDraftName(e.target.value)}
                placeholder="Enter your name..."
                onKeyDown={e => e.key === 'Enter' && handleSaveProfile()}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                Primary Goal
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {GOAL_OPTIONS.map(opt => (
                  <label
                    key={opt.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      background: draftGoal === opt.value ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                      border: `1px solid ${draftGoal === opt.value ? 'rgba(74,222,128,0.3)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="goal"
                      value={opt.value}
                      checked={draftGoal === opt.value}
                      onChange={() => setDraftGoal(opt.value)}
                      style={{ display: 'none' }}
                    />
                    <span style={{ fontSize: 18 }}>{opt.emoji}</span>
                    <span style={{ fontSize: 14, color: draftGoal === opt.value ? 'var(--accent-green)' : 'var(--text-secondary)', fontWeight: draftGoal === opt.value ? 600 : 400 }}>
                      {opt.label}
                    </span>
                    {draftGoal === opt.value && <Check size={14} color="var(--accent-green)" style={{ marginLeft: 'auto' }} />}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="forge-btn forge-btn-ghost" onClick={() => setEditing(false)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button className="forge-btn forge-btn-primary" onClick={handleSaveProfile} style={{ flex: 2 }}>
                <Check size={16} /> Save Profile
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="animate-fade-up delay-200" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 24 }}>
        <StatCard icon="🔥" label="Current Streak" value={streak.currentStreak} unit="days" />
        <StatCard icon="🏆" label="Best Streak" value={streak.bestStreak} unit="days" />
        <StatCard icon="📅" label="Days Tracked" value={streak.totalDaysTracked} />
        <StatCard icon="💚" label="Habits Done" value={streak.totalHabitsCompleted} />
        <StatCard icon="✅" label="Tasks Done" value={streak.totalTasksCompleted} />
        <StatCard icon="🎖️" label="Badges" value={`${earnedBadgeCount}/${BADGE_DEFINITIONS.length}`} />
      </div>

      {/* Badges */}
      <div className="animate-fade-up delay-300" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Trophy size={16} color="var(--warning)" />
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Badges
          </h2>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {earnedBadgeCount}/{BADGE_DEFINITIONS.length} earned
          </span>
        </div>
        <BadgeGrid />
      </div>

      {/* Pro upsell (if not pro) */}
      {!profile.isPro && (
        <div className="animate-fade-up delay-300" style={{ marginBottom: 24 }}>
          <a href="/upgrade" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{
              padding: 20,
              background: 'linear-gradient(135deg, rgba(74,222,128,0.1), rgba(74,222,128,0.04))',
              border: '1px solid rgba(74,222,128,0.25)',
              borderRadius: 16,
              cursor: 'pointer',
              transition: 'border-color 0.2s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 28 }}>⚡</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-green)' }}>Upgrade to Forge Pro</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>₹1,999/year · cancel anytime</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 18, color: 'var(--accent-green)' }}>→</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {['Unlimited habits', 'Full history export', 'Shareable streak cards', 'Priority support'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <Check size={11} color="var(--accent-green)" /> {f}
                  </div>
                ))}
              </div>
            </div>
          </a>
        </div>
      )}

      {/* Danger zone */}
      <div className="animate-fade-up delay-400">
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          Danger Zone
        </div>
        <div style={{
          padding: '16px',
          background: 'rgba(248,113,113,0.04)',
          border: '1px solid rgba(248,113,113,0.15)',
          borderRadius: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Reset All Data</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Permanently deletes all habits, tasks, scores, and badges.</div>
            </div>
            <button
              className="forge-btn forge-btn-danger"
              onClick={() => setShowResetConfirm(true)}
              style={{ flexShrink: 0, fontSize: 13, padding: '8px 16px' }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Reset confirm modal */}
      {showResetConfirm && (
        <div className="forge-overlay" onClick={() => setShowResetConfirm(false)}>
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'var(--bg-elevated)',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 'var(--radius-xl)',
              padding: 28,
              maxWidth: 380,
              width: 'calc(100% - 32px)',
              boxShadow: 'var(--shadow-card)',
              animation: 'fade-up 0.2s ease forwards',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                This can't be undone
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                You will lose your entire forge history — all {streak.currentStreak > 0 ? `${streak.currentStreak}-day streak, ` : ''}{streak.totalDaysTracked} days tracked, {store.habits.length} habits, and all badges.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="forge-btn forge-btn-ghost" onClick={() => setShowResetConfirm(false)} style={{ flex: 1 }}>
                Keep my data
              </button>
              <button className="forge-btn forge-btn-danger" onClick={handleReset} style={{ flex: 1 }}>
                Reset everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
