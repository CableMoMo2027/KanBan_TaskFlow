'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { patch } from '@/lib/api';
import NotificationDropdown from './NotificationDropdown';
import Link from 'next/link';

export default function BoardHeader({ board, onBoardUpdated, onInviteClick }) {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(board?.name || '');

  const handleRename = async () => {
    if (!name.trim() || name === board.name) {
      setName(board.name);
      setEditing(false);
      return;
    }
    try {
      const updated = await patch(`/boards/${board.id}`, { name: name.trim() });
      onBoardUpdated?.(updated);
      setEditing(false);
    } catch (err) {
      console.error(err);
      setName(board.name);
      setEditing(false);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 24px', background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/dashboard" style={{
          color: 'var(--text-muted)', textDecoration: 'none',
          fontSize: 18, padding: '4px 8px', borderRadius: 6,
          transition: 'color 0.2s',
        }}>←</Link>

        {editing ? (
          <input
            type="text" value={name} autoFocus
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setName(board.name); setEditing(false); } }}
            style={{
              background: 'var(--bg-primary)', border: '1px solid var(--accent)',
              borderRadius: 8, padding: '6px 12px', color: 'var(--text-primary)',
              fontSize: 18, fontWeight: 700, outline: 'none', width: 300,
            }}
          />
        ) : (
          <h1
            onClick={() => setEditing(true)}
            style={{
              margin: 0, fontSize: 18, fontWeight: 700, cursor: 'pointer',
              padding: '6px 12px', borderRadius: 8, transition: 'background 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            title="Click to rename"
          >{board?.name}</h1>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Members */}
        {board?.members && (
          <div style={{ display: 'flex', marginRight: 4 }}>
            {board.members.slice(0, 4).map((m, i) => (
              <div key={m.id} title={m.name} style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'var(--accent)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff',
                border: '2px solid var(--bg-secondary)',
                marginLeft: i > 0 ? -8 : 0, zIndex: 4 - i,
              }}>{m.name.charAt(0).toUpperCase()}</div>
            ))}
            {board.members.length > 4 && (
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'var(--surface)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
                border: '2px solid var(--bg-secondary)', marginLeft: -8,
              }}>+{board.members.length - 4}</div>
            )}
          </div>
        )}

        <button onClick={onInviteClick} style={{
          padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
          background: 'var(--surface)', color: 'var(--text-primary)',
          fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'border-color 0.2s',
        }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        >+ Invite</button>

        <NotificationDropdown />

        <button onClick={logout} style={{
          padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
          background: 'transparent', color: 'var(--text-muted)',
          fontSize: 13, cursor: 'pointer', transition: 'color 0.2s',
        }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >Logout</button>
      </div>
    </div>
  );
}
