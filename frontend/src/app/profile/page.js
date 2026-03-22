'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { get, patch } from '@/lib/api';
import { navigateWithTransition } from '@/lib/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigateWithTransition(router, '/login', { replace: true });
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  async function loadProfile() {
    try {
      const data = await get('/auth/me');
      setProfile(data);
      setName(data.name);
    } catch (err) {
      console.error(err);
    }
  }

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    try {
      const updated = await patch('/auth/profile', { name });
      setProfile(updated);
      setSuccess('Profile updated!');
      // Update localStorage too
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, name: updated.name }));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user || !profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 28px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/dashboard" style={{
            color: 'var(--text-muted)', textDecoration: 'none',
            fontSize: 18, padding: '4px 8px', borderRadius: 6,
          }}>← Back</Link>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>My Profile</h1>
        </div>
        <button onClick={logout} style={{
          padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
          background: 'transparent', color: 'var(--text-muted)', fontSize: 13,
          cursor: 'pointer',
        }}>Logout</button>
      </div>

      {/* Profile Content */}
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '40px 20px' }}>
        <div className="animate-fade-in" style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: 32,
        }}>
          {/* Avatar */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--accent)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontWeight: 800, color: '#fff',
              margin: '0 auto 12px',
            }}>{profile.name?.charAt(0).toUpperCase()}</div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13 }}>{profile.email}</p>
          </div>

          {success && (
            <div style={{
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 8, padding: '8px 12px', marginBottom: 16,
              color: 'var(--success)', fontSize: 13, textAlign: 'center',
            }}>{success}</div>
          )}

          {/* Name */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Display Name
            </label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10,
                border: '1px solid var(--border)', background: 'var(--bg-secondary)',
                color: 'var(--text-primary)', fontSize: 14, outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Email (read-only) */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email" value={profile.email} readOnly
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10,
                border: '1px solid var(--border)', background: 'var(--bg-tertiary)',
                color: 'var(--text-muted)', fontSize: 14, outline: 'none',
                cursor: 'not-allowed',
              }}
            />
          </div>

          {/* Joined */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Joined
            </label>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)' }}>
              {new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <button onClick={handleSave} disabled={saving || name === profile.name} style={{
            width: '100%', padding: '12px', borderRadius: 10, border: 'none',
            background: name === profile.name ? 'var(--surface)' : 'var(--accent)',
            color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: name === profile.name ? 'not-allowed' : 'pointer',
          }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

