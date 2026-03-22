'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

// HOME sidebar — minimal
const HOME_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { href: '/my-tasks', label: 'My Tasks', icon: '✓' },
  { href: '/archive', label: 'Archive', icon: '🗄' },
];

// BOARD sidebar — includes Members
const BOARD_NAV = (boardId) => [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { href: '/my-tasks', label: 'My Tasks', icon: '✓' },
  { href: `/board/${boardId}/members`, label: 'Members', icon: '👥' },
  { href: '/archive', label: 'Archive', icon: '🗄' },
];

export default function Sidebar({ boardId, boardName }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = boardId ? BOARD_NAV(boardId) : HOME_NAV;

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: 'var(--sidebar-width)',
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      zIndex: 50,
      transition: 'width 0.22s ease, box-shadow 0.22s ease, background 0.3s ease',
      overflow: 'hidden',
      boxShadow: '4px 0 20px rgba(0,0,0,0.06)',
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 16px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--accent-bg)',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}>
          <Link href="/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            minWidth: 0,
            textDecoration: 'none',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'linear-gradient(135deg, #7b7ff6 0%, #5b5ef4 55%, #4338ca 100%)',
              display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: '#fff', fontWeight: 800,
              boxShadow: '0 10px 20px rgba(91, 94, 244, 0.25)',
              flexShrink: 0,
            }}>T</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.2, color: 'var(--text-primary)' }}>TaskFlow</div>
              <div style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginTop: 2,
              }}>{boardName || 'Workspace'}</div>
            </div>
          </Link>
        </div>
      </div>

      {/* New Board Button */}
      <div style={{ padding: '12px 12px 8px' }}>
        <Link href="/dashboard" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '10px 16px', borderRadius: 14,
          background: 'linear-gradient(135deg, #7b7ff6 0%, #5b5ef4 55%, #4338ca 100%)', color: '#fff',
          textDecoration: 'none', fontSize: 13, fontWeight: 600,
          transition: 'transform 0.15s, box-shadow 0.2s, background 0.2s',
          boxShadow: '0 10px 22px rgba(91, 94, 244, 0.24)',
        }}
          title="New Board"
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 14px 28px rgba(91, 94, 244, 0.28)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 10px 22px rgba(91, 94, 244, 0.24)';
          }}
        >
          <span style={{ fontSize: 16 }}>+</span>
          New Board
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 10px', overflowY: 'auto' }}>
        <div style={{
          padding: '8px 12px 10px',
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.9px',
          textTransform: 'uppercase',
          color: '#7c85a3',
        }}>
          Navigation
        </div>
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href || (label === 'Members' && pathname?.includes('/members'));
          return (
            <Link key={href + label} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 12px', borderRadius: 12, marginBottom: 6,
              textDecoration: 'none', fontSize: 13, fontWeight: active ? 600 : 400,
              color: active ? 'var(--accent)' : 'var(--text-secondary)',
              background: active ? 'linear-gradient(90deg, rgba(91, 94, 244, 0.14) 0%, rgba(91, 94, 244, 0.05) 100%)' : 'transparent',
              transition: 'all 0.15s',
              justifyContent: 'flex-start',
              border: active ? '1px solid rgba(91, 94, 244, 0.12)' : '1px solid transparent',
              boxShadow: active ? '0 8px 18px rgba(91, 94, 244, 0.08)' : 'none',
              position: 'relative',
            }}
              title={label}
              onMouseOver={(e) => { if (!active) { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
              onMouseOut={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
            >
              {active && (
                <span style={{
                  position: 'absolute',
                  left: 0,
                  top: 8,
                  bottom: 8,
                  width: 4,
                  borderRadius: 999,
                  background: 'var(--accent)',
                }} />
              )}
              <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{icon}</span>
              {label}
            </Link>
          );
        })}

      </nav>

      {/* User + Logout */}
      <div style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <Link href="/profile" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 16px 10px', textDecoration: 'none',
          transition: 'background 0.15s',
          justifyContent: 'flex-start',
          borderRadius: 12,
        }}
          title={user?.name || 'Profile'}
          onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7b7ff6 0%, #5b5ef4 55%, #4338ca 100%)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
            boxShadow: '0 8px 18px rgba(91, 94, 244, 0.2)',
          }}>{user?.name?.charAt(0).toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Workspace member</div>
          </div>
        </Link>
        <button onClick={logout} style={{
          width: '100%', padding: '10px 16px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, color: 'var(--text-muted)', textAlign: 'left',
          transition: 'color 0.15s',
          justifyContent: 'flex-start',
        }}
          title="Logout"
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >↗ Logout</button>
      </div>
    </aside>
  );
}
