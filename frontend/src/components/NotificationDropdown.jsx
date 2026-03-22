'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { get, patch, post } from '@/lib/api';

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const initialLoadDoneRef = useRef(false);
  const unreadCount = notifications.filter((n) => !n.is_read).length + pendingInvites.length;

  const loadNotifications = useCallback(async () => {
    try {
      const data = await get('/notifications');
      setNotifications(data);
    } catch (err) { /* silent */ }
  }, []);

  const loadPendingInvites = useCallback(async () => {
    try {
      const data = await get('/invitations/pending');
      setPendingInvites(data);
    } catch (err) { /* silent */ }
  }, []);

  useEffect(() => {
    if (initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = true;

    const initialTimer = window.setTimeout(() => {
      loadNotifications();
      loadPendingInvites();
    }, 0);

    const interval = setInterval(() => {
      loadNotifications();
      loadPendingInvites();
    }, 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [loadNotifications, loadPendingInvites]);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function markAsRead(id) {
    try {
      await patch(`/notifications/${id}/read`, {});
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  }

  async function markAllRead() {
    try {
      await patch('/notifications/read-all', {});
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAcceptInvite(boardId) {
    try {
      await post(`/invitations/${boardId}/accept`, {});
      setPendingInvites((prev) => prev.filter((i) => i.board_id !== boardId));
      loadNotifications();
      // Notify dashboard to reload boards immediately
      window.dispatchEvent(new CustomEvent('board:accepted', { detail: { boardId } }));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRejectInvite(boardId) {
    try {
      await post(`/invitations/${boardId}/reject`, {});
      setPendingInvites((prev) => prev.filter((i) => i.board_id !== boardId));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '8px 12px', cursor: 'pointer',
          color: 'var(--text-primary)', fontSize: 16, position: 'relative',
          transition: 'border-color 0.2s',
        }}
        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: 'var(--danger)', color: '#fff',
            borderRadius: '50%', width: 18, height: 18,
            fontSize: 10, fontWeight: 700, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="animate-fade-in" style={{
          position: 'absolute', top: '100%', right: 0, zIndex: 100,
          width: 370, marginTop: 8, background: 'var(--bg-card)',
          border: '1px solid var(--border)', borderRadius: 14,
          boxShadow: '0 15px 40px rgba(0,0,0,0.5)', overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Notifications</span>
            {notifications.some((n) => !n.is_read) && (
              <button onClick={markAllRead} style={{
                background: 'none', border: 'none', color: 'var(--accent-light)',
                fontSize: 12, cursor: 'pointer', fontWeight: 500,
              }}>Mark all read</button>
            )}
          </div>

          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {/* Pending Invitations */}
            {pendingInvites.length > 0 && (
              <div>
                <div style={{
                  padding: '8px 16px', background: 'rgba(124,58,237,0.08)',
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.5px', color: 'var(--accent-light)',
                }}>📨 Pending Invitations</div>
                {pendingInvites.map((invite) => (
                  <div key={invite.board_id} style={{
                    padding: '14px 16px', borderBottom: '1px solid var(--border)',
                    background: 'rgba(124,58,237,0.04)',
                  }}>
                    <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      You&apos;ve been invited to <strong>{invite.board_name}</strong>
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleAcceptInvite(invite.board_id)}
                        style={{
                          padding: '6px 16px', borderRadius: 8, border: 'none',
                          background: 'var(--success)', color: '#fff',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          transition: 'opacity 0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                      >✓ Accept</button>
                      <button
                        onClick={() => handleRejectInvite(invite.board_id)}
                        style={{
                          padding: '6px 16px', borderRadius: 8,
                          border: '1px solid var(--danger)', background: 'transparent',
                          color: 'var(--danger)', fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--danger)'; }}
                      >✕ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Regular Notifications */}
            {notifications.length === 0 && pendingInvites.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  style={{
                    padding: '12px 16px', borderBottom: '1px solid var(--border)',
                    cursor: 'pointer', transition: 'background 0.15s',
                    background: n.is_read ? 'transparent' : 'rgba(124,58,237,0.05)',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseOut={(e) => e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(124,58,237,0.05)'}
                >
                  <div style={{ display: 'flex', alignItems: 'start', gap: 10 }}>
                    {!n.is_read && (
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: 'var(--accent)', flexShrink: 0, marginTop: 5,
                      }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {n.type === 'assignment' ? '📌 ' : n.type === 'invitation' ? '📨 ' : ''}{n.message}
                      </p>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
