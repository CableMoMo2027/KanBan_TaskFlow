'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { navigateWithTransition } from '@/lib/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigateWithTransition(router, '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 8,
    border: '1.5px solid var(--border)', background: '#fff',
    color: 'var(--text-primary)', fontSize: 14, outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div className="auth-page-shell login-enter" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left — Form */}
      <div className="auth-form-panel" style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px 64px',
        background: '#fff', maxWidth: 480,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, textDecoration: 'none', width: 'fit-content' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: 16,
          }}>T</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>TaskFlow</span>
        </Link>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32 }}>
          Enter your credentials to access your taskflow.
        </p>

        {error && (
          <div style={{
            background: 'var(--danger-bg)', border: '1px solid #fca5a5',
            borderRadius: 8, padding: '10px 14px', marginBottom: 20,
            fontSize: 13, color: 'var(--danger)',
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Email Address
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
            </div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••" required style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              Must be at least 6 characters.
            </p>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', borderRadius: 9, border: 'none',
            background: 'var(--accent)', color: '#fff', fontSize: 14,
            fontWeight: 600, cursor: 'pointer', marginTop: 4,
            transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 2px 10px var(--accent-glow)',
          }}
            onMouseOver={(e) => { if (!loading) e.currentTarget.style.background = 'var(--accent-hover)'; }}
            onMouseOut={(e) => e.currentTarget.style.background = 'var(--accent)'}
          >
            {loading ? 'Signing in...' : 'Login to Workspace →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Sign Up
          </Link>
        </p>
      </div>

      {/* Right — Hero */}
      <div className="auth-hero-panel" style={{
        flex: 1, background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #5b5ef4 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 64px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -80, right: -80, width: 300, height: 300,
          borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 200, height: 200,
          borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60, width: 250, height: 250,
          borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, marginBottom: 28, border: '1px solid rgba(255,255,255,0.2)',
          }}>📋</div>
          <h2 style={{
            fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 16,
          }}>Your Workflow,<br />Perfected.</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 36, maxWidth: 340 }}>
            Experience the Precision Atelier. A workspace designed for clarity, focus, and peak architectural output.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '⚡', title: 'Instant Sync', desc: 'Changes propagate across all views instantly' },
              { icon: '🔒', title: 'Secure Core', desc: 'Enterprise-grade encryption for your workspace' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{
                padding: '14px 18px', borderRadius: 12,
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Big logo text */}
          <div style={{
            position: 'absolute', bottom: -160, left: -20,
            fontSize: 96, fontWeight: 900, color: 'rgba(255,255,255,0.04)',
            letterSpacing: '-4px', userSelect: 'none',
            whiteSpace: 'nowrap',
          }}>TASKFLOW</div>
        </div>
      </div>
    </div>
  );
}

