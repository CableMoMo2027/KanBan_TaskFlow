'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { navigateWithTransition } from '@/lib/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      await register(name, email, password);
      navigateWithTransition(router, '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
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
    <div className="auth-page-shell register-enter" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left — Hero */}
      <div className="auth-hero-panel" style={{
        flex: 1, background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #5b5ef4 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 64px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -80, left: -80, width: 300, height: 300,
          borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, right: -60, width: 250, height: 250,
          borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, marginBottom: 28,
          }}>🚀</div>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 16 }}>
            Start Your<br />Journey Today.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 340 }}>
            Join thousands of teams using TaskFlow to organize work, manage tasks, and collaborate seamlessly.
          </p>
        </div>
        <div style={{
          position: 'absolute', bottom: -100, right: -20,
          fontSize: 80, fontWeight: 900, color: 'rgba(255,255,255,0.04)',
          letterSpacing: '-4px', userSelect: 'none',
        }}>TASKFLOW</div>
      </div>

      {/* Right — Form */}
      <div className="auth-form-panel" style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px 64px',
        background: '#fff', maxWidth: 480,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, textDecoration: 'none', width: 'fit-content' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: 16,
          }}>T</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>TaskFlow</span>
        </Link>

        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Create Account</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32 }}>
          Start organizing your work today.
        </p>

        {error && (
          <div style={{
            background: 'var(--danger-bg)', border: '1px solid #fca5a5',
            borderRadius: 8, padding: '10px 14px', marginBottom: 20,
            fontSize: 13, color: 'var(--danger)',
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Full Name', type: 'text', value: name, setter: setName, placeholder: 'John Doe' },
            { label: 'Email Address', type: 'email', value: email, setter: setEmail, placeholder: 'you@example.com' },
            { label: 'Password', type: 'password', value: password, setter: setPassword, placeholder: '••••••••••••' },
            { label: 'Confirm Password', type: 'password', value: confirm, setter: setConfirm, placeholder: '••••••••••••' },
          ].map(({ label, type, value, setter, placeholder }) => (
            <div key={label}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
              <input type={type} value={value} onChange={(e) => setter(e.target.value)}
                placeholder={placeholder} required={label !== 'Confirm Password'} style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          ))}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', borderRadius: 9, border: 'none',
            background: 'var(--accent)', color: '#fff', fontSize: 14,
            fontWeight: 600, cursor: 'pointer', marginTop: 4,
            boxShadow: '0 2px 10px var(--accent-glow)',
          }}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

