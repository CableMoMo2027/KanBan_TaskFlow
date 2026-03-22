'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { navigateWithTransition } from '@/lib/navigation';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigateWithTransition(router, '/dashboard', { replace: true });
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 50%, var(--bg-primary) 100%)',
    }}>
      <div className="animate-slide-up" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>📋</div>
        <h1 style={{ margin: 0, fontSize: 48, fontWeight: 900, letterSpacing: '-1px' }}>
          Task<span style={{ color: 'var(--accent)' }}>Flow</span>
        </h1>
        <p style={{ margin: '12px 0 36px', color: 'var(--text-secondary)', fontSize: 18, maxWidth: 400 }}>
          A premium Kanban board for team collaboration and task management
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          <Link href="/login" style={{
            padding: '12px 32px', borderRadius: 12, background: 'var(--accent)',
            color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 600,
            boxShadow: '0 4px 15px var(--accent-glow)', transition: 'transform 0.2s',
          }}>Sign In</Link>
          <Link href="/register" style={{
            padding: '12px 32px', borderRadius: 12,
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-primary)', textDecoration: 'none',
            fontSize: 15, fontWeight: 600, transition: 'border-color 0.2s',
          }}>Create Account</Link>
        </div>
      </div>
    </div>
  );
}
