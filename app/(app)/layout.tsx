'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForge } from '@/lib/context';
import { Sun, Map, Heart, CheckSquare, User, Zap, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/today', label: 'Today', icon: Sun },
  { href: '/map', label: 'Forge Map', icon: Map },
  { href: '/habits', label: 'Habits', icon: Heart },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { streak, store, user, signOut, isLoading, mounted: _ } = useForge() as any;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // Show minimal loading screen while fetching initial data
  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, background: 'var(--accent-green)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={22} color="#080b0a" strokeWidth={2.5} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading your forge...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Sidebar — desktop */}
      <aside style={{
        width: 220, flexShrink: 0,
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 16px',
        position: 'sticky', top: 0, height: '100vh',
        background: 'var(--bg-surface)',
      }} className="sidebar-desktop">

        {/* Wordmark */}
        <Link href="/today" style={{ textDecoration: 'none', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'var(--accent-green)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="#080b0a" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>forge</span>
          </div>
        </Link>

        {/* Streak badge */}
        {streak.currentStreak > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 12px',
            background: 'rgba(74,222,128,0.08)',
            border: '1px solid rgba(74,222,128,0.15)',
            borderRadius: 10, marginBottom: 20,
          }}>
            <span className="streak-fire">🔥</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-green)', lineHeight: 1 }}>{streak.currentStreak}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>day streak</div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href} className={`nav-item ${active ? 'active' : ''}`} style={{ textDecoration: 'none' }}>
                <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
          {!store.profile.isPro && (
            <Link href="/upgrade" style={{ textDecoration: 'none', display: 'block', marginBottom: 12 }}>
              <div style={{
                padding: '12px',
                background: 'linear-gradient(135deg, rgba(74,222,128,0.1), rgba(74,222,128,0.05))',
                border: '1px solid rgba(74,222,128,0.2)',
                borderRadius: 10, cursor: 'pointer',
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-green)', marginBottom: 2 }}>⚡ Forge Pro</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>Unlimited habits, full stats</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-green)', marginTop: 6 }}>₹1,999/year →</div>
              </div>
            </Link>
          )}

          {/* User row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(74,222,128,0.2), rgba(74,222,128,0.05))',
              border: '1px solid rgba(74,222,128,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13,
            }}>
              {store.profile.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {store.profile.name || user?.email?.split('@')[0] || 'Forger'}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, flexShrink: 0, display: 'flex', alignItems: 'center' }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: 72 }} className="main-content">
        {children}
      </main>

      {/* Bottom tab bar — mobile */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
        zIndex: 40, backdropFilter: 'blur(12px)',
      }} className="bottom-tabs">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '4px 12px', textDecoration: 'none',
              color: active ? 'var(--accent-green)' : 'var(--text-muted)',
              transition: 'color 0.2s',
            }}>
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{label}</span>
            </Link>
          );
        })}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .bottom-tabs { display: flex !important; }
        }
        @media (min-width: 769px) {
          .bottom-tabs { display: none !important; }
        }
      `}</style>
    </div>
  );
}
