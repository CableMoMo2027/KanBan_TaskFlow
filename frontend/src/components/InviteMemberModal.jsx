'use client';

import { useState } from 'react';
import Modal from './Modal';
import { post } from '@/lib/api';

export default function InviteMemberModal({ isOpen, onClose, boardId, onInvited }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await post(`/boards/${boardId}/members`, { email: email.trim() });
      setSuccess(`Invited ${email} successfully!`);
      setEmail('');
      if (onInvited) onInvited(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Member">
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 8, padding: '8px 12px', marginBottom: 14,
          color: 'var(--danger)', fontSize: 13,
        }}>{error}</div>
      )}
      {success && (
        <div style={{
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 8, padding: '8px 12px', marginBottom: 14,
          color: 'var(--success)', fontSize: 13,
        }}>{success}</div>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address" autoFocus
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 10,
            border: '1px solid var(--border)', background: 'var(--bg-secondary)',
            color: 'var(--text-primary)', fontSize: 14, outline: 'none',
            marginBottom: 16,
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        />
        <button type="submit" disabled={loading || !email.trim()} style={{
          width: '100%', padding: '11px', borderRadius: 10, border: 'none',
          background: !email.trim() ? 'var(--surface)' : 'var(--accent)',
          color: '#fff', fontSize: 14, fontWeight: 600,
          cursor: !email.trim() ? 'not-allowed' : 'pointer',
        }}>
          {loading ? 'Inviting...' : 'Send Invite'}
        </button>
      </form>
    </Modal>
  );
}
