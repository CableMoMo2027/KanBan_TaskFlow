'use client';

import { useState, useRef, useEffect } from 'react';

export default function AssignMemberDropdown({ members, currentAssignee, onAssign }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentMember = members.find((m) => m.id === currentAssignee);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 8,
          border: '1px solid var(--border)', background: 'var(--bg-secondary)',
          color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          textAlign: 'left',
        }}
      >
        <span>{currentMember ? `${currentMember.name} (${currentMember.email})` : 'Unassigned'}</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>▼</span>
      </button>

      {isOpen && (
        <div className="animate-fade-in" style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 10, marginTop: 4, maxHeight: 200, overflowY: 'auto',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        }}>
          <div
            onClick={() => { onAssign(null); setIsOpen(false); }}
            style={{
              padding: '10px 14px', cursor: 'pointer', fontSize: 13,
              color: 'var(--text-muted)', borderBottom: '1px solid var(--border)',
              transition: 'background 0.15s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >Unassign</div>
          {members.map((m) => (
            <div
              key={m.id}
              onClick={() => { onAssign(m.id); setIsOpen(false); }}
              style={{
                padding: '10px 14px', cursor: 'pointer', fontSize: 13,
                color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10,
                background: m.id === currentAssignee ? 'var(--surface)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
              onMouseOut={(e) => e.currentTarget.style.background = m.id === currentAssignee ? 'var(--surface)' : 'transparent'}
            >
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'var(--accent)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff',
                flexShrink: 0,
              }}>{m.name.charAt(0).toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{m.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.email}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
