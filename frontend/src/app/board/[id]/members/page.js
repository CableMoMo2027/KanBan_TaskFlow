'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { get, del, post } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import InviteMemberModal from '@/components/InviteMemberModal';
import NotificationDropdown from '@/components/NotificationDropdown';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';

export default function BoardMembersPage() {
  const params = useParams();
  const boardId = params.id;
  const { user } = useAuth();
  const [board, setBoard] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [bData, mData] = await Promise.all([
        get(`/boards/${boardId}`),
        get(`/boards/${boardId}/members/all`),
      ]);
      setBoard(bData);
      setMembers(mData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    if (user && boardId) loadData();
  }, [user, boardId, loadData]);

  const handleRemove = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await del(`/boards/${boardId}/members/${userId}`);
      setMembers(members.filter((m) => m.id !== userId));
    } catch (err) {
      alert(err.message || 'Failed to remove member');
    }
  };

  const isOwner = board?.owner_id === user?.id;

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: 'var(--text-muted)' }}>Loading...</div></div>;

  return (
    <div className="app-layout">
      <Sidebar boardId={boardId} boardName={board?.name} />
      <main className="app-content">
        {/* Top Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 28px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
            <Link href="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Dashboard</Link>
            <span>/</span>
            <Link href={`/board/${boardId}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{board?.name}</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Members</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <ThemeToggle />
            <NotificationDropdown />
            {isOwner && (
              <button onClick={() => setShowInvite(true)} style={{
                padding: '8px 18px', borderRadius: 8, border: 'none',
                background: 'var(--accent)', color: '#fff', fontSize: 13,
                fontWeight: 600, cursor: 'pointer',
              }}>+ Invite Member</button>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '32px', maxWidth: 720 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Members</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
            {members.length} member{members.length !== 1 ? 's' : ''} in this board
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {members.map((m) => (
              <div key={m.id} style={{
                background: 'var(--bg-card)', borderRadius: 12, padding: '14px 20px',
                border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: m.id === board?.owner_id ? 'var(--accent)' : 'var(--success)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>{m.name?.charAt(0).toUpperCase()}</div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{m.name}</span>
                    {m.id === board?.owner_id && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        background: 'var(--accent-bg)', color: 'var(--accent)',
                        textTransform: 'uppercase',
                      }}>Owner</span>
                    )}
                    {m.status === 'pending' && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        background: 'var(--warning-bg)', color: 'var(--warning)',
                        textTransform: 'uppercase',
                      }}>Pending</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.email}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{m.role}</span>
                  {isOwner && m.id !== user?.id && (
                    <button onClick={() => handleRemove(m.id)} style={{
                      padding: '6px 12px', borderRadius: 7, border: '1.5px solid var(--border)',
                      background: 'var(--bg-card)', color: 'var(--danger)', fontSize: 12,
                      fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                    }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                    >Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <InviteMemberModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        boardId={boardId}
        onInvited={loadData}
      />
    </div>
  );
}

